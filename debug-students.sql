-- =====================================================
-- 🧠 ULTRATHINK: 학생 데이터 디버깅 SQL
-- 2025-09-03 생성
-- Foreign Key 오류 해결을 위한 학생 데이터 확인
-- =====================================================

-- 1. 현재 존재하는 모든 학생 ID 확인
SELECT 
  student_id,
  student_code,
  name_korean,
  name_vietnamese,
  created_at
FROM students
ORDER BY student_id;

-- 2. student_id = 10 확인
SELECT * FROM students 
WHERE student_id = 10;

-- 3. 실제 존재하는 student_id 범위 확인
SELECT 
  MIN(student_id) as min_id,
  MAX(student_id) as max_id,
  COUNT(*) as total_students
FROM students;

-- 4. generated_reports 테이블의 잘못된 참조 확인
SELECT 
  gr.report_id,
  gr.student_id,
  gr.report_title,
  gr.status,
  s.student_code,
  s.name_korean
FROM generated_reports gr
LEFT JOIN students s ON gr.student_id = s.student_id
WHERE s.student_id IS NULL;

-- 5. 최근 생성된 학생들 확인
SELECT 
  student_id,
  student_code,
  name_korean,
  created_at
FROM students
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 🧠 ULTRATHINK: student_id=10 문제 추적
-- =====================================================

-- 6. consultations 테이블에서 student_id=10 확인
SELECT 
  c.consultation_id,
  c.student_id,
  c.consultation_date,
  c.consultation_type_id,
  s.student_code,
  s.name_korean
FROM consultations c
LEFT JOIN students s ON c.student_id = s.student_id
WHERE c.student_id = 10;

-- 7. 고아 상담 기록 찾기 (학생이 없는 상담)
SELECT 
  c.consultation_id,
  c.student_id,
  c.consultation_date,
  'Student Missing' as issue
FROM consultations c
LEFT JOIN students s ON c.student_id = s.student_id
WHERE s.student_id IS NULL;

-- 8. 상담 기록의 student_id 범위 확인
SELECT 
  MIN(student_id) as min_consultation_student_id,
  MAX(student_id) as max_consultation_student_id,
  COUNT(DISTINCT student_id) as unique_students_in_consultations
FROM consultations;

-- 9. 문제가 되는 모든 상담 기록 수정 (실행 전 확인 필수!)
-- UPDATE consultations 
-- SET student_id = NULL
-- WHERE student_id NOT IN (SELECT student_id FROM students);

-- 10. 또는 특정 ID만 수정
-- UPDATE consultations 
-- SET student_id = NULL
-- WHERE student_id = 10 
--   AND NOT EXISTS (SELECT 1 FROM students WHERE student_id = 10);