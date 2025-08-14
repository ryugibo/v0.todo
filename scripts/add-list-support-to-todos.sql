-- Add list_id and order_index columns to todos table for multi-list support
ALTER TABLE todos 
ADD COLUMN list_id uuid REFERENCES todo_lists(id) ON DELETE CASCADE,
ADD COLUMN order_index integer DEFAULT 0;

-- Create index for better performance
CREATE INDEX idx_todos_list_id ON todos(list_id);
CREATE INDEX idx_todos_order_index ON todos(order_index);

-- Create a default list for each user and migrate existing todos
DO $$
DECLARE
    user_record RECORD;
    default_list_id uuid;
BEGIN
    -- For each user who has todos but no lists
    FOR user_record IN 
        SELECT DISTINCT user_id 
        FROM todos 
        WHERE user_id NOT IN (SELECT user_id FROM todo_lists)
    LOOP
        -- Create a default list for this user
        INSERT INTO todo_lists (id, user_id, name, order_index, created_at, updated_at)
        VALUES (gen_random_uuid(), user_record.user_id, '기본 리스트', 0, NOW(), NOW())
        RETURNING id INTO default_list_id;
        
        -- Move all existing todos to this default list
        UPDATE todos 
        SET list_id = default_list_id, order_index = 0
        WHERE user_id = user_record.user_id AND list_id IS NULL;
    END LOOP;
END $$;

-- Make list_id NOT NULL after migration
ALTER TABLE todos ALTER COLUMN list_id SET NOT NULL;
