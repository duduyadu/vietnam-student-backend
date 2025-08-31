-- Vietnam Student Management System
-- 초기 관리자 계정 생성 SQL
-- Supabase SQL Editor에서 실행하세요

-- 1. 기존 admin 계정 삭제 (있을 경우)
DELETE FROM users WHERE email = 'admin@school.com';

-- 2. 관리자 계정 생성
-- 비밀번호: admin123 (bcrypt로 해시됨)
INSERT INTO users (
    email,
    password,
    full_name,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    'admin@school.com',
    '$2b$10$YmRlM5I5aB6DxOyXXtk3b.Kj1QcGFwBqQa8D3wtW.eqP3/qBnJTPO',  -- admin123
    '시스템 관리자',
    'admin',
    true,
    NOW(),
    NOW()
);

-- 3. 생성된 계정 확인
SELECT 
    user_id,
    email,
    full_name,
    role,
    is_active,
    created_at
FROM users 
WHERE email = 'admin@school.com';

-- 로그인 정보:
-- Email: admin@school.com
-- Password: admin123