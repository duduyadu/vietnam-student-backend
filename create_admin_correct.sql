-- public.users 테이블에 관리자 계정 생성
-- 컬럼명: name (full_name이 아님)

INSERT INTO public.users (
    username, 
    password, 
    name,  -- full_name이 아니라 name
    role, 
    is_active, 
    created_at
) 
VALUES (
    'admin', 
    '$2b$10$rWtKZeB3hM5YqGwz3U8zNOYPjKYH5Q5rvL4qY1xLZ8FIkQ3.zWiOi', -- 비밀번호: admin123
    '시스템 관리자', 
    'admin', 
    true, 
    NOW()
) 
ON CONFLICT (username) DO NOTHING;

-- 생성된 관리자 계정 확인
SELECT id, username, name, role, is_active 
FROM public.users 
WHERE username = 'admin';