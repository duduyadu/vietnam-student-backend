-- 1. 현재 데이터베이스와 스키마 확인
SELECT current_database(), current_schema();

-- 2. public.users 테이블의 정확한 컬럼 확인
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY table_schema, ordinal_position;

-- 3. 모든 스키마의 users 테이블 확인
SELECT 
    schemaname,
    tablename 
FROM pg_tables 
WHERE tablename = 'users';

-- 4. public.users 테이블 구조 상세 확인
\d public.users

-- 5. 실제 데이터 확인
SELECT * FROM public.users WHERE role = 'admin' LIMIT 1;