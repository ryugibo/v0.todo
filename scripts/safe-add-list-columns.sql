-- 안전한 마이그레이션: 기존 데이터가 있어도 에러 없이 list_id와 order_index 컬럼 추가

-- 1단계: list_id 컬럼을 NULL 허용으로 추가
ALTER TABLE todos 
ADD COLUMN IF NOT EXISTS list_id UUID;

-- 2단계: order_index 컬럼을 NULL 허용으로 추가  
ALTER TABLE todos 
ADD COLUMN IF NOT EXISTS order_index INTEGER;

-- 3단계: 기존 투두가 있는 각 사용자에게 기본 리스트 생성
INSERT INTO todo_lists (id, name, user_id, order_index, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    '기본 리스트',
    user_id,
    0,
    NOW(),
    NOW()
FROM (
    SELECT DISTINCT user_id 
    FROM todos 
    WHERE list_id IS NULL
) AS users_with_todos
WHERE NOT EXISTS (
    SELECT 1 FROM todo_lists 
    WHERE todo_lists.user_id = users_with_todos.user_id 
    AND todo_lists.name = '기본 리스트'
);

-- 4단계: 기존 투두들을 각 사용자의 기본 리스트에 연결
UPDATE todos 
SET 
    list_id = (
        SELECT id 
        FROM todo_lists 
        WHERE todo_lists.user_id = todos.user_id 
        AND todo_lists.name = '기본 리스트'
        LIMIT 1
    ),
    order_index = COALESCE(
        (SELECT COUNT(*) FROM todos t2 
         WHERE t2.user_id = todos.user_id 
         AND t2.created_at < todos.created_at), 
        0
    )
WHERE list_id IS NULL;

-- 5단계: 이제 모든 기존 데이터가 연결되었으므로 NOT NULL 제약조건 추가
ALTER TABLE todos 
ALTER COLUMN list_id SET NOT NULL;

ALTER TABLE todos 
ALTER COLUMN order_index SET NOT NULL;

-- 6단계: 외래키 제약조건 추가
ALTER TABLE todos 
ADD CONSTRAINT IF NOT EXISTS fk_todos_list_id 
FOREIGN KEY (list_id) REFERENCES todo_lists(id) ON DELETE CASCADE;

-- 7단계: 성능을 위한 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_todos_list_id ON todos(list_id);
CREATE INDEX IF NOT EXISTS idx_todos_order ON todos(list_id, order_index);
