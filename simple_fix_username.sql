-- 1. username 컬럼 추가 (이미 있으면 무시)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username VARCHAR(255);

-- 2. username에 값 채우기
UPDATE public.users 
SET username = COALESCE(email, 'user_' || id::text)
WHERE username IS NULL OR username = '';

-- 3. 관리자 계정 생성 (username 사용)
INSERT INTO public.users (
    username,
    password,
    name,
    role,
    is_active,
    email,
    created_at
)
VALUES (
    'admin',
    '$2b$10$rWtKZeB3hM5YqGwz3U8zNOYPjKYH5Q5rvL4qY1xLZ8FIkQ3.zWiOi',
    '시스템 관리자',
    'admin',
    true,
    'admin@admin.com',
    NOW()
)
ON CONFLICT (username) DO NOTHING;

-- 4. 만약 username 충돌시 email로 생성
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
    password = '$2b$10$rWtKZeB3hM5YqGwz3U8zNOYPjKYH5Q5rvL4qY1xLZ8FIkQ3.zWiOi',
    role = 'admin',
    is_active = true;

-- 5. username 업데이트
UPDATE public.users 
SET username = 'admin'
WHERE email = 'admin@admin.com' AND (username IS NULL OR username = '');

-- 6. 결과 확인
SELECT id, username, email, name, role, is_active 
FROM public.users 
WHERE role = 'admin' OR email = 'admin@admin.com' OR username = 'admin';