const db = require('./config/database');

async function fixSchemaIssues() {
  console.log('🧠 ULTRATHINK: 데이터베이스 스키마 문제 해결');
  console.log('='.repeat(70));
  
  try {
    // 1. agencies 테이블 컬럼 확인
    console.log('\n📊 1. agencies 테이블 컬럼 분석:');
    const agenciesColumns = await db.raw(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'agencies' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('현재 컬럼:');
    const agencyColumnNames = agenciesColumns.rows.map(col => col.column_name);
    agenciesColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // created_by 컬럼 존재 확인
    const hasCreatedBy = agencyColumnNames.includes('created_by');
    console.log(`\n✅ created_by 컬럼 존재: ${hasCreatedBy ? 'YES' : 'NO'}`);
    
    // 2. consultations 테이블 컬럼 확인
    console.log('\n📊 2. consultations 테이블 컬럼 분석:');
    const consultationsColumns = await db.raw(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'consultations'
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('현재 컬럼:');
    const consultColumnNames = consultationsColumns.rows.map(col => col.column_name);
    consultationsColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // teacher_id 컬럼 존재 확인
    const hasTeacherId = consultColumnNames.includes('teacher_id');
    console.log(`\n✅ teacher_id 컬럼 존재: ${hasTeacherId ? 'YES' : 'NO'}`);
    
    // 3. 누락된 컬럼 추가
    console.log('\n🔧 3. 누락된 컬럼 추가:');
    
    if (!hasCreatedBy) {
      console.log('\n📌 agencies 테이블에 created_by 컬럼 추가 중...');
      try {
        await db.raw(`
          ALTER TABLE agencies 
          ADD COLUMN IF NOT EXISTS created_by INTEGER 
          REFERENCES users(user_id) ON DELETE SET NULL
        `);
        console.log('✅ created_by 컬럼 추가 완료!');
      } catch (err) {
        console.error('❌ created_by 추가 실패:', err.message);
      }
    }
    
    if (!hasTeacherId) {
      console.log('\n📌 consultations 테이블에 teacher_id 컬럼 추가 중...');
      try {
        await db.raw(`
          ALTER TABLE consultations 
          ADD COLUMN IF NOT EXISTS teacher_id INTEGER 
          REFERENCES users(user_id) ON DELETE SET NULL
        `);
        console.log('✅ teacher_id 컬럼 추가 완료!');
      } catch (err) {
        console.error('❌ teacher_id 추가 실패:', err.message);
      }
    }
    
    // 4. 변경사항 검증
    console.log('\n🔍 4. 변경사항 검증:');
    
    // agencies 재확인
    const agenciesCheck = await db.raw(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'agencies' 
      AND column_name = 'created_by'
      AND table_schema = 'public'
    `);
    
    if (agenciesCheck.rows.length > 0) {
      console.log('✅ agencies.created_by 컬럼 확인됨');
    } else {
      console.log('❌ agencies.created_by 컬럼 여전히 없음');
    }
    
    // consultations 재확인
    const consultCheck = await db.raw(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'consultations' 
      AND column_name = 'teacher_id'
      AND table_schema = 'public'
    `);
    
    if (consultCheck.rows.length > 0) {
      console.log('✅ consultations.teacher_id 컬럼 확인됨');
    } else {
      console.log('❌ consultations.teacher_id 컬럼 여전히 없음');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ 스키마 수정 작업 완료!');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    console.error('상세 오류:', error);
  } finally {
    await db.destroy();
  }
}

// 실행
fixSchemaIssues();