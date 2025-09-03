-- admin 계정 비밀번호를 admin123으로 재설정
-- bcrypt hash for 'admin123'
UPDATE users 
SET password_hash = '$2b$10$zvJMgTlaIYCCcRV.j0jmR.s5wqUGEj6bO0Y0VCT2hRh6Bh9LnDZjW'
WHERE username = 'admin';

-- 업데이트된 사용자 확인
SELECT username, email, full_name, role 
FROM users 
WHERE username = 'admin';