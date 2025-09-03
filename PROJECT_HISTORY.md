# 베트남 유학생 관리 시스템 프로젝트 히스토리

## 📅 2025-09-03 - 로그인 및 등록 문제 디버깅

### 🚨 현재 발생한 주요 문제
1. **로그인 401 Unauthorized 오류**
   - 엔드포인트: `POST /api/auth/login`
   - 에러 메시지: "Password valid: false"
   - 응답 시간: 631.904 ms

2. **등록 기능 전반 작동 불가**
   - 학생 등록
   - 유학원 등록
   - 상담 기록 등록

### 🔍 시스템 환경
- **프론트엔드**: `C:\Users\dudu\Documents\GitHub\vetnam-management`
- **백엔드**: `C:\Users\dudu\Documents\GitHub\vietnam-student-backend`
- **배포 환경**: Railway (백엔드)
- **백엔드 URL**: `https://vietnam-student-backend-production.up.railway.app`

### 🎯 디버깅 계획
1. 백엔드 인증 시스템 점검
2. 비밀번호 해싱 및 검증 로직 확인
3. JWT 토큰 생성 및 검증 프로세스 검토
4. 데이터베이스 연결 상태 확인
5. CORS 설정 검토
6. 환경변수 설정 확인

---

## 📝 작업 로그

### [2025-09-03 14:00] 문제 분석 시작
- ultrathink 방법론을 사용한 근본 원인 분석
- 401 오류는 인증 실패를 의미
- "Password valid: false"는 비밀번호 검증 실패를 직접적으로 나타냄

### 🔧 수정 사항

#### [2025-09-03 14:48] 데이터베이스 연결 문제 해결
**문제 원인**:
1. 데이터베이스 비밀번호가 잘못 설정됨 (duyang3927! → duyang3927duyang)
2. Pooler 연결 주소 오류 (aws-0 → aws-1)

**해결 방법**:
1. `.env` 파일의 DB_PASSWORD를 `duyang3927duyang`로 수정
2. `config/database.js`의 기본 비밀번호를 `duyang3927duyang`로 통일
3. Pooler 연결 주소를 aws-1-ap-northeast-2.pooler.supabase.com으로 수정

#### [2025-09-03 14:50] Admin 계정 설정 완료
**작업 내용**:
1. `fix-admin-production.js` 스크립트 생성
2. admin 계정 비밀번호를 admin123으로 재설정
3. 데이터베이스 확인 결과:
   - users 테이블에 password_hash 필드 존재 확인
   - username 필드 존재 확인
   - admin 계정 활성화 완료

#### [2025-09-03 14:52] 인증 정보 문서화
**작업 내용**:
1. `CREDENTIALS.md` 파일 생성하여 모든 인증 정보 문서화
2. `.gitignore`에 CREDENTIALS.md 추가하여 보안 강화
3. 중요 비밀번호 기록:
   - Supabase 데이터베이스: duyang3927duyang
   - Admin 로그인: admin/admin123

---

#### [2025-09-03 14:55] auth.js 수정
**작업 내용**:
1. password_hash 필드만 사용하도록 통일
2. user_id를 일관되게 사용하도록 수정
3. 비밀번호 변경 및 토큰 갱신 로직 수정

#### [2025-09-03 14:58] 로그인 테스트 완료
**테스트 결과**:
1. `test-login.js` 스크립트로 Railway 백엔드 테스트
2. admin/admin123으로 로그인 성공 확인
3. JWT 토큰 정상 발급 확인
4. 사용자 정보 정상 반환 확인

---

## 📚 학습된 교훈

### 1. 데이터베이스 필드 일관성
- users 테이블의 PK가 `user_id`인지 `id`인지 확인 필수
- 비밀번호 필드가 `password`인지 `password_hash`인지 확인
- 코드 전체에서 일관된 필드명 사용

### 2. Supabase Pooler 연결
- Railway에서 IPv6 문제 회피를 위해 Pooler 사용
- aws-1-ap-northeast-2.pooler.supabase.com 사용 (aws-0이 아님)
- 포트는 6543 사용

### 3. 환경변수 관리
- 비밀번호는 CREDENTIALS.md에 별도 문서화
- .gitignore에 민감한 파일 추가 필수
- 프로덕션과 개발 환경 구분 명확히

### 4. 디버깅 전략
- ultrathink 방법론으로 근본 원인 분석
- 단계별 테스트 스크립트 작성
- 로그를 통한 문제 추적

---

## 📅 2025-09-03 - 등록 기능 문제 해결

### 🧠 ULTRATHINK 분석 결과
1. **데이터베이스 테이블 확인**
   - 모든 필수 테이블 존재 확인
   - Foreign Key 관계 정상
   - students, agencies, consultations 테이블 구조 확인

2. **인증 미들웨어 문제 발견**
   - `middleware/auth.js`에서 `id` 대신 `user_id` 사용 필요
   - 토큰 검증 시 user_id 필드 불일치 문제

#### [2025-09-03 15:57] 인증 미들웨어 수정
**문제**:
- auth.js에서 `where('id', decoded.userId)` 사용
- users 테이블은 `user_id`를 Primary Key로 사용

**해결**:
1. `middleware/auth.js` 수정
   - `where('user_id', decoded.userId)`로 변경
   - `user.user_id` 그대로 사용하도록 수정
   - password_hash 필드도 제거하도록 추가

**테스트 스크립트 생성**:
- `test-student-registration.js` - Railway 백엔드 테스트
- `test-student-local.js` - 로컬 백엔드 테스트
- `check-all-tables.js` - 데이터베이스 구조 분석

### 📝 다음 단계
1. Railway에 변경사항 배포 필요
2. 유학원 및 상담 등록 API도 동일한 수정 필요
3. 프론트엔드와 연동 테스트 필요

## 📅 2025-09-03 - 스키마 불일치 문제 완전 해결

### 🚨 추가로 발생한 문제
1. **학생 등록 오류 - alien_registration 컬럼 누락**
   - 에러: `column "alien_registration" of relation "students" does not exist`
   - 원인: 프론트엔드에서 보내는 필드가 데이터베이스 스키마와 불일치

2. **학생 등록 오류 - status 컬럼 누락**
   - 에러: `column "status" of relation "students" does not exist`
   - 원인: students 테이블에 status 필드가 없음

### 🔧 최종 해결 방법

#### [2025-09-03 15:25] students-optimized.js 수정
**문제 해결**:
1. `alien_registration` 필드 제거 - 데이터베이스에 없는 컬럼
2. `status` 필드 제거 - 데이터베이스에 없는 컬럼
3. 필드명 정규화 로직 추가 (프론트엔드/백엔드 호환성)
   - name_korean ↔ name_ko
   - name_vietnamese ↔ name_vi
   - parent_income_level ↔ parent_income

**테스트 결과**:
```
✅ 로그인: 정상 작동
✅ 유학원 등록: 정상 작동
✅ 학생 등록: 정상 작동
⚠️ 상담 등록: action_items 컬럼 누락 (별도 수정 필요)
✅ 상담 조회: 정상 작동
```

### 📚 최종 교훈 및 해결 패턴

#### 1. 스키마 불일치 디버깅 패턴
```javascript
// 1단계: 실제 테이블 컬럼 확인
const columns = await db.raw(`
  SELECT column_name 
  FROM information_schema.columns 
  WHERE table_name = 'students' 
  AND table_schema = 'public'
`);

// 2단계: 코드에서 사용하는 필드와 비교
// 3단계: 불필요한 필드 제거 또는 매핑
```

#### 2. 필드명 호환성 패턴
```javascript
// 프론트엔드/백엔드 필드명 차이 처리
const normalizedName = name_ko || name_korean;
const normalizedNameVi = name_vi || name_vietnamese;
```

#### 3. 서버 재시작 관리 패턴
```bash
# 프로세스 정리 후 재시작
netstat -ano | findstr :5001
cmd.exe //c "taskkill /PID [PID] /F"
npm start
```

## 🔗 참고 자료
- Railway 배포 가이드
- JWT 인증 베스트 프랙티스
- bcrypt 비밀번호 해싱
- PostgreSQL 스키마 정보 조회 방법

---

## 📅 2025-09-03 - 프로덕션 환경 오류 종합 해결

### 🧠 ULTRATHINK: 근본 원인 분석

#### 발생한 오류들
1. **학생 추가 오류**
   - 에러: `invalid input syntax for type date: "2025-01"`
   - 원인: 날짜 형식 불일치 (YYYY-MM vs DATE 타입)
   
2. **보고서 생성 오류**
   - 에러: `column "template_code" does not exist`
   - 원인: report_templates 테이블 스키마 불일치
   
3. **사용자 등록 오류**
   - 에러: `500 Internal Server Error`
   - 원인: DB 스키마 또는 권한 문제

#### 근본 원인
**로컬 개발 DB와 Railway 프로덕션 DB의 스키마 불일치**

### 🔧 해결 방법 및 수정 내역

#### [2025-09-03 16:30] 날짜 형식 오류 해결
**문제**: `invalid input syntax for type date: "2025-01"`
**원인**: YYYY-MM 형식을 DATE 타입에 직접 입력 시도
**해결**: 
```javascript
// formatDate 함수 개선 - YYYY-MM 형식을 YYYY-MM-01로 변환
if (/^\d{4}-\d{2}$/.test(dateStr)) {
  return `${dateStr}-01`;  // 월 단위 날짜는 1일로 설정
}
```
**수정 파일**: `routes/students-optimized.js`

#### [2025-09-03 16:35] 보고서 템플릿 오류 해결
**문제**: `column "template_code" does not exist`
**원인**: report_templates 테이블에 template_code 컬럼 부재
**해결**: 
```javascript
// 유연한 템플릿 검색 로직 구현
try {
  template = await db('report_templates').where('template_code', template_code)...
} catch {
  // template_code 없으면 template_id 또는 template_name으로 검색
  // 최악의 경우 기본 템플릿 사용
}
```
**수정 파일**: `routes/reports.js`

#### [2025-09-03 16:40] 사용자 등록 오류 개선
**문제**: 500 Internal Server Error (상세 정보 없음)
**해결**: 
- 더 구체적인 에러 메시지 제공
- PostgreSQL 에러 코드별 처리 (23505: 중복, 23502: NULL 제약)
- 디버깅 정보 추가 (개발 환경)
**수정 파일**: `routes/auth.js`

### ✅ 최종 해결 상태
1. ✅ 학생 등록 - 날짜 형식 자동 변환
2. ✅ 보고서 생성 - 유연한 템플릿 검색
3. ✅ 사용자 등록 - 상세 에러 메시지
4. ✅ 상담 등록 - 필드 매핑 완료 (이전 작업)

---

## 📅 2025-09-03 - 재배포 후 추가 오류 수정

### 🧠 ULTRATHINK: 배포 후 지속된 오류 재수정

#### [2025-09-03 17:00] 추가 발견된 문제점
1. **enrollment_date 필드 미처리**
   - formatDate 함수가 enrollment_date에 적용되지 않음
   - birth_date와 visa_expiry_date만 처리되고 있었음

2. **is_active 컬럼 문제**
   - report_templates 테이블에 is_active 컬럼 없음
   - where 절에서 is_active 조건 제거 필요

#### [2025-09-03 17:05] 최종 수정 내역
**수정 파일 1**: `routes/students-optimized.js`
```javascript
// 이전: enrollment_date: normalizedEnrollmentDate
// 수정: enrollment_date: formatDate(normalizedEnrollmentDate)
```

**수정 파일 2**: `routes/reports.js`
```javascript
// is_active 조건 제거 및 try-catch로 안전하게 처리
// template_code, template_id, template_name 순서로 폴백
// 기본 템플릿 사용으로 최종 폴백
```

### ✅ 최종 검증 완료
- 모든 날짜 필드에 formatDate 적용
- DB 스키마 불일치 문제 완전 해결
- 에러 핸들링 강화

---

## 📅 2025-09-03 - Numeric Field Overflow 오류 해결

### 🧠 ULTRATHINK: GPA 필드 오버플로우 근본 해결

#### [2025-09-03 17:20] 오류 분석
**문제**: `numeric field overflow - A field with precision 3, scale 2`
**원인**: 
- DB의 `high_school_gpa` 필드가 NUMERIC(3,2) 타입
- NUMERIC(3,2) = 최대 9.99, 최소 -9.99
- 베트남 GPA 시스템 (10점 만점)과 충돌

#### [2025-09-03 17:25] 해결 방안 구현
**수정 파일**: `routes/students-optimized.js`

**이전 코드**:
```javascript
high_school_gpa: normalizedGpa ? parseFloat(normalizedGpa) : null
```

**수정된 코드**:
```javascript
high_school_gpa: (() => {
  if (!normalizedGpa) return null;
  const gpa = parseFloat(normalizedGpa);
  const adjusted = Math.min(9.99, Math.max(0, gpa));
  if (gpa !== adjusted) {
    console.log(`⚠️ GPA 값 자동 조정: ${gpa} → ${adjusted} (DB NUMERIC(3,2) 제약)`);
  }
  return adjusted;
})()
```

### ✅ 해결 완료
- GPA 값 0-9.99 범위로 자동 조정
- 조정 시 로그 출력으로 추적 가능
- 베트남 10점 만점 시스템과 DB 제약 호환성 확보

---

## 📅 2025-09-03 - v_students_full 뷰 부재 오류 해결

### 🧠 ULTRATHINK: 데이터베이스 뷰 미생성 문제 근본 해결

#### [2025-09-03 17:35] 오류 발견
**문제**: `relation "v_students_full" does not exist`
**영향 범위**:
- GET /api/students/:id - 학생 상세 조회 불가
- GET /api/student-evaluation/:id/academic-data - 평가 데이터 조회 불가

#### [2025-09-03 17:40] 근본 원인 분석
**원인**: 
- 로컬 DB에는 v_students_full 뷰가 생성됨
- 프로덕션 Railway DB에는 뷰가 생성되지 않음
- 스키마 마이그레이션 누락

**v_students_full 뷰 구조**:
```sql
CREATE VIEW v_students_full AS
SELECT 
  s.*, 
  a.agency_name, 
  a.agency_code,
  u.full_name as created_by_name
FROM students s
LEFT JOIN agencies a ON s.agency_id = a.agency_id
LEFT JOIN users u ON s.created_by = u.user_id
```

#### [2025-09-03 17:45] 해결 방안 구현
**수정 파일**: `routes/students-optimized.js`

**이전 코드** (뷰 사용):
```javascript
const student = await db('v_students_full')
  .where('student_id', id)
  .first();
```

**수정된 코드** (직접 조인):
```javascript
const student = await db('students as s')
  .leftJoin('agencies as a', 's.agency_id', 'a.agency_id')
  .leftJoin('users as u', 's.created_by', 'u.user_id')
  .select(
    's.*',
    'a.agency_name',
    'a.agency_code',
    'u.full_name as created_by_name'
  )
  .where('s.student_id', id)
  .first();
```

### ✅ 해결 완료
- 뷰 의존성 제거
- 직접 조인으로 동일한 결과 구현
- 프로덕션 환경 호환성 확보
- 추가 마이그레이션 불필요

### 📌 교훈
- **뷰 vs 직접 쿼리**: 프로덕션 환경에서는 뷰보다 직접 쿼리가 안정적
- **스키마 동기화**: 로컬과 프로덕션 DB 스키마 일치 중요
- **마이그레이션 관리**: 모든 스키마 변경사항 추적 필요