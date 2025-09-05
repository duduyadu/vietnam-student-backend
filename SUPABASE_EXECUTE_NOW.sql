-- ========================================================
-- 🚨 긴급 실행 필요! 2025-09-05
-- Supabase SQL Editor에서 이 전체 내용을 실행하세요
-- ========================================================

-- 1️⃣ generated_reports 테이블 수정 (student_id NULL 허용)
ALTER TABLE generated_reports 
  ALTER COLUMN student_id DROP NOT NULL;

-- 2️⃣ 수정 확인
SELECT 
  table_name,
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'generated_reports'
AND column_name = 'student_id';

-- 3️⃣ 현재 학생 데이터 상태 확인
SELECT 
  '총 학생 수' as info,
  COUNT(*)::text as value
FROM students
UNION ALL
SELECT 
  '최대 student_id' as info,
  MAX(student_id)::text as value
FROM students
UNION ALL
SELECT 
  '최소 student_id' as info,
  MIN(student_id)::text as value
FROM students;

-- 4️⃣ student_id = 11 존재 여부
SELECT 
  CASE 
    WHEN EXISTS(SELECT 1 FROM students WHERE student_id = 11) 
    THEN '✅ student_id = 11 존재함'
    ELSE '❌ student_id = 11 존재하지 않음'
  END as student_11_status;

-- 5️⃣ 최근 5명의 학생 확인
SELECT 
  student_id,
  student_code,
  name_korean,
  created_at,
  created_by
FROM students
ORDER BY created_at DESC
LIMIT 5;

-- 6️⃣ 고아 레코드 확인 (학생이 없는 상담/보고서)
SELECT 
  'consultations 테이블의 고아 레코드' as table_info,
  COUNT(*) as count
FROM consultations c
WHERE NOT EXISTS (
  SELECT 1 FROM students s WHERE s.student_id = c.student_id
)
UNION ALL
SELECT 
  'generated_reports 테이블의 고아 레코드' as table_info,
  COUNT(*) as count
FROM generated_reports g
WHERE g.student_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM students s WHERE s.student_id = g.student_id
  );

-- ========================================================
-- 실행 완료 후 결과를 확인하세요!
-- 1. generated_reports의 is_nullable가 'YES'로 변경되었는지
-- 2. student_id = 11이 존재하는지
-- 3. 고아 레코드가 있는지
-- ========================================================