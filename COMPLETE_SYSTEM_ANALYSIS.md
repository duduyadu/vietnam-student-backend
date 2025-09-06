# 🔍 베트남 유학생 관리 시스템 - 완전 분석

## 1. 프로젝트 개요

### 목적
베트남 유학생의 학업, 상담, 행정 정보를 체계적으로 관리하는 웹 플랫폼

### 핵심 기능
- 사용자 인증 (admin/teacher/branch 역할)
- 학생 정보 CRUD
- 상담 기록 관리
- PDF 보고서 생성
- 엑셀 업로드/다운로드

## 2. 기술 스택

### Frontend
- **Framework**: React
- **배포**: Netlify (https://vietnam-management.netlify.app)
- **상태관리**: Context API (AuthContext)
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **배포**: Railway (https://vietnam-student-backend-production.up.railway.app)
- **인증**: JWT (jsonwebtoken)
- **암호화**: bcrypt
- **ORM**: Knex.js

### Database
- **서비스**: Supabase
- **DB**: PostgreSQL 17.4
- **프로젝트 ID**: zowugqovtbukjstgblwk
- **연결 방식**: Pooler (aws-1-ap-northeast-2.pooler.supabase.com)

## 3. 현재 문제점 분석

### 🔴 핵심 문제: "Tenant or user not found"

#### 에러 발생 위치
1. `routes/auth.js` - 로그인 시도 시
2. `middleware/auth.js` - API 호출 시 토큰 검증

#### 에러 원인
```
error: Tenant or user not found
    at Parser.parseErrorMessage (/app/node_modules/pg-protocol/dist/parser.js:285:98)
```

이는 PostgreSQL 드라이버 레벨에서 발생하는 에러로, **데이터베이스 연결 자체의 문제**입니다.

### 🟡 환경별 차이

#### 로컬 환경 (정상 작동)
```javascript
// .env
DB_HOST=aws-1-ap-northeast-2.pooler.supabase.com
DB_USER=postgres.zowugqovtbukjstgblwk
DB_PASSWORD=duyang3927duyang
USE_POOLER=undefined
```

#### Railway 환경 (에러 발생)
```javascript
// Railway 환경변수
DB_HOST=aws-1-ap-northeast-2.pooler.supabase.com
DB_USER=postgres.zowugqovtbukjstgblwk
DB_PASSWORD=duyang3927duyang
USE_POOLER=true
```

### 🔍 진짜 문제는 무엇인가?

1. **Supabase 멀티테넌시**: "Tenant or user not found"는 Supabase가 멀티테넌트 시스템에서 테넌트를 식별하지 못할 때 발생

2. **Pooler 연결 문제**: Railway의 `USE_POOLER=true` 설정이 연결 방식을 변경

3. **권한 문제**: `information_schema` 접근 시도가 트리거가 되어 전체 세션이 무효화

## 4. 근본 해결책

### Option 1: Direct Connection (Pooler 우회)
```javascript
// config/database.js 수정
const directConfig = {
  client: 'pg',
  connection: {
    host: 'db.zowugqovtbukjstgblwk.supabase.co', // Pooler 대신 직접 연결
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'duyang3927duyang',
    ssl: { rejectUnauthorized: false }
  }
};
```

### Option 2: Service Role Key 사용
```javascript
// Supabase service_role key로 연결 (RLS 우회)
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://zowugqovtbukjstgblwk.supabase.co',
  'SERVICE_ROLE_KEY' // anon key 대신 service role key
);
```

### Option 3: Connection String 사용
```javascript
// Railway에서 DATABASE_URL 사용
const config = {
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgresql://postgres:duyang3927duyang@db.zowugqovtbukjstgblwk.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
};
```

## 5. 즉시 시도해볼 수 있는 해결책

### Step 1: Railway 환경변수 수정
```
DATABASE_URL=postgresql://postgres:duyang3927duyang@db.zowugqovtbukjstgblwk.supabase.co:5432/postgres?sslmode=require
USE_POOLER=false
```

### Step 2: config/database.js 단순화
```javascript
const knex = require('knex');
require('dotenv').config();

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = db;
```

## 6. 외주 준비 문서

### 프로젝트 현황
- **완성도**: 80% (로컬에서는 100% 작동)
- **문제**: Railway 배포 환경에서 DB 연결 이슈
- **소요 시간**: 숙련자 기준 2-3일

### 필요한 작업
1. **DB 연결 문제 해결** (1일)
   - Supabase Pooler 연결 안정화
   - 또는 직접 연결로 전환

2. **인증 시스템 정리** (1일)
   - JWT 토큰 검증 로직 개선
   - 미들웨어 에러 처리

3. **테스트 및 최적화** (1일)
   - 모든 API 엔드포인트 테스트
   - 프로덕션 환경 안정화

### 외주 비용 예상
- **주니어 개발자**: 50-70만원
- **시니어 개발자**: 100-150만원
- **전문 업체**: 200-300만원

### 제공해야 할 자료
1. GitHub 저장소 접근 권한
2. Supabase 프로젝트 정보
3. Railway 계정 또는 환경변수
4. 현재까지의 문제 히스토리 (PROJECT_HISTORY.md)
5. API 명세서

## 7. 추천 사항

### 즉시 해결 방안
1. **Supabase 직접 연결 사용** (Pooler 우회)
2. **로컬 PostgreSQL로 전환** (가장 안정적)
3. **Heroku PostgreSQL 사용** (무료 티어 있음)

### 장기적 해결 방안
1. **Docker 컨테이너화**
2. **AWS RDS 사용**
3. **전문가 컨설팅**

## 8. 결론

현재 문제는 **Supabase의 Pooler 연결과 Railway 환경의 호환성 문제**입니다.
하드코딩 없이 해결하려면:

1. **즉시**: DATABASE_URL을 직접 연결로 변경
2. **중기**: 로컬 DB 또는 다른 호스팅 서비스 사용
3. **장기**: 전문가 도움 받기

이 문제는 코드 문제가 아니라 **인프라 설정 문제**입니다.