-- Create todo_lists table for managing multiple lists
CREATE TABLE IF NOT EXISTS todo_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_todo_lists_user_id ON todo_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_lists_order ON todo_lists(user_id, order_index);

-- Enable RLS (Row Level Security)
ALTER TABLE todo_lists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own lists" ON todo_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lists" ON todo_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists" ON todo_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists" ON todo_lists
  FOR DELETE USING (auth.uid() = user_id);

-- Create a default list for existing users
INSERT INTO todo_lists (name, user_id, order_index)
SELECT '기본 리스트', id, 0
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM todo_lists WHERE user_id = auth.users.id
);
