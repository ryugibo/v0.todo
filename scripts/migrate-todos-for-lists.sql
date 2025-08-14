-- Add list_id and order_index columns to todos table
ALTER TABLE todos 
ADD COLUMN IF NOT EXISTS list_id uuid REFERENCES todo_lists(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;

-- Create default list for existing users and assign their todos
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
        INSERT INTO todo_lists (user_id, name, order_index)
        VALUES (user_record.user_id, '기본 리스트', 0)
        RETURNING id INTO default_list_id;
        
        -- Assign all their todos to this default list
        UPDATE todos 
        SET list_id = default_list_id,
            order_index = (
                SELECT ROW_NUMBER() OVER (ORDER BY created_at) - 1
                FROM todos t2 
                WHERE t2.user_id = user_record.user_id 
                AND t2.id = todos.id
            )
        WHERE user_id = user_record.user_id;
    END LOOP;
END $$;

-- Make list_id NOT NULL after migration
ALTER TABLE todos ALTER COLUMN list_id SET NOT NULL;
