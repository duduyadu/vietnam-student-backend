-- 🧠 ULTRATHINK: generated_reports 테이블 student_id 제약 수정
-- 2025-09-05
-- 오류 기록 시 student_id NULL 허용

-- =====================================================
-- 1. 현재 제약 조건 확인
-- =====================================================
SELECT 
  column_name,
  is_nullable,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'generated_reports'
AND column_name = 'student_id';

-- =====================================================
-- 2. student_id 컬럼 NULL 허용으로 변경
-- =====================================================
ALTER TABLE generated_reports 
  ALTER COLUMN student_id DROP NOT NULL;

-- =====================================================
-- 3. 변경 확인
-- =====================================================
SELECT 
  column_name,
  is_nullable,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'generated_reports'
AND column_name = 'student_id';

-- =====================================================
-- 4. 실패한 보고서 생성 기록 확인
-- =====================================================
SELECT 
  report_id,
  student_id,
  report_title,
  status,
  error_message,
  generated_at
FROM generated_reports
WHERE status = 'failed'
ORDER BY generated_at DESC
LIMIT 10;