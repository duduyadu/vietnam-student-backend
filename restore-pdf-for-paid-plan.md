# Render 유료 플랜용 PDF 기능 복구 가이드

## Standard Plan ($25/월) 이상으로 업그레이드 후 실행할 작업:

### 1. package.json 수정
```json
// optionalDependencies를 dependencies로 다시 이동
"dependencies": {
  ...
  "puppeteer": "^24.16.2",  // 다시 추가
  ...
}
// optionalDependencies 섹션 삭제
```

### 2. pdfService.js 원래대로 복구
```javascript
// 파일 맨 위를 다시 이렇게 변경:
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class PDFService {
  constructor() {
    this.browser = null;
  }
  
  // checkAvailability() 메서드 삭제
  // loadPuppeteer() 메서드 삭제
```

### 3. Render Dashboard 환경 변수 설정
```
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=2048  # 2GB로 증가
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
```

### 4. Build Command 설정 (Settings 탭)
```
npm install
```

### 5. 재배포
- Manual Deploy > "Clear build cache & deploy" 클릭

## ✅ 복구 후 확인사항:
- "✅ Puppeteer is available for PDF generation" 로그 확인
- PDF 생성 기능 정상 작동
- 모든 보고서 다운로드 가능

## 💡 팁:
- Standard Plan이 가장 비용 효율적
- Pro Plan ($85/월)은 대규모 서비스용
- 월 단위로 변경 가능하니 필요에 따라 조정 가능