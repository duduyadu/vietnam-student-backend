-- 🧠 ULTRATHINK: PDF 생성 오류 디버깅 SQL
-- 2025-09-05 생성
-- student_id=11 문제 및 전반적인 데이터 일관성 확인

-- =====================================================
-- 1. student_id=11 존재 여부 확인
-- =====================================================
SELECT 
  student_id,
  student_code,
  name_korean,
  name_vietnamese,
  status,
  created_at
FROM students 
WHERE student_id = 11;

-- =====================================================
-- 2. 실제 존재하는 student_id 범위 확인
-- =====================================================
SELECT 
  MIN(student_id) as min_id,
  MAX(student_id) as max_id,
  COUNT(*) as total_students,
  COUNT(DISTINCT student_id) as unique_students
FROM students;

-- =====================================================
-- 3. 모든 학생 ID 목록 확인 (ID 순서로)
-- =====================================================
SELECT 
  student_id,
  student_code,
  name_korean,
  status
FROM students
ORDER BY student_id
LIMIT 20;

-- =====================================================
-- 4. generated_reports 테이블 구조 확인
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'generated_reports'
AND column_name = 'student_id';

-- =====================================================
-- 5. 최근 실패한 보고서 생성 시도 확인
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

-- =====================================================
-- 6. student_id가 NULL인 보고서 확인
-- =====================================================
SELECT 
  report_id,
  student_id,
  report_title,
  status,
  error_message
FROM generated_reports
WHERE student_id IS NULL;

-- =====================================================
-- 7. 프론트엔드가 사용할 수 있는 유효한 student_id 목록
-- =====================================================
SELECT 
  student_id,
  student_code,
  name_korean || ' (' || COALESCE(name_vietnamese, '') || ')' as full_name,
  status
FROM students
WHERE status = 'active'
ORDER BY student_id;