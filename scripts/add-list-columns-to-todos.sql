-- Add missing columns to todos table for multi-list functionality
ALTER TABLE todos 
ADD COLUMN IF NOT EXISTS list_id uuid REFERENCES todo_lists(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_todos_list_id ON todos(list_id);
CREATE INDEX IF NOT EXISTS idx_todos_order ON todos(list_id, order_index);

-- Create a default list for each user who has todos but no lists
INSERT INTO todo_lists (id, user_id, name, order_index, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  user_id,
  '기본 리스트',
  0,
  NOW(),
  NOW()
FROM (
  SELECT DISTINCT user_id 
  FROM todos 
  WHERE user_id NOT IN (SELECT DISTINCT user_id FROM todo_lists)
) AS users_without_lists;

-- Assign all todos without list_id to their user's default list
UPDATE todos 
SET list_id = (
  SELECT id 
  FROM todo_lists 
  WHERE todo_lists.user_id = todos.user_id 
  AND todo_lists.name = '기본 리스트'
  LIMIT 1
)
WHERE list_id IS NULL;

-- Set order_index for existing todos
UPDATE todos 
SET order_index = row_number() OVER (PARTITION BY list_id ORDER BY created_at) - 1
WHERE order_index = 0;
