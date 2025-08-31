-- 모든 users 확인
SELECT * FROM users;

-- username이 있는 users만 확인
SELECT id, username, name, role, is_active 
FROM users 
WHERE username IS NOT NULL;

-- admin 계정 확인
SELECT * FROM users WHERE username = 'admin';

-- 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
ORDER BY ordinal_position;