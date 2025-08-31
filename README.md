# Vietnam Student Management System - Backend

베트남 유학생 관리 시스템의 백엔드 서버입니다.

## 기술 스택

- **Node.js** & **Express.js**: 서버 프레임워크
- **PostgreSQL** (Supabase): 데이터베이스
- **JWT**: 인증 시스템
- **Puppeteer**: PDF 생성
- **XLSX**: 엑셀 파일 처리

## 주요 기능

- **사용자 인증**: Username 기반 로그인 시스템
- **역할 기반 권한 관리**: Admin, Teacher, Korean Branch
- **학생 정보 관리**: CRUD 작업
- **PDF 생성**: 학생 생활기록부 생성
- **엑셀 처리**: 데이터 일괄 업로드/다운로드
- **다국어 지원**: 한국어/베트남어

## 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Database
DB_HOST=aws-1-ap-northeast-2.pooler.supabase.com
DB_PORT=6543
DB_DATABASE=postgres
DB_USER=postgres.zowugqovtbukjstgblwk
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Server
PORT=3001
NODE_ENV=production
```

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 데이터베이스 마이그레이션
npm run migrate

# 개발 서버 실행
npm run dev

# 프로덕션 서버 실행
npm start
```

## API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/refresh-token` - 토큰 갱신

### 사용자 관리
- `GET /api/users` - 사용자 목록 조회
- `POST /api/users` - 사용자 생성
- `PUT /api/users/:id` - 사용자 수정
- `DELETE /api/users/:id` - 사용자 삭제

### 학생 관리
- `GET /api/students` - 학생 목록 조회
- `POST /api/students` - 학생 생성
- `PUT /api/students/:id` - 학생 수정
- `DELETE /api/students/:id` - 학생 삭제

## 배포

Railway에 자동 배포되도록 설정되어 있습니다. `main` 브랜치에 푸시하면 자동으로 배포됩니다.