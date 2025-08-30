-- 🎯 테스트용 기본 데이터 생성 스크립트 (수정본)
-- Supabase SQL Editor에서 실행하세요

-- 1. 먼저 users 테이블 구조 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';

-- 2. 테스트용 유학원 생성 (agency_id 자동 생성)
INSERT INTO agencies (agency_code, name, address, phone, created_by, created_at)
VALUES 
  ('TEST', '테스트 유학원', '서울시 강남구', '010-1234-5678', 1, NOW()),
  ('VN01', '베트남 유학원 1', '호치민시', '010-2345-6789', 1, NOW()),
  ('VN02', '베트남 유학원 2', '하노이', '010-3456-7890', 1, NOW())
ON CONFLICT (name) DO UPDATE SET
  agency_code = EXCLUDED.agency_code;

-- 3. agency_code가 없는 기존 유학원 업데이트
UPDATE agencies 
SET agency_code = 'AG' || LPAD(agency_id::text, 3, '0')
WHERE agency_code IS NULL OR agency_code = '';

-- 4. generate_student_code 함수 생성 (없으면 생성)
CREATE OR REPLACE FUNCTION generate_student_code(p_agency_code VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    v_year VARCHAR(2);
    v_month VARCHAR(2);
    v_count INTEGER;
    v_student_code VARCHAR(20);
BEGIN
    -- 현재 년도와 월 가져오기
    v_year := TO_CHAR(CURRENT_DATE, 'YY');
    v_month := TO_CHAR(CURRENT_DATE, 'MM');
    
    -- 해당 유학원의 이번 달 학생 수 카운트
    SELECT COUNT(*) + 1 INTO v_count
    FROM students
    WHERE student_code LIKE p_agency_code || v_year || v_month || '%';
    
    -- 학생 코드 생성: AGENCYCODE + YY + MM + 순번(3자리)
    v_student_code := p_agency_code || v_year || v_month || LPAD(v_count::text, 3, '0');
    
    RETURN v_student_code;
END;
$$ LANGUAGE plpgsql;

-- 5. 확인 쿼리
SELECT 'Agencies:' as info, COUNT(*) as count FROM agencies
UNION ALL
SELECT 'Users:' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'Students:' as info, COUNT(*) as count FROM students;

-- 6. agency 데이터 확인
SELECT agency_id, agency_code, name 
FROM agencies 
ORDER BY agency_id;