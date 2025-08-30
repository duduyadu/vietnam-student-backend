@echo off
echo ========================================
echo 백엔드 Render 배포 스크립트
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Git 상태 확인...
git status
echo.

echo [2/4] 변경사항 추가...
git add .
echo.

echo [3/4] 커밋 생성...
git commit -m "Fix: Student creation 500 error - handle missing fields and improve error handling"
echo.

echo [4/4] GitHub에 Push (Render 자동 배포 시작)...
git push origin main
echo.

echo ========================================
echo ✅ 배포 완료!
echo ========================================
echo.
echo [다음 단계]
echo 1. Render 대시보드에서 배포 상태 확인
echo    https://dashboard.render.com
echo.
echo 2. 배포 완료 후 (약 2-3분) 테스트
echo    https://vetnam-management.netlify.app
echo.
echo 3. 학생 추가 기능 테스트
echo.
pause