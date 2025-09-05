-- 🧠 ULTRATHINK: 학생 생성 및 ID 문제 디버깅
-- 2025-09-05
-- 신규 학생 등록 후 PDF 생성 실패 원인 분석

-- =====================================================
-- 1. 가장 최근 생성된 학생들 확인
-- =====================================================
SELECT 
  student_id,
  student_code,
  name_korean,
  created_at,
  created_by
FROM students
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 2. student_id 시퀀스 현재 값 확인
-- =====================================================
SELECT 
  pg_get_serial_sequence('students', 'student_id') as sequence_name,
  last_value,
  is_called
FROM students_student_id_seq;

-- =====================================================
-- 3. 실제 최대 student_id와 시퀀스 비교
-- =====================================================
SELECT 
  MAX(student_id) as max_student_id,
  (SELECT last_value FROM students_student_id_seq) as sequence_last_value,
  CASE 
    WHEN MAX(student_id) >= (SELECT last_value FROM students_student_id_seq) 
    THEN '⚠️ 시퀀스 문제 발생!'
    ELSE '✅ 시퀀스 정상'
  END as status
FROM students;

-- =====================================================
-- 4. student_id = 11이 실제로 존재하는지
-- =====================================================
SELECT 
  'students' as table_name,
  EXISTS(SELECT 1 FROM students WHERE student_id = 11) as exists
UNION ALL
SELECT 
  'consultations' as table_name,
  EXISTS(SELECT 1 FROM consultations WHERE student_id = 11) as exists
UNION ALL
SELECT 
  'generated_reports' as table_name,
  EXISTS(SELECT 1 FROM generated_reports WHERE student_id = 11) as exists;

-- =====================================================
-- 5. 시퀀스 재설정 (필요시)
-- 주의: 실행 전 확인 필수!
-- =====================================================
-- SELECT setval('students_student_id_seq', (SELECT MAX(student_id) FROM students));

-- =====================================================
-- 6. 최근 상담 기록의 student_id 확인
-- =====================================================
SELECT 
  c.consultation_id,
  c.student_id,
  s.student_code,
  s.name_korean,
  c.created_at
FROM consultations c
LEFT JOIN students s ON c.student_id = s.student_id
ORDER BY c.created_at DESC
LIMIT 10;

-- =====================================================
-- 7. 잘못된 student_id를 가진 상담 찾기
-- =====================================================
SELECT 
  c.consultation_id,
  c.student_id as invalid_student_id,
  c.created_at
FROM consultations c
WHERE NOT EXISTS (
  SELECT 1 FROM students s 
  WHERE s.student_id = c.student_id
)
ORDER BY c.created_at DESC;