-- =====================================================
-- users 테이블 수정 - user_id 컬럼 문제 해결
-- =====================================================

-- users 테이블이 없거나 잘못된 구조인 경우 처리
DO $$ 
BEGIN
    -- users 테이블이 없으면 생성
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        -- agencies 테이블이 없으면 먼저 생성 (users가 참조하므로)
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agencies') THEN
            CREATE TABLE agencies (
                agency_id SERIAL PRIMARY KEY,
                agency_name VARCHAR(200) NOT NULL,
                agency_code VARCHAR(50) UNIQUE NOT NULL,
                contact_person VARCHAR(100),
                phone VARCHAR(20),
                email VARCHAR(100),
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        END IF;
        
        -- users 테이블 생성
        CREATE TABLE users (
            user_id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100),
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(100),
            role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'branch')),
            agency_id INTEGER REFERENCES agencies(agency_id) ON DELETE SET NULL,
            agency_name VARCHAR(200),
            branch_name VARCHAR(200),
            is_active BOOLEAN DEFAULT true,
            last_login TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ELSE
        -- users 테이블은 있는데 user_id가 없는 경우 (id로 되어있을 수 있음)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'users' AND column_name = 'user_id') THEN
            
            -- id 컬럼이 있는지 확인
            IF EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'users' AND column_name = 'id') THEN
                -- id를 user_id로 rename
                ALTER TABLE users RENAME COLUMN id TO user_id;
            ELSE
                -- user_id도 id도 없다면 테이블을 drop하고 다시 생성
                DROP TABLE IF EXISTS users CASCADE;
                
                -- agencies 테이블 확인 및 생성
                IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agencies') THEN
                    CREATE TABLE agencies (
                        agency_id SERIAL PRIMARY KEY,
                        agency_name VARCHAR(200) NOT NULL,
                        agency_code VARCHAR(50) UNIQUE NOT NULL,
                        contact_person VARCHAR(100),
                        phone VARCHAR(20),
                        email VARCHAR(100),
                        address TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                END IF;
                
                -- users 테이블 재생성
                CREATE TABLE users (
                    user_id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100),
                    password_hash VARCHAR(255) NOT NULL,
                    full_name VARCHAR(100),
                    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'branch')),
                    agency_id INTEGER REFERENCES agencies(agency_id) ON DELETE SET NULL,
                    agency_name VARCHAR(200),
                    branch_name VARCHAR(200),
                    is_active BOOLEAN DEFAULT true,
                    last_login TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            END IF;
        END IF;
        
        -- 필요한 컬럼들 추가 (없는 경우)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'users' AND column_name = 'username') THEN
            ALTER TABLE users ADD COLUMN username VARCHAR(50);
            UPDATE users SET username = COALESCE(email, 'user_' || user_id::text) WHERE username IS NULL;
            ALTER TABLE users ALTER COLUMN username SET NOT NULL;
            ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'users' AND column_name = 'password_hash') THEN
            ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
            -- 기본 비밀번호 설정 (Admin123!@#)
            UPDATE users SET password_hash = '$2b$10$YHxJwM.0Q7Tw.U9S9h8MkuHBc0RGkVVLFyTQ45pPRkVL3K0dDRDZ.' 
            WHERE password_hash IS NULL;
            ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'users' AND column_name = 'role') THEN
            ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'branch';
            ALTER TABLE users ALTER COLUMN role SET NOT NULL;
            ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'teacher', 'branch'));
        END IF;
    END IF;
END $$;

-- consultation_types 테이블 생성 (없는 경우)
CREATE TABLE IF NOT EXISTS consultation_types (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    type_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 기본 상담 유형 데이터 삽입
INSERT INTO consultation_types (type_name, type_code, description, display_order) VALUES
    ('정기상담', 'regular', '월별 정기 상담', 1),
    ('학업상담', 'academic', '학업 관련 상담', 2),
    ('진로상담', 'career', '진로 및 대학 선택 상담', 3),
    ('생활상담', 'life', '일상 생활 관련 상담', 4),
    ('긴급상담', 'emergency', '긴급 상황 대응 상담', 5),
    ('기타', 'other', '기타 상담', 6)
ON CONFLICT (type_code) DO NOTHING;

-- 관리자 계정 생성 (없는 경우)
INSERT INTO users (username, email, password_hash, full_name, role, is_active)
SELECT 'admin', 'admin@vietnam-student.com', 
       '$2b$10$YHxJwM.0Q7Tw.U9S9h8MkuHBc0RGkVVLFyTQ45pPRkVL3K0dDRDZ.', -- Admin123!@#
       'System Administrator', 'admin', true
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'admin'
);

-- 최종 확인
SELECT 'users 테이블 수정 완료!' as message;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;