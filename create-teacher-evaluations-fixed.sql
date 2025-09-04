-- =====================================================
-- teacher_evaluations 테이블 생성 (누락된 테이블)
-- 2025-09-03 ULTRATHINK 분석으로 발견된 누락 테이블
-- Supabase에서 각 섹션별로 실행하세요
-- =====================================================

-- SECTION 1: teacher_evaluations 테이블 생성
CREATE TABLE IF NOT EXISTS teacher_evaluations (
  evaluation_id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
  teacher_id INTEGER REFERENCES users(user_id),
  evaluation_type VARCHAR(50) NOT NULL,
  evaluation_date DATE NOT NULL,
  
  -- 평가 내용
  academic_performance TEXT,
  class_participation TEXT,
  homework_completion TEXT,
  behavior_attitude TEXT,
  korean_proficiency TEXT,
  
  -- 점수/등급 (선택적)
  overall_grade VARCHAR(10),
  attendance_rate DECIMAL(5,2),
  
  -- 상세 피드백
  strengths TEXT,
  weaknesses TEXT,
  recommendations TEXT,
  
  -- 메타데이터
  status VARCHAR(20) DEFAULT 'draft',
  attachments TEXT,
  
  created_by INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SECTION 2: 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_teacher_evaluations_student ON teacher_evaluations(student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_evaluations_teacher ON teacher_evaluations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_evaluations_date ON teacher_evaluations(evaluation_date);
CREATE INDEX IF NOT EXISTS idx_teacher_evaluations_status ON teacher_evaluations(status);

-- SECTION 3: generated_reports 테이블 외래키 수정
-- 기존 외래키 제약 제거
ALTER TABLE generated_reports 
  DROP CONSTRAINT IF EXISTS fk_report_student;
  
ALTER TABLE generated_reports 
  DROP CONSTRAINT IF EXISTS generated_reports_student_id_fkey;

-- SECTION 4: 새로운 외래키 제약 추가
ALTER TABLE generated_reports
  ADD CONSTRAINT fk_report_student 
  FOREIGN KEY (student_id) 
  REFERENCES students(student_id) 
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- SECTION 5: generated_reports 테이블에 누락된 컬럼 추가
ALTER TABLE generated_reports 
  ADD COLUMN IF NOT EXISTS report_title VARCHAR(500);

ALTER TABLE generated_reports 
  ADD COLUMN IF NOT EXISTS report_date DATE DEFAULT CURRENT_DATE;

ALTER TABLE generated_reports 
  ADD COLUMN IF NOT EXISTS period_start DATE;

ALTER TABLE generated_reports 
  ADD COLUMN IF NOT EXISTS period_end DATE;

ALTER TABLE generated_reports 
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'completed';

ALTER TABLE generated_reports 
  ADD COLUMN IF NOT EXISTS pdf_path TEXT;

ALTER TABLE generated_reports 
  ADD COLUMN IF NOT EXISTS html_path TEXT;

ALTER TABLE generated_reports 
  ADD COLUMN IF NOT EXISTS file_size INTEGER;

ALTER TABLE generated_reports 
  ADD COLUMN IF NOT EXISTS generation_time_ms INTEGER;

ALTER TABLE generated_reports 
  ADD COLUMN IF NOT EXISTS generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE generated_reports 
  ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP;

ALTER TABLE generated_reports 
  ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0;

ALTER TABLE generated_reports 
  ADD COLUMN IF NOT EXISTS error_message TEXT;

-- SECTION 6: students 테이블에 status 컬럼 추가
ALTER TABLE students 
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- SECTION 7: status 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

-- SECTION 8: 확인 쿼리 (별도로 실행)
-- 이 부분은 위의 모든 작업 완료 후 별도로 실행하세요
SELECT 
  'teacher_evaluations' as table_name, 
  COUNT(*) as row_count,
  'Created' as status
FROM teacher_evaluations;

-- students.status 컬럼 확인
SELECT 
  COUNT(*) as column_exists
FROM information_schema.columns
WHERE table_name = 'students' 
  AND column_name = 'status'
  AND table_schema = 'public';