-- 🔧 agencies 테이블 수정 및 데이터 생성 스크립트
-- 각 단계를 하나씩 실행하세요!

-- ========================================
-- 단계 1: agencies 테이블 구조 확인
-- ========================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'agencies'
ORDER BY ordinal_position;

-- ========================================
-- 단계 2: agency_code 컬럼 추가 (없으면)
-- ========================================
ALTER TABLE agencies 
ADD COLUMN IF NOT EXISTS agency_code VARCHAR(10);

-- ========================================
-- 단계 3: 기존 agencies 데이터 확인
-- ========================================
SELECT * FROM agencies;

-- ========================================
-- 단계 4: 기존 데이터에 agency_code 업데이트
-- ========================================
UPDATE agencies 
SET agency_code = CASE 
    WHEN agency_id = 1 THEN 'TEST'
    WHEN agency_id = 2 THEN 'VN01'
    WHEN agency_id = 3 THEN 'VN02'
    ELSE 'AG' || LPAD(agency_id::text, 3, '0')
END
WHERE agency_code IS NULL OR agency_code = '';

-- ========================================
-- 단계 5: 테스트 유학원 추가 (없으면)
-- ========================================
INSERT INTO agencies (name, address, phone)
SELECT '테스트 유학원', '서울시 강남구', '010-1234-5678'
WHERE NOT EXISTS (SELECT 1 FROM agencies WHERE name = '테스트 유학원');

INSERT INTO agencies (name, address, phone)
SELECT '베트남 유학원 1', '호치민시', '010-2345-6789'
WHERE NOT EXISTS (SELECT 1 FROM agencies WHERE name = '베트남 유학원 1');

INSERT INTO agencies (name, address, phone)
SELECT '베트남 유학원 2', '하노이', '010-3456-7890'
WHERE NOT EXISTS (SELECT 1 FROM agencies WHERE name = '베트남 유학원 2');

-- ========================================
-- 단계 6: agency_code 다시 업데이트
-- ========================================
UPDATE agencies 
SET agency_code = 'AG' || LPAD(agency_id::text, 3, '0')
WHERE agency_code IS NULL OR agency_code = '';

-- ========================================
-- 단계 7: generate_student_code 함수 생성
-- ========================================
CREATE OR REPLACE FUNCTION generate_student_code(p_agency_code VARCHAR DEFAULT 'STU')
RETURNS VARCHAR AS $$
DECLARE
    v_year VARCHAR(2);
    v_month VARCHAR(2);
    v_count INTEGER;
    v_student_code VARCHAR(20);
    v_safe_code VARCHAR(10);
BEGIN
    -- agency_code가 NULL이면 기본값 사용
    v_safe_code := COALESCE(p_agency_code, 'STU');
    
    -- 현재 년도와 월 가져오기
    v_year := TO_CHAR(CURRENT_DATE, 'YY');
    v_month := TO_CHAR(CURRENT_DATE, 'MM');
    
    -- 해당 유학원의 이번 달 학생 수 카운트
    SELECT COUNT(*) + 1 INTO v_count
    FROM students
    WHERE student_code LIKE v_safe_code || v_year || v_month || '%';
    
    -- 학생 코드 생성: AGENCYCODE + YY + MM + 순번(3자리)
    v_student_code := v_safe_code || v_year || v_month || LPAD(v_count::text, 3, '0');
    
    RETURN v_student_code;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 단계 8: 최종 확인
-- ========================================
SELECT 
    agency_id,
    agency_code,
    name,
    address,
    phone
FROM agencies 
ORDER BY agency_id;