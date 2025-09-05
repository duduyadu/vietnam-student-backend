// 🧠 ULTRATHINK: Railway DB 연결 정보 확인
const db = require('./config/database');

async function checkRailwayDB() {
  console.log('='.repeat(60));
  console.log('🔍 RAILWAY DB CONNECTION CHECK');
  console.log('='.repeat(60));
  
  // 환경 변수 출력
  console.log('\n📋 Environment Variables:');
  console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_DATABASE:', process.env.DB_DATABASE);
  console.log('USE_POOLER:', process.env.USE_POOLER);
  
  try {
    // DB 정보 확인
    const dbInfo = await db.raw(`
      SELECT 
        current_database() as database,
        current_user as user,
        current_setting('server_version') as version
    `);
    console.log('\n✅ DB Info:', dbInfo.rows[0]);
    
    // 학생 수 확인
    const studentCount = await db('students').count('* as count');
    console.log('\n📊 Total Students:', studentCount[0].count);
    
    // 모든 학생 ID 확인
    const allStudents = await db('students')
      .select('student_id', 'student_code')
      .orderBy('student_id', 'asc');
    
    console.log('\n👥 All Student IDs:');
    allStudents.forEach(s => {
      console.log(`  - ID: ${s.student_id}, Code: ${s.student_code}`);
    });
    
    // 컬럼 확인
    const columns = await db.raw(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'students' 
      AND column_name LIKE 'name%'
      ORDER BY column_name
    `);
    
    console.log('\n📊 Name columns:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}`);
    });
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.destroy();
  }
}

// 즉시 실행
checkRailwayDB();