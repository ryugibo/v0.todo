-- 기존 데이터 모두 삭제하고 올바른 구조로 재구성

-- 1. 기존 데이터 삭제
DELETE FROM todos;
DELETE FROM todo_lists;
DELETE FROM user_profiles;

-- 2. todos 테이블에서 user_id 컬럼 제거 (할일 > 목록 > 유저 구조이므로 불필요)
ALTER TABLE todos DROP COLUMN IF EXISTS user_id;

-- 3. todos 테이블에 list_id 컬럼 추가 (NOT NULL, 외래키)
ALTER TABLE todos ADD COLUMN IF NOT EXISTS list_id UUID NOT NULL REFERENCES todo_lists(id) ON DELETE CASCADE;

-- 4. todos 테이블에 order_index 컬럼 추가 (드래그 앤 드롭용)
ALTER TABLE todos ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;

-- 5. 성능을 위한 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_todos_list_id ON todos(list_id);
CREATE INDEX IF NOT EXISTS idx_todos_order ON todos(list_id, order_index);
CREATE INDEX IF NOT EXISTS idx_todo_lists_user_id ON todo_lists(user_id);

-- 6. RLS (Row Level Security) 정책 업데이트
-- todos 테이블의 RLS 정책을 list_id 기반으로 변경
DROP POLICY IF EXISTS "Users can only see their own todos" ON todos;
CREATE POLICY "Users can only see their own todos" ON todos
  FOR ALL USING (
    list_id IN (
      SELECT id FROM todo_lists WHERE user_id = auth.uid()
    )
  );

-- 7. 정리 완료 메시지
DO $$
BEGIN
  RAISE NOTICE 'Database reset complete. todos table now uses list_id instead of user_id.';
END $$;
