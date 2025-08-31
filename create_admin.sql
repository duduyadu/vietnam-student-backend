-- Supabase SQL Editor에서 실행할 관리자 계정 생성 쿼리
-- 비밀번호: admin123 (bcrypt로 해시화됨)

INSERT INTO users (
    username, 
    password, 
    full_name, 
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
SELECT user_id, username, full_name, role, is_active 
FROM users 
WHERE username = 'admin';