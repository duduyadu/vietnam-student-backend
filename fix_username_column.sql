-- 1. 먼저 현재 상태 확인
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public';

-- 2. username 컬럼 추가 (에러 무시)
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE public.users ADD COLUMN username VARCHAR(255);
    EXCEPTION
        WHEN duplicate_column THEN 
            RAISE NOTICE 'column username already exists';
    END;
END $$;

-- 3. username을 UNIQUE로 설정
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);
    EXCEPTION
        WHEN duplicate_object THEN 
            RAISE NOTICE 'constraint already exists';
    END;
END $$;

-- 4. email 값을 username으로 복사 (username이 비어있는 경우)
UPDATE public.users 
SET username = COALESCE(username, email, 'admin_' || id::text)
WHERE username IS NULL OR username = '';

-- 5. 관리자 계정 직접 생성/업데이트
UPDATE public.users 
SET 
    username = 'admin',
    password = '$2b$10$rWtKZeB3hM5YqGwz3U8zNOYPjKYH5Q5rvL4qY1xLZ8FIkQ3.zWiOi',
    name = '시스템 관리자',
    role = 'admin',
    is_active = true
WHERE id = (SELECT id FROM public.users ORDER BY id LIMIT 1);

-- 만약 users 테이블이 비어있다면 새로 삽입
INSERT INTO public.users (
    username,
    password,
    name,
    role,
    is_active,
    created_at
)
SELECT 
    'admin',
    '$2b$10$rWtKZeB3hM5YqGwz3U8zNOYPjKYH5Q5rvL4qY1xLZ8FIkQ3.zWiOi',
    '시스템 관리자',
    'admin',
    true,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE username = 'admin');

-- 6. 최종 확인
SELECT id, username, name, role, is_active 
FROM public.users 
WHERE username = 'admin' OR role = 'admin';

-- 7. 전체 컬럼 확인
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;