-- 먼저 테이블 구조 확인
SELECT column_name FROM information_schema.columns WHERE table_name = 'users';

-- 만약 full_name이 아니라 name인 경우 사용할 SQL
INSERT INTO users (
    username, 
    password, 
    name,  -- full_name 대신 name 사용
    role, 
    is_active, 
    created_at,
    updated_at
) 
VALUES (
    'admin', 
    '$2b$10$rWtKZeB3hM5YqGwz3U8zNOYPjKYH5Q5rvL4qY1xLZ8FIkQ3.zWiOi', -- 비밀번호: admin123
    '시스템 관리자', 
    'admin', 
    true, 
    NOW(),
    NOW()
) 
ON CONFLICT (username) DO NOTHING;

-- 생성된 관리자 계정 확인
SELECT user_id, username, name, role, is_active 
FROM users 
WHERE username = 'admin';