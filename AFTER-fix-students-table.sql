-- =====================================================
-- users 테이블 수정 후 students 테이블 생성/수정
-- CRITICAL-fix-users-table.sql 실행 후에 실행하세요
-- =====================================================

-- students 테이블 생성 또는 수정
DO $$ 
BEGIN
    -- students 테이블이 없으면 생성
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'students' AND table_schema = 'public') THEN
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
        
        RAISE NOTICE 'students 테이블을 새로 생성했습니다.';
    ELSE
        -- 테이블이 존재하면 필요한 컬럼만 추가
        RAISE NOTICE 'students 테이블이 이미 존재합니다. 누락된 컬럼을 추가합니다.';
        
        -- student_code 컬럼 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'student_code') THEN
            ALTER TABLE students ADD COLUMN student_code VARCHAR(50);
            UPDATE students SET student_code = 'STU' || LPAD(student_id::text, 6, '0') WHERE student_code IS NULL;
            ALTER TABLE students ALTER COLUMN student_code SET NOT NULL;
            ALTER TABLE students ADD CONSTRAINT students_student_code_unique UNIQUE (student_code);
            RAISE NOTICE 'student_code 컬럼을 추가했습니다.';
        END IF;
        
        -- name_korean 컬럼 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'name_korean') THEN
            ALTER TABLE students ADD COLUMN name_korean VARCHAR(100);
            RAISE NOTICE 'name_korean 컬럼을 추가했습니다.';
        END IF;
        
        -- name_vietnamese 컬럼 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'name_vietnamese') THEN
            ALTER TABLE students ADD COLUMN name_vietnamese VARCHAR(100);
            RAISE NOTICE 'name_vietnamese 컬럼을 추가했습니다.';
        END IF;
        
        -- birth_date 컬럼 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'birth_date') THEN
            ALTER TABLE students ADD COLUMN birth_date DATE;
        END IF;
        
        -- gender 컬럼 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'gender') THEN
            ALTER TABLE students ADD COLUMN gender VARCHAR(10);
        END IF;
        
        -- phone 컬럼 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'phone') THEN
            ALTER TABLE students ADD COLUMN phone VARCHAR(20);
        END IF;
        
        -- email 컬럼 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'email') THEN
            ALTER TABLE students ADD COLUMN email VARCHAR(100);
        END IF;
        
        -- 주소 관련 컬럼들
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'address_vietnam') THEN
            ALTER TABLE students ADD COLUMN address_vietnam TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'address_korea') THEN
            ALTER TABLE students ADD COLUMN address_korea TEXT;
        END IF;
        
        -- 부모님 정보
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'parent_name') THEN
            ALTER TABLE students ADD COLUMN parent_name VARCHAR(100);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'parent_phone') THEN
            ALTER TABLE students ADD COLUMN parent_phone VARCHAR(20);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'parent_income_level') THEN
            ALTER TABLE students ADD COLUMN parent_income_level VARCHAR(50);
        END IF;
        
        -- 학업 정보
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'high_school_name') THEN
            ALTER TABLE students ADD COLUMN high_school_name VARCHAR(200);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'high_school_gpa') THEN
            ALTER TABLE students ADD COLUMN high_school_gpa DECIMAL(3,2);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'enrollment_date') THEN
            ALTER TABLE students ADD COLUMN enrollment_date DATE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'target_university') THEN
            ALTER TABLE students ADD COLUMN target_university VARCHAR(200);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'target_major') THEN
            ALTER TABLE students ADD COLUMN target_major VARCHAR(200);
        END IF;
        
        -- 비자 정보
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'visa_type') THEN
            ALTER TABLE students ADD COLUMN visa_type VARCHAR(50);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'visa_expiry_date') THEN
            ALTER TABLE students ADD COLUMN visa_expiry_date DATE;
        END IF;
        
        -- 관계 컬럼들
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'agency_id') THEN
            ALTER TABLE students ADD COLUMN agency_id INTEGER REFERENCES agencies(agency_id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'created_by') THEN
            ALTER TABLE students ADD COLUMN created_by INTEGER REFERENCES users(user_id);
        END IF;
        
        -- 기타 컬럼들
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'notes') THEN
            ALTER TABLE students ADD COLUMN notes TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'is_active') THEN
            ALTER TABLE students ADD COLUMN is_active BOOLEAN DEFAULT true;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'created_at') THEN
            ALTER TABLE students ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'updated_at') THEN
            ALTER TABLE students ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        END IF;
    END IF;
END $$;

-- 인덱스 생성 (없는 경우만)
CREATE INDEX IF NOT EXISTS idx_students_code ON students(student_code);
CREATE INDEX IF NOT EXISTS idx_students_agency ON students(agency_id);
CREATE INDEX IF NOT EXISTS idx_students_active ON students(is_active);

-- 최종 확인
SELECT 'students 테이블 준비 완료!' as message;

-- 테이블 구조 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'students' 
AND table_schema = 'public'
ORDER BY ordinal_position;