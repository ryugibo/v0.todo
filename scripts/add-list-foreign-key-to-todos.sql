-- Add list_id foreign key column and order_index to todos table
-- This connects todos to todo_lists and enables drag-and-drop ordering

-- First, add the columns
ALTER TABLE todos 
ADD COLUMN list_id uuid,
ADD COLUMN order_index integer DEFAULT 0;

-- Create a default list for each user who has todos but no lists
INSERT INTO todo_lists (id, user_id, name, order_index, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  user_id,
  '기본 리스트',
  0,
  now(),
  now()
FROM (
  SELECT DISTINCT user_id 
  FROM todos 
  WHERE user_id NOT IN (SELECT DISTINCT user_id FROM todo_lists)
) AS users_without_lists;

-- Update existing todos to belong to their user's first list (or newly created default list)
UPDATE todos 
SET list_id = (
  SELECT id 
  FROM todo_lists 
  WHERE todo_lists.user_id = todos.user_id 
  ORDER BY created_at ASC 
  LIMIT 1
),
order_index = (
  SELECT ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1
  FROM todos t2 
  WHERE t2.id = todos.id
)
WHERE list_id IS NULL;

-- Add foreign key constraint
ALTER TABLE todos 
ADD CONSTRAINT fk_todos_list_id 
FOREIGN KEY (list_id) REFERENCES todo_lists(id) ON DELETE CASCADE;

-- Make list_id NOT NULL after updating existing records
ALTER TABLE todos 
ALTER COLUMN list_id SET NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_todos_list_id ON todos(list_id);
CREATE INDEX IF NOT EXISTS idx_todos_order_index ON todos(list_id, order_index);
