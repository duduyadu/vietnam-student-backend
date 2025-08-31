-- 이 파일을 Supabase SQL Editor에서 실행하세요

-- 1. agencies 테이블 생성
CREATE TABLE IF NOT EXISTS agencies (
  agency_id SERIAL PRIMARY KEY,
  agency_name VARCHAR(100) NOT NULL,
  agency_code VARCHAR(20) UNIQUE NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(user_id)
);

-- agencies 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_agencies_code ON agencies(agency_code);
CREATE INDEX IF NOT EXISTS idx_agencies_name ON agencies(agency_name);

-- 2. consultation_types 테이블 생성
CREATE TABLE IF NOT EXISTS consultation_types (
  type_id SERIAL PRIMARY KEY,
  type_code VARCHAR(20) UNIQUE NOT NULL,
  type_name VARCHAR(100) NOT NULL,
  type_name_ko VARCHAR(100),
  type_name_vi VARCHAR(100),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- consultation_types 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_consultation_types_code ON consultation_types(type_code);
CREATE INDEX IF NOT EXISTS idx_consultation_types_active ON consultation_types(is_active);

-- 3. consultations 테이블이 없으면 생성
CREATE TABLE IF NOT EXISTS consultations (
  consultation_id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(student_id),
  consultation_date DATE NOT NULL,
  consultation_type VARCHAR(50),
  teacher_id INTEGER REFERENCES users(user_id),
  notes TEXT,
  action_items TEXT,
  next_consultation_date DATE,
  created_by INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- consultations 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_consultations_student ON consultations(student_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(consultation_date);
CREATE INDEX IF NOT EXISTS idx_consultations_teacher ON consultations(teacher_id);

-- 4. 기본 데이터 삽입

-- agencies 기본 데이터
INSERT INTO agencies (agency_name, agency_code, contact_person, phone, email, address)
VALUES 
  ('하노이 유학원', '001', '김철수', '024-1234-5678', 'hanoi@edu.vn', '하노이시 동다구'),
  ('호치민 유학원', '002', '이영희', '028-9876-5432', 'hcmc@edu.vn', '호치민시 1군'),
  ('다낭 유학원', '003', '박민수', '0236-456-7890', 'danang@edu.vn', '다낭시 해안구')
ON CONFLICT (agency_code) DO NOTHING;

-- consultation_types 기본 데이터
INSERT INTO consultation_types (type_code, type_name, type_name_ko, type_name_vi, description, display_order)
VALUES 
  ('REGULAR', '정기 상담', '정기 상담', 'Tư vấn định kỳ', '매월 진행하는 정기 상담', 1),
  ('ACADEMIC', '학업 상담', '학업 상담', 'Tư vấn học tập', '학업 성취도 및 진로 상담', 2),
  ('LIFE', '생활 상담', '생활 상담', 'Tư vấn sinh hoạt', '일상 생활 관련 상담', 3),
  ('CAREER', '진로 상담', '진로 상담', 'Tư vấn hướng nghiệp', '대학 진학 및 진로 상담', 4),
  ('EMERGENCY', '긴급 상담', '긴급 상담', 'Tư vấn khẩn cấp', '긴급한 문제 발생 시 상담', 5),
  ('PARENT', '학부모 상담', '학부모 상담', 'Tư vấn phụ huynh', '학부모와 함께하는 상담', 6)
ON CONFLICT (type_code) DO NOTHING;

-- 5. 테이블 확인 쿼리
SELECT 'agencies' as table_name, COUNT(*) as row_count FROM agencies
UNION ALL
SELECT 'consultation_types', COUNT(*) FROM consultation_types
UNION ALL
SELECT 'consultations', COUNT(*) FROM consultations;