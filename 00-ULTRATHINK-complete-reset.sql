-- =====================================================
-- 🔥 ULTRATHINK 완전 리셋 스크립트
-- 모든 문제를 한 번에 해결하는 궁극의 솔루션
-- =====================================================

-- ⚠️ 주의: 이 스크립트는 모든 테이블을 삭제하고 다시 생성합니다.
-- 데이터가 있다면 백업하세요!

-- =====================================================
-- STEP 1: 모든 기존 테이블 삭제 (CASCADE로 외래 키 문제 해결)
-- =====================================================
DROP TABLE IF EXISTS generated_reports CASCADE;
DROP TABLE IF EXISTS report_templates CASCADE;
DROP TABLE IF EXISTS academic_goals CASCADE;
DROP TABLE IF EXISTS learning_progress CASCADE;
DROP TABLE IF EXISTS exam_results CASCADE;
DROP TABLE IF EXISTS student_attributes CASCADE;
DROP TABLE IF EXISTS attribute_definitions CASCADE;
DROP TABLE IF EXISTS menu_translations CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS consultations CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS consultation_types CASCADE;
DROP TABLE IF EXISTS agencies CASCADE;

-- 백업 테이블도 삭제
DROP TABLE IF EXISTS users_backup_wrong CASCADE;

-- =====================================================
-- STEP 2: 독립 테이블부터 생성 (외래 키 없음)
-- =====================================================

-- 2-1. agencies 테이블
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

-- 2-2. consultation_types 테이블
CREATE TABLE consultation_types (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    type_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- STEP 3: users 테이블 생성 (agencies 참조)
-- =====================================================
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

-- 인덱스 생성
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_agency ON users(agency_id);

-- =====================================================
-- STEP 4: students 테이블 생성 (users, agencies 참조)
-- =====================================================
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

-- 인덱스 생성
CREATE INDEX idx_students_code ON students(student_code);
CREATE INDEX idx_students_agency ON students(agency_id);
CREATE INDEX idx_students_active ON students(is_active);

-- =====================================================
-- STEP 5: consultations 테이블 생성
-- =====================================================
CREATE TABLE consultations (
    consultation_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
    consultation_type_id INTEGER REFERENCES consultation_types(type_id),
    consultation_date DATE NOT NULL,
    counselor_id INTEGER REFERENCES users(user_id),
    counselor_name VARCHAR(100),
    consultation_content TEXT,
    improvement_points TEXT,
    next_goals TEXT,
    attachments TEXT,
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_consultations_student ON consultations(student_id);
CREATE INDEX idx_consultations_date ON consultations(consultation_date);
CREATE INDEX idx_consultations_counselor ON consultations(counselor_id);

-- =====================================================
-- STEP 6: audit_logs 테이블
-- =====================================================
CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_sensitive_access BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- =====================================================
-- STEP 7: menu 관련 테이블들
-- =====================================================
CREATE TABLE menu_items (
    item_id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES menu_items(item_id),
    item_key VARCHAR(50) UNIQUE NOT NULL,
    path VARCHAR(200),
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    required_role VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_items_parent ON menu_items(parent_id);
CREATE INDEX idx_menu_items_key ON menu_items(item_key);

CREATE TABLE menu_translations (
    translation_id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES menu_items(item_id) ON DELETE CASCADE,
    language VARCHAR(5) NOT NULL,
    label VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_id, language)
);

CREATE INDEX idx_menu_translations_item ON menu_translations(item_id);
CREATE INDEX idx_menu_translations_lang ON menu_translations(language);

-- =====================================================
-- STEP 8: 추가 테이블들
-- =====================================================
CREATE TABLE attribute_definitions (
    attribute_id SERIAL PRIMARY KEY,
    attribute_key VARCHAR(50) UNIQUE NOT NULL,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_type VARCHAR(20) NOT NULL,
    category VARCHAR(50),
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    validation_rules JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_attributes (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
    attribute_id INTEGER REFERENCES attribute_definitions(attribute_id),
    attribute_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, attribute_id)
);

CREATE TABLE exam_results (
    exam_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
    exam_type VARCHAR(50) NOT NULL,
    exam_date DATE NOT NULL,
    reading_score INTEGER,
    listening_score INTEGER,
    writing_score INTEGER,
    total_score INTEGER,
    exam_level VARCHAR(20),
    notes TEXT,
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exam_results_student ON exam_results(student_id);
CREATE INDEX idx_exam_results_date ON exam_results(exam_date);

CREATE TABLE learning_progress (
    progress_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    assessment_date DATE NOT NULL,
    score DECIMAL(5,2),
    grade VARCHAR(10),
    teacher_comments TEXT,
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE academic_goals (
    goal_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL,
    university_name VARCHAR(200),
    major VARCHAR(200),
    target_date DATE,
    status VARCHAR(50) DEFAULT 'planning',
    notes TEXT,
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE report_templates (
    template_id SERIAL PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    template_content JSONB,
    is_default BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE generated_reports (
    report_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id),
    template_id INTEGER REFERENCES report_templates(template_id),
    report_type VARCHAR(50) NOT NULL,
    report_data JSONB,
    file_path TEXT,
    generated_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- STEP 9: 기본 데이터 삽입
-- =====================================================

-- 상담 유형 기본 데이터
INSERT INTO consultation_types (type_name, type_code, description, display_order) VALUES
    ('정기상담', 'regular', '월별 정기 상담', 1),
    ('학업상담', 'academic', '학업 관련 상담', 2),
    ('진로상담', 'career', '진로 및 대학 선택 상담', 3),
    ('생활상담', 'life', '일상 생활 관련 상담', 4),
    ('긴급상담', 'emergency', '긴급 상황 대응 상담', 5),
    ('기타', 'other', '기타 상담', 6);

-- 메뉴 아이템 기본 데이터
INSERT INTO menu_items (item_key, path, icon, display_order, required_role) VALUES
    ('dashboard', '/dashboard', 'Dashboard', 1, null),
    ('students', '/students', 'People', 2, null),
    ('consultations', '/consultations', 'Assignment', 3, null),
    ('agencies', '/agencies', 'Business', 4, 'admin'),
    ('reports', '/reports', 'Description', 5, null),
    ('excel', '/excel', 'TableChart', 6, null),
    ('users', '/users', 'ManageAccounts', 7, 'admin');

-- 메뉴 번역 (한국어)
INSERT INTO menu_translations (item_id, language, label) 
SELECT item_id, 'ko', 
    CASE item_key
        WHEN 'dashboard' THEN '대시보드'
        WHEN 'students' THEN '학생 관리'
        WHEN 'consultations' THEN '상담 기록'
        WHEN 'agencies' THEN '유학원 관리'
        WHEN 'reports' THEN '보고서'
        WHEN 'excel' THEN '엑셀 관리'
        WHEN 'users' THEN '사용자 관리'
    END
FROM menu_items;

-- 메뉴 번역 (베트남어)
INSERT INTO menu_translations (item_id, language, label) 
SELECT item_id, 'vi', 
    CASE item_key
        WHEN 'dashboard' THEN 'Bảng điều khiển'
        WHEN 'students' THEN 'Quản lý sinh viên'
        WHEN 'consultations' THEN 'Hồ sơ tư vấn'
        WHEN 'agencies' THEN 'Quản lý công ty'
        WHEN 'reports' THEN 'Báo cáo'
        WHEN 'excel' THEN 'Quản lý Excel'
        WHEN 'users' THEN 'Quản lý người dùng'
    END
FROM menu_items;

-- 관리자 계정 생성
INSERT INTO users (username, email, password_hash, full_name, role, is_active)
VALUES (
    'admin', 
    'admin@vietnam-student.com', 
    '$2b$10$YHxJwM.0Q7Tw.U9S9h8MkuHBc0RGkVVLFyTQ45pPRkVL3K0dDRDZ.', -- Admin123!@#
    'System Administrator', 
    'admin', 
    true
);

-- =====================================================
-- STEP 10: 최종 확인
-- =====================================================
SELECT '✅ 모든 테이블이 성공적으로 생성되었습니다!' as message;

-- 생성된 테이블 목록
SELECT table_name, '✅ OK' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- users 테이블 확인
SELECT '===== users 테이블 확인 =====' as info;
SELECT user_id, username, email, role FROM users;

-- 테이블 개수 확인
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';