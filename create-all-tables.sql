-- Supabase SQL Editor에서 이 전체 스크립트를 실행하세요
-- 모든 필수 테이블 생성

-- 1. audit_logs 테이블 생성 (로그인 기록 등)
CREATE TABLE IF NOT EXISTS audit_logs (
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

-- audit_logs 인덱스
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- 2. menu_items 테이블 생성
CREATE TABLE IF NOT EXISTS menu_items (
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

-- menu_items 인덱스
CREATE INDEX IF NOT EXISTS idx_menu_items_parent ON menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_key ON menu_items(item_key);

-- 3. menu_translations 테이블 생성
CREATE TABLE IF NOT EXISTS menu_translations (
  translation_id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES menu_items(item_id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  label VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(item_id, language)
);

-- menu_translations 인덱스
CREATE INDEX IF NOT EXISTS idx_menu_translations_item ON menu_translations(item_id);
CREATE INDEX IF NOT EXISTS idx_menu_translations_lang ON menu_translations(language);

-- 4. attribute_definitions 테이블 생성
CREATE TABLE IF NOT EXISTS attribute_definitions (
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

-- 5. student_attributes 테이블 생성
CREATE TABLE IF NOT EXISTS student_attributes (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
  attribute_id INTEGER REFERENCES attribute_definitions(attribute_id),
  attribute_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, attribute_id)
);

-- 6. exam_results 테이블 생성
CREATE TABLE IF NOT EXISTS exam_results (
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

-- exam_results 인덱스
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_date ON exam_results(exam_date);

-- 7. learning_progress 테이블 생성
CREATE TABLE IF NOT EXISTS learning_progress (
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

-- 8. academic_goals 테이블 생성
CREATE TABLE IF NOT EXISTS academic_goals (
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

-- 9. report_templates 테이블 생성
CREATE TABLE IF NOT EXISTS report_templates (
  template_id SERIAL PRIMARY KEY,
  template_name VARCHAR(100) NOT NULL,
  template_type VARCHAR(50) NOT NULL,
  template_content JSONB,
  is_default BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. generated_reports 테이블 생성
CREATE TABLE IF NOT EXISTS generated_reports (
  report_id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(student_id),
  template_id INTEGER REFERENCES report_templates(template_id),
  report_type VARCHAR(50) NOT NULL,
  report_data JSONB,
  file_path TEXT,
  generated_by INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. 기본 메뉴 데이터 삽입
INSERT INTO menu_items (item_key, path, icon, display_order, required_role) VALUES
('dashboard', '/dashboard', 'Dashboard', 1, null),
('students', '/students', 'People', 2, null),
('consultations', '/consultations', 'Assignment', 3, null),
('agencies', '/agencies', 'Business', 4, 'admin'),
('reports', '/reports', 'Description', 5, null),
('excel', '/excel', 'TableChart', 6, null),
('users', '/users', 'ManageAccounts', 7, 'admin')
ON CONFLICT (item_key) DO NOTHING;

-- 12. 메뉴 번역 데이터 삽입
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
FROM menu_items
ON CONFLICT (item_id, language) DO NOTHING;

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
FROM menu_items
ON CONFLICT (item_id, language) DO NOTHING;

-- 13. 테이블 확인
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'users', 'students', 'agencies', 'consultations', 'consultation_types',
      'audit_logs', 'menu_items', 'menu_translations', 'attribute_definitions',
      'student_attributes', 'exam_results', 'learning_progress', 'academic_goals',
      'report_templates', 'generated_reports'
    ) THEN '✅ OK'
    ELSE '❌ Missing'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;