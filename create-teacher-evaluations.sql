-- =====================================================
-- teacher_evaluations 테이블 생성 (누락된 테이블)
-- 2025-09-03 ULTRATHINK 분석으로 발견된 누락 테이블
-- =====================================================

-- teacher_evaluations 테이블 생성
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
  status VARCHAR(20) DEFAULT 'draft', -- draft, shared, finalized
  attachments TEXT, -- JSON 형식으로 추가 데이터 저장
  
  created_by INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_teacher_evaluations_student ON teacher_evaluations(student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_evaluations_teacher ON teacher_evaluations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_evaluations_date ON teacher_evaluations(evaluation_date);
CREATE INDEX IF NOT EXISTS idx_teacher_evaluations_status ON teacher_evaluations(status);

-- 코멘트 추가
COMMENT ON TABLE teacher_evaluations IS '교사별 학생 평가 기록';
COMMENT ON COLUMN teacher_evaluations.evaluation_type IS '평가 유형: monthly, midterm, final 등';
COMMENT ON COLUMN teacher_evaluations.status IS '평가 상태: draft(초안), shared(공유됨), finalized(최종)';
COMMENT ON COLUMN teacher_evaluations.attachments IS 'JSON 형식의 추가 데이터';

-- =====================================================
-- generated_reports 테이블 수정 (외래키 제약 수정)
-- PDF 생성 오류 해결 - ULTRATHINK 분석 결과
-- =====================================================

-- 기존 외래키 제약 확인 및 제거 (모든 가능한 제약 이름)
ALTER TABLE generated_reports 
  DROP CONSTRAINT IF EXISTS fk_report_student;
  
ALTER TABLE generated_reports 
  DROP CONSTRAINT IF EXISTS generated_reports_student_id_fkey;

-- 새로운 외래키 제약 추가 (ON DELETE SET NULL)
-- 이렇게 하면 학생이 삭제되어도 보고서 기록은 남음
ALTER TABLE generated_reports
  ADD CONSTRAINT fk_report_student 
  FOREIGN KEY (student_id) 
  REFERENCES students(student_id) 
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- generated_reports 테이블에 누락된 컬럼들 추가 (필요한 경우)
ALTER TABLE generated_reports 
  ADD COLUMN IF NOT EXISTS report_title VARCHAR(500),
  ADD COLUMN IF NOT EXISTS report_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS period_start DATE,
  ADD COLUMN IF NOT EXISTS period_end DATE,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS pdf_path TEXT,
  ADD COLUMN IF NOT EXISTS html_path TEXT,
  ADD COLUMN IF NOT EXISTS file_size INTEGER,
  ADD COLUMN IF NOT EXISTS generation_time_ms INTEGER,
  ADD COLUMN IF NOT EXISTS generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS error_message TEXT;

-- =====================================================
-- students 테이블에 status 컬럼 추가 (누락된 경우)
-- =====================================================

ALTER TABLE students 
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- status 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

-- =====================================================
-- 확인 쿼리
-- =====================================================

-- 생성된 테이블 확인
SELECT 
  'teacher_evaluations' as table_name, 
  COUNT(*) as row_count,
  'Created' as status
FROM teacher_evaluations

UNION ALL

SELECT 
  'students.status column' as table_name,
  COUNT(*) as row_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 'Column exists'
    ELSE 'Column added'
  END as status
FROM information_schema.columns
WHERE table_name = 'students' 
  AND column_name = 'status'
  AND table_schema = 'public';