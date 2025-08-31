# 권한 시스템 개요

## 3단계 권한 구조

### 1. 관리자 (admin)
- **모든 기능 접근 가능**
- 사용자 계정 생성/수정/삭제 권한
- 모든 학생 정보 조회 및 수정
- 시스템 전체 관리

### 2. 교사 (teacher)  
- **소속 유학원 학생만 관리**
- 자신이 등록한 학생 정보만 조회/수정
- 다른 유학원 학생 접근 불가
- agency_name 필드로 소속 구분

### 3. 한국 지점 (korean_branch)
- **모든 학생 정보 조회 가능**
- 상담 기록 추가/수정 가능
- 학생 정보 수정 권한 제한적
- branch_name 필드로 지점 구분

## 권한 확인 미들웨어

### verifyToken
- JWT 토큰 검증
- 사용자 활성 상태 확인
- req.user에 사용자 정보 저장

### checkRole  
- 역할 기반 접근 제어
- 라우트별 허용 역할 검증
- 예: checkRole('admin') - 관리자만 접근

### checkOwnership
- 데이터 소유권 확인
- 교사는 자신의 학생만 접근
- 관리자는 모든 데이터 접근

## 사용자 생성 API (/api/users/create)

### 관리자만 사용 가능
- checkRole('admin') 미들웨어로 보호
- 교사/브런치 계정 생성 가능

### 필수 입력 필드
- username: 로그인 아이디
- password: 비밀번호 (최소 6자)
- full_name: 사용자 이름
- role: 역할 (admin/teacher/korean_branch)
- agency_name: 교사 역할 시 필수
- branch_name: 브런치 역할 시 필수

### 사용 예시
```javascript
// 교사 계정 생성
POST /api/users/create
{
  "username": "teacher1",
  "password": "password123",
  "full_name": "김선생",
  "role": "teacher",
  "agency_name": "서울유학원"
}

// 브런치 계정 생성  
POST /api/users/create
{
  "username": "branch1",
  "password": "password123", 
  "full_name": "부산지점",
  "role": "korean_branch",
  "branch_name": "부산지점"
}
```

## 현재 구현 상태

✅ JWT 기반 인증 시스템
✅ 3단계 역할 구분 (admin/teacher/korean_branch)
✅ 역할별 접근 제어 미들웨어
✅ 관리자의 사용자 생성 API
✅ 교사의 소속 학생만 접근 제한
✅ username 기반 로그인 시스템

## 테스트 필요 항목

1. 관리자 로그인 후 교사/브런치 계정 생성
2. 교사 로그인 후 학생 정보 접근 권한 확인
3. 브런치 로그인 후 조회/상담 기록 권한 확인
4. 권한 없는 접근 시 403 에러 확인