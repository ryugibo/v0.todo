-- Add user_id column to todos table for user-specific todos
ALTER TABLE todos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create an index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);

-- Create a composite index for user_id and created_at for efficient user-specific queries
CREATE INDEX IF NOT EXISTS idx_todos_user_created ON todos(user_id, created_at DESC);

-- Enable Row Level Security (RLS) on todos table
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own todos
CREATE POLICY "Users can view own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own todos
CREATE POLICY "Users can insert own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own todos
CREATE POLICY "Users can update own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own todos
CREATE POLICY "Users can delete own todos" ON todos
  FOR DELETE USING (auth.uid() = user_id);

-- Remove existing sample data (since it doesn't have user_id)
DELETE FROM todos WHERE user_id IS NULL;
