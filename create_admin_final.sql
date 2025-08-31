-- Admin 계정 생성 (username 로그인용)
-- 기존 admin 계정이 있으면 먼저 삭제
DELETE FROM users WHERE username = 'admin';

-- 새 admin 계정 생성
INSERT INTO users (
  username,
  password,
  name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  'admin',
  '$2b$10$xE8iQZ7V5.9Kt3XRz5mWIugKWMwCH3KQpzKQcXKp5pE0mxXEQKGRa', -- admin123
  'System Administrator',
  'admin',
  true,
  NOW(),
  NOW()
);

-- 확인
SELECT id, username, name, role, is_active 
FROM users 
WHERE username = 'admin';