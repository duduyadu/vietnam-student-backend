-- =====================================================
-- students 테이블 수정 스크립트
-- student_code 컬럼이 없어서 발생하는 오류 해결
-- =====================================================

-- 1. 먼저 students 테이블의 현재 구조 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'students' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. students 테이블이 존재하는지 확인
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'students'
) as table_exists;

-- 3. students 테이블이 있으면 필요한 컬럼 추가, 없으면 생성
DO $$ 
BEGIN
    -- 테이블이 존재하지 않으면 새로 생성
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students') THEN
        CREATE TABLE students (
            student_id SERIAL PRIMARY KEY,
            student_code VARCHAR(50) UNIQUE NOT NULL,
            name_korean VARCHAR(100),
            name_vietnamese VARCHAR(100),
            birth_date DATE,
            gender VARCHAR(10),
            phone VARCHAR(20),
            email VARCHAR(100),
            address_vietnam TEXT,
            address_korea TEXT,
            parent_name VARCHAR(100),
            parent_phone VARCHAR(20),
            parent_income_level VARCHAR(50),
            high_school_name VARCHAR(200),
            high_school_gpa DECIMAL(3,2),
            enrollment_date DATE,
            target_university VARCHAR(200),
            target_major VARCHAR(200),
            visa_type VARCHAR(50),
            visa_expiry_date DATE,
            agency_id INTEGER REFERENCES agencies(agency_id),
            notes TEXT,
            is_active BOOLEAN DEFAULT true,
            created_by INTEGER REFERENCES users(user_id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ELSE
        -- 테이블이 존재하면 누락된 컬럼들을 추가
        
        -- student_code 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'student_code') THEN
            ALTER TABLE students ADD COLUMN student_code VARCHAR(50);
            
            -- 기존 데이터가 있다면 임시 코드 생성
            UPDATE students 
            SET student_code = 'STU' || LPAD(student_id::text, 6, '0') 
            WHERE student_code IS NULL;
            
            -- NOT NULL과 UNIQUE 제약 추가
            ALTER TABLE students ALTER COLUMN student_code SET NOT NULL;
            ALTER TABLE students ADD CONSTRAINT students_student_code_unique UNIQUE (student_code);
        END IF;
        
        -- name_korean 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'name_korean') THEN
            ALTER TABLE students ADD COLUMN name_korean VARCHAR(100);
        END IF;
        
        -- name_vietnamese 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'name_vietnamese') THEN
            ALTER TABLE students ADD COLUMN name_vietnamese VARCHAR(100);
        END IF;
        
        -- birth_date 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'birth_date') THEN
            ALTER TABLE students ADD COLUMN birth_date DATE;
        END IF;
        
        -- gender 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'gender') THEN
            ALTER TABLE students ADD COLUMN gender VARCHAR(10);
        END IF;
        
        -- phone 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'phone') THEN
            ALTER TABLE students ADD COLUMN phone VARCHAR(20);
        END IF;
        
        -- email 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'email') THEN
            ALTER TABLE students ADD COLUMN email VARCHAR(100);
        END IF;
        
        -- address_vietnam 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'address_vietnam') THEN
            ALTER TABLE students ADD COLUMN address_vietnam TEXT;
        END IF;
        
        -- address_korea 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'address_korea') THEN
            ALTER TABLE students ADD COLUMN address_korea TEXT;
        END IF;
        
        -- parent_name 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'parent_name') THEN
            ALTER TABLE students ADD COLUMN parent_name VARCHAR(100);
        END IF;
        
        -- parent_phone 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'parent_phone') THEN
            ALTER TABLE students ADD COLUMN parent_phone VARCHAR(20);
        END IF;
        
        -- parent_income_level 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'parent_income_level') THEN
            ALTER TABLE students ADD COLUMN parent_income_level VARCHAR(50);
        END IF;
        
        -- high_school_name 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'high_school_name') THEN
            ALTER TABLE students ADD COLUMN high_school_name VARCHAR(200);
        END IF;
        
        -- high_school_gpa 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'high_school_gpa') THEN
            ALTER TABLE students ADD COLUMN high_school_gpa DECIMAL(3,2);
        END IF;
        
        -- enrollment_date 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'enrollment_date') THEN
            ALTER TABLE students ADD COLUMN enrollment_date DATE;
        END IF;
        
        -- target_university 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'target_university') THEN
            ALTER TABLE students ADD COLUMN target_university VARCHAR(200);
        END IF;
        
        -- target_major 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'target_major') THEN
            ALTER TABLE students ADD COLUMN target_major VARCHAR(200);
        END IF;
        
        -- visa_type 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'visa_type') THEN
            ALTER TABLE students ADD COLUMN visa_type VARCHAR(50);
        END IF;
        
        -- visa_expiry_date 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'visa_expiry_date') THEN
            ALTER TABLE students ADD COLUMN visa_expiry_date DATE;
        END IF;
        
        -- agency_id 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'agency_id') THEN
            ALTER TABLE students ADD COLUMN agency_id INTEGER REFERENCES agencies(agency_id);
        END IF;
        
        -- notes 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'notes') THEN
            ALTER TABLE students ADD COLUMN notes TEXT;
        END IF;
        
        -- is_active 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'is_active') THEN
            ALTER TABLE students ADD COLUMN is_active BOOLEAN DEFAULT true;
        END IF;
        
        -- created_by 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'created_by') THEN
            ALTER TABLE students ADD COLUMN created_by INTEGER REFERENCES users(user_id);
        END IF;
        
        -- created_at 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'created_at') THEN
            ALTER TABLE students ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
        
        -- updated_at 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'updated_at') THEN
            ALTER TABLE students ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
    END IF;
END $$;

-- 4. 인덱스 생성 (없는 경우만)
CREATE INDEX IF NOT EXISTS idx_students_code ON students(student_code);
CREATE INDEX IF NOT EXISTS idx_students_agency ON students(agency_id);
CREATE INDEX IF NOT EXISTS idx_students_active ON students(is_active);

-- 5. 최종 확인 - students 테이블 구조 보기
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'students' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. 메시지 출력
SELECT 'students 테이블 수정 완료! student_code 컬럼이 추가되었습니다.' as message;