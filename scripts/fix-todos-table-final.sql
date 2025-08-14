-- Add missing columns to todos table for multi-list support
ALTER TABLE todos 
ADD COLUMN IF NOT EXISTS list_id uuid REFERENCES todo_lists(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_todos_list_id ON todos(list_id);
CREATE INDEX IF NOT EXISTS idx_todos_user_id_list_id ON todos(user_id, list_id);

-- Create a default list for each existing user who doesn't have one
INSERT INTO todo_lists (id, user_id, name, order_index, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    up.id,
    '기본 리스트',
    0,
    NOW(),
    NOW()
FROM user_profiles up
WHERE NOT EXISTS (
    SELECT 1 FROM todo_lists tl WHERE tl.user_id = up.id
);

-- Update existing todos to belong to their user's default list
UPDATE todos 
SET list_id = (
    SELECT tl.id 
    FROM todo_lists tl 
    WHERE tl.user_id = todos.user_id 
    AND tl.name = '기본 리스트'
    LIMIT 1
)
WHERE list_id IS NULL;

-- Set order_index for existing todos
UPDATE todos 
SET order_index = row_number() OVER (PARTITION BY list_id ORDER BY created_at) - 1
WHERE order_index IS NULL OR order_index = 0;
