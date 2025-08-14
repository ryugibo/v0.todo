-- Add missing columns to todos table
ALTER TABLE todos 
ADD COLUMN IF NOT EXISTS list_id uuid REFERENCES todo_lists(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_todos_list_id ON todos(list_id);
CREATE INDEX IF NOT EXISTS idx_todos_order ON todos(list_id, order_index);

-- Update existing todos to belong to user's default list
DO $$
DECLARE
    user_record RECORD;
    default_list_id uuid;
BEGIN
    -- For each user who has todos but no list_id set
    FOR user_record IN 
        SELECT DISTINCT user_id 
        FROM todos 
        WHERE list_id IS NULL
    LOOP
        -- Get or create default list for this user
        SELECT id INTO default_list_id 
        FROM todo_lists 
        WHERE user_id = user_record.user_id 
        ORDER BY created_at ASC 
        LIMIT 1;
        
        -- If no list exists, create default list
        IF default_list_id IS NULL THEN
            INSERT INTO todo_lists (user_id, name, order_index)
            VALUES (user_record.user_id, '기본 리스트', 0)
            RETURNING id INTO default_list_id;
        END IF;
        
        -- Update todos to belong to default list
        UPDATE todos 
        SET list_id = default_list_id,
            order_index = (
                SELECT COALESCE(MAX(order_index), 0) + 1 
                FROM todos 
                WHERE list_id = default_list_id
            )
        WHERE user_id = user_record.user_id 
        AND list_id IS NULL;
    END LOOP;
END $$;

-- Make list_id NOT NULL after migration
ALTER TABLE todos ALTER COLUMN list_id SET NOT NULL;
