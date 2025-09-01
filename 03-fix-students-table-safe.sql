-- =====================================================
-- students 테이블 안전하게 수정
-- users 테이블이 정상적으로 수정된 후 실행
-- =====================================================

-- students 테이블 생성 또는 수정
DO $$ 
BEGIN
    -- students 테이블이 없으면 생성
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
        -- 테이블이 존재하면 필요한 컬럼만 추가
        
        -- student_code 컬럼 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'student_code') THEN
            ALTER TABLE students ADD COLUMN student_code VARCHAR(50);
            UPDATE students SET student_code = 'STU' || LPAD(student_id::text, 6, '0') WHERE student_code IS NULL;
            ALTER TABLE students ALTER COLUMN student_code SET NOT NULL;
            BEGIN
                ALTER TABLE students ADD CONSTRAINT students_student_code_unique UNIQUE (student_code);
            EXCEPTION WHEN duplicate_object THEN
                NULL; -- 이미 제약조건이 있으면 무시
            END;
        END IF;
        
        -- 다른 필요한 컬럼들 추가 (각각 체크)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'name_korean') THEN
            ALTER TABLE students ADD COLUMN name_korean VARCHAR(100);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'name_vietnamese') THEN
            ALTER TABLE students ADD COLUMN name_vietnamese VARCHAR(100);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'created_by') THEN
            -- users 테이블과 user_id 컬럼이 존재하는지 확인
            IF EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'users' AND column_name = 'user_id') THEN
                ALTER TABLE students ADD COLUMN created_by INTEGER REFERENCES users(user_id);
            END IF;
        END IF;
        
        -- agency_id 컬럼 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'students' AND column_name = 'agency_id') THEN
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agencies') THEN
                ALTER TABLE students ADD COLUMN agency_id INTEGER REFERENCES agencies(agency_id);
            END IF;
        END IF;
        
        -- 나머지 컬럼들 추가
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
SELECT 'students 테이블 수정 완료!' as message;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'students' 
AND table_schema = 'public'
ORDER BY ordinal_position;