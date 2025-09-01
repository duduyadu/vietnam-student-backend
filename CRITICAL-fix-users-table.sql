-- =====================================================
-- 🚨 긴급: users 테이블 완전 재생성
-- 현재 users 테이블이 잘못된 구조로 되어 있음
-- =====================================================

-- 현재 users 테이블 구조 (잘못됨):
-- id, name, address, phone, created_at, agency_code
-- 
-- 필요한 구조:
-- user_id, username, email, password_hash, role, etc.

-- 1. 기존 잘못된 users 테이블 백업 후 삭제
ALTER TABLE IF EXISTS users RENAME TO users_backup_wrong;

-- 2. agencies 테이블 생성 (없는 경우)
CREATE TABLE IF NOT EXISTS agencies (
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

-- 3. 올바른 users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
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

-- 4. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_agency ON users(agency_id);

-- 5. consultation_types 테이블 생성 (없는 경우)
CREATE TABLE IF NOT EXISTS consultation_types (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    type_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. 기본 상담 유형 데이터 삽입
INSERT INTO consultation_types (type_name, type_code, description, display_order) VALUES
    ('정기상담', 'regular', '월별 정기 상담', 1),
    ('학업상담', 'academic', '학업 관련 상담', 2),
    ('진로상담', 'career', '진로 및 대학 선택 상담', 3),
    ('생활상담', 'life', '일상 생활 관련 상담', 4),
    ('긴급상담', 'emergency', '긴급 상황 대응 상담', 5),
    ('기타', 'other', '기타 상담', 6)
ON CONFLICT (type_code) DO NOTHING;

-- 7. 관리자 계정 생성
INSERT INTO users (username, email, password_hash, full_name, role, is_active)
VALUES (
    'admin', 
    'admin@vietnam-student.com', 
    '$2b$10$YHxJwM.0Q7Tw.U9S9h8MkuHBc0RGkVVLFyTQ45pPRkVL3K0dDRDZ.', -- Admin123!@#
    'System Administrator', 
    'admin', 
    true
) ON CONFLICT (username) DO NOTHING;

-- 8. 테스트용 교사 계정 생성
INSERT INTO users (username, email, password_hash, full_name, role, is_active)
VALUES (
    'teacher1', 
    'teacher1@vietnam-student.com', 
    '$2b$10$YHxJwM.0Q7Tw.U9S9h8MkuHBc0RGkVVLFyTQ45pPRkVL3K0dDRDZ.', -- Admin123!@#
    'Test Teacher', 
    'teacher', 
    true
) ON CONFLICT (username) DO NOTHING;

-- 9. 확인
SELECT 'users 테이블 재생성 완료!' as message;
SELECT user_id, username, email, role, is_active 
FROM users 
ORDER BY user_id;

-- 10. 테이블 구조 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;