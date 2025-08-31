-- email 기반 관리자 계정 생성
INSERT INTO public.users (
    email,
    password,
    name,
    role,
    is_active,
    created_at
)
VALUES (
    'admin@admin.com',
    '$2b$10$rWtKZeB3hM5YqGwz3U8zNOYPjKYH5Q5rvL4qY1xLZ8FIkQ3.zWiOi',
    '시스템 관리자',
    'admin',
    true,
    NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
    password = EXCLUDED.password,
    role = 'admin',
    is_active = true;

-- 확인
SELECT id, email, name, role, is_active 
FROM public.users 
WHERE email = 'admin@admin.com';