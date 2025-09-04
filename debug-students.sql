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