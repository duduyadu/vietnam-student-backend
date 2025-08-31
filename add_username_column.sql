-- 1. username 컬럼 추가 (없으면)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE;

-- 2. 기존 email 데이터를 username으로 복사 (임시)
UPDATE public.users 
SET username = email 
WHERE username IS NULL;

-- 3. 기타 누락된 컬럼들 추가
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS agency_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS branch_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'ko',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 4. 테이블 구조 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. 관리자 계정 생성/업데이트
INSERT INTO public.users (
    username, 
    password, 
    name,
    role, 
    is_active, 
    created_at
) 
VALUES (
    'admin', 
    '$2b$10$rWtKZeB3hM5YqGwz3U8zNOYPjKYH5Q5rvL4qY1xLZ8FIkQ3.zWiOi',  -- 비밀번호: admin123
    '시스템 관리자', 
    'admin', 
    true, 
    NOW()
) 
ON CONFLICT (username) 
DO UPDATE SET 
    password = EXCLUDED.password,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- 6. 생성된 관리자 확인
SELECT id, username, name, role, is_active 
FROM public.users 
WHERE username = 'admin';