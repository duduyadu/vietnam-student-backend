// 🧠 ULTRATHINK: Railway DB 진단 라우트
const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/db-check', async (req, res) => {
  try {
    console.log('🔍 DB Check Endpoint Called');
    
    const results = {};
    
    // 1. 환경 변수
    results.environment = {
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
      NODE_ENV: process.env.NODE_ENV,
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      USE_POOLER: process.env.USE_POOLER
    };
    
    // 2. DB 정보
    const dbInfo = await db.raw('SELECT current_database() as db, current_user as user');
    results.dbInfo = dbInfo.rows[0];
    
    // 3. 학생 수
    const count = await db('students').count('* as total');
    results.totalStudents = count[0].total;
    
    // 4. 모든 학생 ID
    const students = await db('students')
      .select('student_id', 'student_code')
      .orderBy('student_id', 'asc');
    results.students = students;
    
    // 5. 컬럼 확인
    const columns = await db.raw(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'students' 
      AND column_name LIKE 'name%'
      ORDER BY column_name
    `);
    results.nameColumns = columns.rows.map(r => r.column_name);
    
    // 6. 필드명 테스트
    try {
      await db.raw('SELECT name_ko FROM students LIMIT 1');
      results.hasNameKo = true;
    } catch (e) {
      results.hasNameKo = false;
    }
    
    try {
      await db.raw('SELECT name_korean FROM students LIMIT 1');
      results.hasNameKorean = true;
    } catch (e) {
      results.hasNameKorean = false;
    }
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });
    
  } catch (error) {
    console.error('❌ DB Check Error:', error);
    res.status(500).json({
      error: error.message,
      code: error.code
    });
  }
});

module.exports = router;