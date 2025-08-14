-- Add missing columns to todos table and migrate existing data
ALTER TABLE todos 
ADD COLUMN IF NOT EXISTS list_id uuid REFERENCES todo_lists(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;

-- Create default list for users who have todos but no lists
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

-- Update existing todos to belong to their user's first list
UPDATE todos 
SET list_id = (
  SELECT id 
  FROM todo_lists 
  WHERE todo_lists.user_id = todos.user_id 
  ORDER BY created_at ASC 
  LIMIT 1
),
order_index = (
  SELECT ROW_NUMBER() OVER (ORDER BY created_at ASC) - 1
  FROM todos t2 
  WHERE t2.user_id = todos.user_id AND t2.id <= todos.id
)
WHERE list_id IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_todos_list_id ON todos(list_id);
CREATE INDEX IF NOT EXISTS idx_todos_order ON todos(list_id, order_index);
