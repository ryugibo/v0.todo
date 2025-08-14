-- Add list_id column to todos table
ALTER TABLE todos ADD COLUMN IF NOT EXISTS list_id UUID REFERENCES todo_lists(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_todos_list_id ON todos(list_id);

-- Update existing todos to belong to the default list
UPDATE todos 
SET list_id = (
  SELECT id FROM todo_lists 
  WHERE user_id = todos.user_id 
  AND name = '기본 리스트'
  LIMIT 1
)
WHERE list_id IS NULL;

-- Make list_id NOT NULL after migration
ALTER TABLE todos ALTER COLUMN list_id SET NOT NULL;

-- Add order_index column for drag and drop ordering within lists
ALTER TABLE todos ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_todos_order ON todos(list_id, order_index);
