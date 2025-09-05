# 🎯 프론트엔드 개발자를 위한 ID 사용 가이드

## 🧠 ULTRATHINK: student_id vs student_code 완벽 이해

### 📌 핵심 개념
- **`student_id`**: 데이터베이스가 자동 생성하는 숫자 ID (예: 1, 2, 3, ...)
- **`student_code`**: 시스템이 생성하는 학생 고유 코드 (예: V2024-0001)

### ⚠️ 중요: 모든 API 호출에는 `student_id` 사용!

## 📊 학생 등록 후 처리 방법

### 1️⃣ 학생 등록 API 응답 구조 (수정됨)
```javascript
// POST /api/students 응답
{
  "success": true,
  "message": "학생이 등록되었습니다. 학생 코드: V2024-0001",
  "student_id": 12,  // ✅ 이것을 사용하세요!
  "student_code": "V2024-0001",  // 표시용
  "data": {
    "student_id": 12,  // ✅ 여기에도 있음
    "student_code": "V2024-0001",
    "name_korean": "김철수",
    // ... 기타 필드
  }
}
```

### 2️⃣ 올바른 사용 예시

#### ✅ 정확한 방법
```javascript
// 학생 등록 후
const response = await createStudent(studentData);
const studentId = response.student_id;  // 또는 response.data.student_id

// 상담 기록 추가
await createConsultation({
  student_id: studentId,  // ✅ 숫자 ID 사용
  consultation_type_id: 1,
  // ...
});

// PDF 생성
await generatePDF({
  student_id: studentId,  // ✅ 숫자 ID 사용
  template_id: 1
});
```

#### ❌ 잘못된 방법
```javascript
// 이렇게 하지 마세요!
const studentCode = response.student_code;
await generatePDF({
  student_id: studentCode,  // ❌ "V2024-0001" 같은 코드 사용 금지!
});
```

## 🔍 디버깅 팁

### 문제 증상
- "Student with ID 11 does not exist" 오류
- PDF 생성 실패
- 상담 기록 저장 실패

### 확인 방법
1. **브라우저 개발자 도구** > Network 탭
2. 학생 등록 API 응답 확인
3. `student_id` 필드가 숫자인지 확인
4. 이후 API 호출에서 같은 숫자 ID 사용하는지 확인

### 응급 처리
```javascript
// ID 타입 확인 및 변환
const ensureNumericId = (id) => {
  if (typeof id === 'string' && id.startsWith('V')) {
    console.error('❌ 학생 코드를 ID로 사용하고 있습니다!');
    return null;
  }
  return parseInt(id);
};
```

## 📝 체크리스트

- [ ] 학생 등록 후 `response.student_id` 저장
- [ ] 모든 API 호출에 숫자 `student_id` 사용
- [ ] `student_code`는 UI 표시용으로만 사용
- [ ] localStorage/sessionStorage에 저장 시 `student_id` 사용

## 🚨 주의사항

1. **신규 학생**: 등록 직후 받은 `student_id` 즉시 저장
2. **목록에서 선택**: 테이블/리스트의 `student_id` 필드 사용
3. **URL 파라미터**: `/students/:id`에서 `id`는 숫자 ID
4. **검색**: 검색은 `student_code`로, API 호출은 `student_id`로

## 💡 도움이 필요하면

1. **백엔드 로그 확인**: Railway 대시보드에서 에러 로그 확인
2. **SQL 디버깅**: `debug-student-creation.sql` 실행
3. **API 테스트**: Postman으로 직접 테스트

---
*작성일: 2025-09-05*
*작성자: ULTRATHINK System*