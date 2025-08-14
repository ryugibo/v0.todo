-- 통합 데이터베이스 초기화 스크립트
-- 할일 > 목록 > 유저 구조로 설계

-- 1. todo_lists 테이블 생성
CREATE TABLE IF NOT EXISTS todo_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. todos 테이블 생성 (user_id 없이 list_id만 사용)
CREATE TABLE IF NOT EXISTS todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    list_id UUID REFERENCES todo_lists(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_todo_lists_user_id ON todo_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_lists_order ON todo_lists(user_id, order_index);
CREATE INDEX IF NOT EXISTS idx_todos_list_id ON todos(list_id);
CREATE INDEX IF NOT EXISTS idx_todos_order ON todos(list_id, order_index);

-- 4. RLS (Row Level Security) 활성화
ALTER TABLE todo_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 5. RLS 정책 생성 - todo_lists
CREATE POLICY "Users can view their own lists" ON todo_lists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lists" ON todo_lists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists" ON todo_lists
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists" ON todo_lists
    FOR DELETE USING (auth.uid() = user_id);

-- 6. RLS 정책 생성 - todos (list_id를 통해 간접적으로 user 확인)
CREATE POLICY "Users can view todos in their lists" ON todos
    FOR SELECT USING (
        list_id IN (
            SELECT id FROM todo_lists WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert todos in their lists" ON todos
    FOR INSERT WITH CHECK (
        list_id IN (
            SELECT id FROM todo_lists WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update todos in their lists" ON todos
    FOR UPDATE USING (
        list_id IN (
            SELECT id FROM todo_lists WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete todos in their lists" ON todos
    FOR DELETE USING (
        list_id IN (
            SELECT id FROM todo_lists WHERE user_id = auth.uid()
        )
    );

-- 7. 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. 트리거 생성
CREATE TRIGGER update_todo_lists_updated_at 
    BEFORE UPDATE ON todo_lists 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todos_updated_at 
    BEFORE UPDATE ON todos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
