# Railway 환경변수 체크리스트

## 필수 환경변수

### 1. 데이터베이스 연결
- `DATABASE_URL` - Supabase 연결 문자열
  ```
  postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
  ```

### 2. JWT 설정
- `JWT_SECRET` - JWT 토큰 서명용 비밀키 (예: 랜덤 문자열)
- `JWT_EXPIRE` - 토큰 만료 시간 (예: 7d)

### 3. 서버 설정  
- `PORT` - Railway가 자동으로 설정 (건드리지 말 것)
- `NODE_ENV` - production

## Railway에서 환경변수 설정 방법:

1. Railway 대시보드 → 프로젝트 선택
2. Variables 탭 클릭
3. Add Variable 버튼으로 추가:

```
DATABASE_URL = postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
JWT_SECRET = your-secret-key-here-make-it-long-and-random
JWT_EXPIRE = 7d
NODE_ENV = production
```

## Supabase 연결 문자열 찾기:

1. Supabase 대시보드 → Settings
2. Database 섹션
3. Connection string → URI 복사
4. `[YOUR-PASSWORD]` 부분을 실제 비밀번호로 교체

## 테스트 방법:

1. Railway 로그에서 "Server is running" 확인
2. https://vietnam-student-backend-production.up.railway.app/health 접속
3. 정상 응답 확인