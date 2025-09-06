-- 🧠 ULTRATHINK: Supabase RLS 정책 확인 및 비활성화

-- 1. users 테이블의 RLS 상태 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- 2. RLS 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users';

-- 3. RLS 비활성화 (필요시)
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 4. 또는 모든 사용자에게 SELECT 권한 부여
-- CREATE POLICY "Enable read access for all users" ON users
-- FOR SELECT USING (true);

-- 5. anon 역할에 대한 권한 확인
SELECT 
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE grantee = 'anon' 
AND table_name = 'users';

-- 6. users 테이블에 데이터가 있는지 확인
SELECT COUNT(*) as user_count FROM users;
SELECT username, role FROM users WHERE username = 'admin';