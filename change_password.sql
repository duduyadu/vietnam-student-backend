-- Supabase SQL Editor에서 실행
-- 비밀번호를 특수문자 없는 것으로 변경
ALTER USER postgres WITH PASSWORD 'duyang3927abc';

-- 확인
SELECT current_user, current_database();