-- users 테이블 구조 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'users'
ORDER BY 
    ordinal_position;

-- users 테이블의 실제 데이터 샘플 확인 (권한 역할 확인용)
SELECT 
    user_id,
    username,
    full_name,
    role,
    agency_name,
    branch_name,
    is_active
FROM 
    users
ORDER BY 
    created_at DESC
LIMIT 5;