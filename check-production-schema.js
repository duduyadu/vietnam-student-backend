require('dotenv').config();
const knex = require('knex');

// 프로덕션 DB 설정 - Railway에서 실제 사용하는 값
const db = knex({
  client: 'postgresql',
  connection: {
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.zowugqovtbukjstgblwk',
    password: 'duyang3927duyang',
    ssl: { rejectUnauthorized: false }
  },
  debug: false
});

async function checkSchema() {
  console.log('🧠 ULTRATHINK: 프로덕션 DB 스키마 완전 분석');
  console.log('=' .repeat(70));

  try {
    // 1. students 테이블 컬럼 확인
    console.log('\n📊 1. students 테이블 컬럼 확인');
    console.log('-'.repeat(40));
    const studentColumns = await db.raw(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'students'
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('students 테이블 컬럼:');
    studentColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : ''}`);
    });

    // 2. report_templates 테이블 확인
    console.log('\n📊 2. report_templates 테이블 확인');
    console.log('-'.repeat(40));
    const reportTemplatesExists = await db.schema.hasTable('report_templates');
    if (reportTemplatesExists) {
      const reportColumns = await db.raw(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'report_templates'
        AND table_schema = 'public'
      `);
      console.log('report_templates 테이블 컬럼:');
      reportColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('❌ report_templates 테이블이 존재하지 않습니다!');
    }

    // 3. users 테이블 확인
    console.log('\n📊 3. users 테이블 확인');
    console.log('-'.repeat(40));
    const userColumns = await db.raw(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('users 테이블 컬럼:');
    userColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    // 4. 날짜 필드 타입 확인
    console.log('\n📊 4. 날짜 필드 타입 특별 확인');
    console.log('-'.repeat(40));
    const dateFields = await db.raw(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND column_name LIKE '%date%'
      OR column_name LIKE '%registration%'
      ORDER BY table_name, column_name
    `);
    
    console.log('날짜 관련 필드:');
    dateFields.rows.forEach(col => {
      console.log(`  - ${col.table_name}.${col.column_name}: ${col.data_type}`);
    });

    // 5. consultations 테이블 확인
    console.log('\n📊 5. consultations 테이블 확인');
    console.log('-'.repeat(40));
    const consultationColumns = await db.raw(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'consultations'
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('consultations 테이블 컬럼:');
    consultationColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

  } catch (error) {
    console.error('❌ 스키마 확인 실패:', error.message);
  } finally {
    await db.destroy();
  }
}

checkSchema();