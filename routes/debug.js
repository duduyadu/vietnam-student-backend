// 🧠 ULTRATHINK: 디버그 엔드포인트 - Railway 환경 진단용
const router = require('express').Router();
const db = require('../config/database');

// 환경변수 확인 (민감정보 마스킹)
router.get('/env', async (req, res) => {
  try {
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
      DB_HOST: process.env.DB_HOST ? process.env.DB_HOST.substring(0, 10) + '...' : 'NOT SET',
      DB_USER: process.env.DB_USER ? process.env.DB_USER.substring(0, 10) + '...' : 'NOT SET',
      DB_NAME: process.env.DB_NAME,
      SUPABASE_URL: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 30) + '...' : 'NOT SET',
      PORT: process.env.PORT,
      USE_POOLER: process.env.USE_POOLER
    };
    
    res.json({
      success: true,
      environment: envInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DB 연결 상태 확인
router.get('/db', async (req, res) => {
  try {
    // DB 정보 확인
    const dbInfo = await db.raw(`
      SELECT 
        current_database() as database,
        current_user as user,
        current_setting('server_version') as version
    `);
    
    // Users 테이블 확인
    const userCount = await db('users').count('* as count');
    const adminExists = await db('users').where('username', 'admin').first();
    
    // Students 테이블 컬럼 확인
    const columns = await db.raw(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'students' 
      AND column_name LIKE 'name%'
      ORDER BY column_name
    `);
    
    res.json({
      success: true,
      database: {
        info: dbInfo.rows[0],
        users: {
          count: userCount[0].count,
          adminExists: !!adminExists,
          adminUsername: adminExists ? adminExists.username : null
        },
        studentColumns: columns.rows.map(r => r.column_name)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.detail || 'Database connection error',
      timestamp: new Date().toISOString()
    });
  }
});

// 전체 진단
router.get('/health', async (req, res) => {
  const health = {
    server: 'running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  };
  
  // DB 연결 테스트
  try {
    await db.raw('SELECT 1');
    health.database = 'connected';
  } catch (error) {
    health.database = 'disconnected';
    health.dbError = error.message;
  }
  
  res.json(health);
});

module.exports = router;