const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// 성능 모니터를 선택적으로 로드
let performanceMonitor;
try {
  performanceMonitor = require('./utils/performance');
} catch (error) {
  console.warn('⚠️ Performance monitor not available');
  // 더미 성능 모니터 생성
  performanceMonitor = {
    measureResponseTime: () => (req, res, next) => next(),
    generateReport: () => ({})
  };
}

const app = express();
const PORT = process.env.PORT || 5001;

// CORS 설정 - Netlify와 로컬 개발 환경 모두 지원
const corsOptions = {
  origin: function (origin, callback) {
    // 환경변수에서 허용된 도메인 가져오기
    const envOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
    
    const allowedOrigins = [
      'https://vetnam-student.netlify.app',
      'https://vietnam-student.netlify.app',
      'https://vetnam-management.netlify.app',
      'https://vietnam-management.netlify.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      ...envOrigins
    ];
    
    // 개발 모드에서는 모든 origin 허용
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // origin이 없는 경우 (예: Postman, 서버 간 통신) 허용
    if (!origin) {
      return callback(null, true);
    }
    
    // Netlify의 preview 도메인도 허용
    if (origin.includes('netlify.app') || origin.includes('.netlify.app') || allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      // 에러를 던지는 대신 false를 반환하여 더 친숙한 CORS 에러 메시지가 나오도록 함
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Disposition', 'Content-Length'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204 // 일부 legacy 브라우저를 위해
};

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Morgan 로깅 - 모든 요청 로깅
app.use(morgan('dev'));

// 성능 모니터링 미들웨어
app.use(performanceMonitor.measureResponseTime());

// 추가 디버깅용 로그
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl} - Body:`, req.body);
  next();
});

// OPTIONS preflight 요청 처리
app.options('*', cors(corsOptions));

// Routes
const authRoutes = require('./routes/auth');
const studentsRoutes = require('./routes/students-optimized'); // Using optimized version with ID generation
const consultationsRoutes = require('./routes/consultations'); // Temporarily using regular version
const menuRoutes = require('./routes/menu');
const usersRoutes = require('./routes/users');
const filesRoutes = require('./routes/files');
const excelRoutes = require('./routes/excel');
const agenciesRoutes = require('./routes/agencies-optimized'); // Using optimized version with agency codes
const reportsRoutes = require('./routes/reports');
const topikRoutes = require('./routes/topik-mock'); // TOPIK 모의고사 관리
const pdfReportsRoutes = require('./routes/pdf-reports'); // PDF 보고서 생성
const pdfReportsV2Routes = require('./routes/pdf-reports-v2'); // PDF 보고서 V2 (새로운 4페이지 구조)
const studentEvaluationRoutes = require('./routes/student-evaluation'); // 학생 평가 데이터 관리
const dashboardRoutes = require('./routes/dashboard'); // 대시보드 통계 API
const teacherEvaluationsRoutes = require('./routes/teacher-evaluations'); // 선생님별 평가 시스템
const learningMetricsRoutes = require('./routes/learningMetrics'); // 학습 메트릭스 관리
const specialActivitiesRoutes = require('./routes/specialActivities'); // 특별활동 관리
const characterEvaluationsRoutes = require('./routes/characterEvaluations'); // 생활 및 인성평가 관리
const studentImageUploadRoutes = require('./routes/student-image-upload'); // 학생 사진 업로드
// const testDbRoutes = require('./routes/test-db'); // 🧠 ULTRATHINK: DB 테스트 엔드포인트 (임시 비활성화)

console.log('📚 Loading all routes...');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/students', studentImageUploadRoutes); // 이미지 업로드 라우트 추가
app.use('/api/consultations', consultationsRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/agencies', agenciesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/topik', topikRoutes); // TOPIK API 엔드포인트
app.use('/api/pdf-reports', pdfReportsRoutes); // PDF 보고서 API
app.use('/api/pdf-reports', pdfReportsV2Routes); // PDF 보고서 V2 API (새로운 구조)
app.use('/api/topik-scores', require('./routes/topik-scores-upload')); // TOPIK 점수 일괄 업로드
app.use('/api/auto-record', require('./routes/auto-record')); // 생활기록부 자동 생성
app.use('/api/student-evaluation', studentEvaluationRoutes); // 학생 평가 데이터 API
app.use('/api/dashboard', dashboardRoutes); // 대시보드 통계 API
app.use('/api/batch-reports', require('./routes/batch-reports')); // 일괄 보고서 생성 API
app.use('/api/teacher-evaluations', teacherEvaluationsRoutes); // 선생님별 평가 API
app.use('/api/learning-metrics', learningMetricsRoutes); // 학습 메트릭스 API
app.use('/api/special-activities', specialActivitiesRoutes); // 특별활동 API
app.use('/api/character-evaluations', characterEvaluationsRoutes); // 생활 및 인성평가 API
// app.use('/api', testDbRoutes); // 🧠 ULTRATHINK: DB 테스트 엔드포인트 (임시 비활성화)

console.log('✅ All routes registered successfully');

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Vietnam Student Management System API',
    timestamp: new Date().toISOString()
  });
});

// 성능 리포트 엔드포인트 (개발용)
app.get('/api/performance', (req, res) => {
  res.json({
    success: true,
    metrics: performanceMonitor.generateReport()
  });
});

// Debug route to list all registered routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const path = middleware.regexp.source.replace(/\\/g, '').replace(/\^/, '').replace(/\$.*/, '').replace(/\(\?\:/, '');
          routes.push({
            path: path + handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ routes });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error caught in middleware:', err.message);
  console.error('Stack:', err.stack);
  
  // CORS 에러 특별 처리
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: {
        message: 'CORS policy error',
        message_ko: 'CORS 정책 오류입니다',
        message_vi: 'Lỗi chính sách CORS',
        origin: req.headers.origin,
        details: err.message
      }
    });
  }
  
  // 일반적인 에러 처리
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      message_ko: '서버 오류가 발생했습니다',
      message_vi: 'Lỗi máy chủ',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.originalUrl} not found`);
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// 서버 시작 및 에러 처리
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 CORS: Configured for Netlify and local development`);
  console.log(`📄 PDF Service: Using Puppeteer with bundled Chromium`);
  
  // CORS 디버깅 정보
  if (process.env.ALLOWED_ORIGINS) {
    console.log(`✅ Additional allowed origins: ${process.env.ALLOWED_ORIGINS}`);
  }
  
  // 🧠 ULTRATHINK: DB 진단 실행 (배포 후 삭제 예정)
  setTimeout(() => {
    require('./test-railway-db');
  }, 5000);
});

// 프로세스 에러 처리
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // 애플리케이션을 종료하지 않고 계속 실행
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // 심각한 에러인 경우에만 종료
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📛 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('🛑 HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;