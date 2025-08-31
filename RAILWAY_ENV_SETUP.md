# Railway 환경변수 설정 가이드

## ⚠️ 중요: DATABASE_URL 제거 또는 수정

### 방법 1: DATABASE_URL 완전 제거 (권장)
Railway Variables에서 DATABASE_URL을 **삭제**하세요.
- 코드가 자동으로 올바른 Supabase DB에 연결됩니다.

### 방법 2: DATABASE_URL 올바르게 설정
```
DATABASE_URL=postgresql://postgres:duyang3927!@db.zowugqovtbukjstgblwk.supabase.co:5432/postgres?schema=public
```

## 필수 환경변수
```
JWT_SECRET=sk_w8n3r4t5y6u7i8o9p0qawsedrftgyhujikolpzxcvbnm123456789abcdef
JWT_EXPIRE=7d
NODE_ENV=production
```

## ⚠️ 주의사항
- PORT는 Railway가 자동 설정하므로 건드리지 마세요
- DATABASE_URL이 있다면 반드시 올바른 Supabase URL인지 확인

## 확인 방법
Railway Logs에서 다음을 확인:
1. "📌 Connecting to: db.zowugqovtbukjstgblwk.supabase.co" 
2. "✅ Database 연결 성공!"
3. "📊 Username column exists: YES"