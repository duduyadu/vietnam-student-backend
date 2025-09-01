-- =====================================================
-- 현재 데이터베이스 상태 확인
-- 이것을 먼저 실행해서 어떤 테이블과 컬럼이 있는지 확인하세요
-- =====================================================

-- 1. 현재 존재하는 테이블 목록
SELECT '===== 현재 테이블 목록 =====' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. users 테이블 구조 확인
SELECT '===== users 테이블 구조 =====' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. students 테이블 구조 확인  
SELECT '===== students 테이블 구조 =====' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'students' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. agencies 테이블 구조 확인
SELECT '===== agencies 테이블 구조 =====' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'agencies' 
AND table_schema = 'public'
ORDER BY ordinal_position;