-- =====================================
-- admin 계정 비밀번호를 admin123으로 재설정
-- =====================================

-- 1. 현재 admin 계정 확인
SELECT username, email, full_name, role, is_active 
FROM users 
WHERE username = 'admin';

-- 2. admin123의 bcrypt 해시로 비밀번호 업데이트
UPDATE users 
SET password_hash = '$2b$10$hxnz/LwlewO4VPit5ZAK2O2WITdadcS0aDfVRUojy9tr34PYo3V4e'
WHERE username = 'admin';

-- 3. 업데이트 확인
SELECT 
    username, 
    email, 
    full_name, 
    role,
    is_active,
    created_at,
    updated_at
FROM users 
WHERE username = 'admin';

-- =====================================
-- 📌 중요 정보:
-- Username: admin
-- Password: admin123
-- Hash: $2b$10$hxnz/LwlewO4VPit5ZAK2O2WITdadcS0aDfVRUojy9tr34PYo3V4e
-- =====================================