# 🧠 ULTRATHINK: DB 스키마 불일치 완전 해결 가이드

## 🔴 문제 상황
- **로컬 개발**: `name_ko`, `name_vi` 컬럼 사용
- **프로덕션 (Supabase)**: `name_korean`, `name_vietnamese` 컬럼 사용
- **영향**: 70개 참조, 17개 파일

## ✅ 해결 방안: 코드를 DB에 맞추기

### 변경 필요 파일들
1. **helpers/studentHelper.js** ✅ (수정 완료)
2. **routes/students-optimized.js** (주요)
3. **routes/reports.js** (주요)
4. **routes/consultations.js** (주요)
5. 기타 14개 파일

### 변경 패턴
```javascript
// 이전 (잘못됨)
.select('name_ko', 'name_vi')
student.name_ko
student.name_vi

// 수정 (올바름)
.select('name_korean', 'name_vietnamese')
student.name_korean
student.name_vietnamese
```

## 🎯 일괄 변경 스크립트

### PowerShell 스크립트 (Windows)
```powershell
# backup 먼저 생성
Copy-Item -Path "routes" -Destination "routes_backup_$(Get-Date -Format 'yyyyMMdd')" -Recurse

# 일괄 변경
Get-ChildItem -Path routes -Filter *.js -Recurse | ForEach-Object {
    (Get-Content $_.FullName) `
        -replace '\bname_ko\b', 'name_korean' `
        -replace '\bname_vi\b', 'name_vietnamese' |
    Set-Content $_.FullName
}
```

### Bash 스크립트 (Linux/Mac)
```bash
# backup 먼저 생성
cp -r routes routes_backup_$(date +%Y%m%d)

# 일괄 변경
find routes -name "*.js" -type f -exec sed -i '' \
    -e 's/\bname_ko\b/name_korean/g' \
    -e 's/\bname_vi\b/name_vietnamese/g' {} \;
```

## ⚠️ 주의사항
1. **백업 필수**: 변경 전 반드시 백업
2. **테스트**: 로컬에서 먼저 테스트
3. **검증**: 변경 후 모든 API 엔드포인트 테스트

## 📝 영구적 해결책
1. **환경변수 사용**: DB별 컬럼명 설정
```javascript
const NAME_KO_FIELD = process.env.NAME_KO_FIELD || 'name_korean';
const NAME_VI_FIELD = process.env.NAME_VI_FIELD || 'name_vietnamese';
```

2. **필드 매핑 함수**:
```javascript
function mapStudentFields(student) {
  return {
    ...student,
    name_ko: student.name_korean || student.name_ko,
    name_vi: student.name_vietnamese || student.name_vi,
    // 프론트엔드 호환성 유지
    name: student.name_korean || student.name_ko || '-'
  };
}
```

## 🚀 실행 계획
1. ✅ helpers/studentHelper.js 수정 (완료)
2. ⬜ routes/students-optimized.js 수정
3. ⬜ routes/reports.js 수정
4. ⬜ routes/consultations.js 수정
5. ⬜ 나머지 파일 일괄 수정
6. ⬜ 테스트 및 검증
7. ⬜ 배포

## 📌 핵심 교훈
- **DB 스키마는 절대 진리**: 코드가 DB를 따라가야 함
- **환경별 차이 최소화**: 로컬과 프로덕션 DB 스키마 동일하게 유지
- **문서화**: 모든 필드명과 스키마 변경 문서화 필수