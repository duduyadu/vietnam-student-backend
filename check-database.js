const db = require('./config/database');

async function checkDatabase() {
  console.log('🔍 데이터베이스 테이블 확인 중...\n');
  
  const requiredTables = [
    'users',
    'students',
    'agencies',
    'consultations',
    'consultation_types',
    'menu_items',
    'menu_translations',
    'audit_logs'
  ];
  
  try {
    // 현재 존재하는 테이블 조회
    const result = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    const existingTables = result.rows.map(row => row.table_name);
    
    console.log('✅ 존재하는 테이블:');
    existingTables.forEach(table => {
      console.log(`   - ${table}`);
    });
    
    console.log('\n❌ 생성이 필요한 테이블:');
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length === 0) {
      console.log('   모든 필수 테이블이 존재합니다!');
    } else {
      missingTables.forEach(table => {
        console.log(`   - ${table}`);
      });
      
      console.log('\n💡 해결 방법:');
      console.log('   1. npm run migrate 명령을 실행하세요');
      console.log('   2. 또는 개별 테이블 생성:');
      
      if (missingTables.includes('agencies')) {
        console.log('\n   📌 agencies 테이블 생성 SQL:');
        console.log(`
CREATE TABLE IF NOT EXISTS agencies (
  agency_id SERIAL PRIMARY KEY,
  agency_name VARCHAR(100) NOT NULL,
  agency_code VARCHAR(20) UNIQUE NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(user_id)
);`);
      }
      
      if (missingTables.includes('consultation_types')) {
        console.log('\n   📌 consultation_types 테이블 생성 SQL:');
        console.log(`
CREATE TABLE IF NOT EXISTS consultation_types (
  type_id SERIAL PRIMARY KEY,
  type_code VARCHAR(20) UNIQUE NOT NULL,
  type_name VARCHAR(100) NOT NULL,
  type_name_ko VARCHAR(100),
  type_name_vi VARCHAR(100),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
      }
    }
    
    // users 테이블의 컬럼 확인
    if (existingTables.includes('users')) {
      console.log('\n📊 users 테이블 컬럼 확인:');
      const columns = await db.raw(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      const requiredColumns = ['username', 'password_hash', 'full_name'];
      const existingColumns = columns.rows.map(col => col.column_name);
      
      requiredColumns.forEach(col => {
        if (existingColumns.includes(col)) {
          console.log(`   ✅ ${col} - 존재함`);
        } else {
          console.log(`   ❌ ${col} - 없음 (추가 필요)`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ 데이터베이스 확인 중 오류:', error.message);
  } finally {
    await db.destroy();
  }
}

checkDatabase();