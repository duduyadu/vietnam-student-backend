const db = require('./config/database');

async function checkAllTables() {
  console.log('🧠 ULTRATHINK: 데이터베이스 구조 전체 분석');
  console.log('='.repeat(70));
  
  try {
    // 1. 모든 테이블 목록 조회
    console.log('\n📋 1. 현재 존재하는 모든 테이블:');
    const tablesResult = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    existingTables.forEach(table => {
      console.log(`   ✅ ${table}`);
    });
    
    // 2. 필수 테이블 체크
    console.log('\n🎯 2. 필수 테이블 존재 여부:');
    const requiredTables = {
      'users': '사용자 관리',
      'students': '학생 정보',
      'agencies': '유학원 정보',
      'consultations': '상담 기록',
      'consultation_types': '상담 유형',
      'topik_exams': 'TOPIK 시험 정보',
      'audit_logs': '감사 로그'
    };
    
    const missingTables = [];
    for (const [table, description] of Object.entries(requiredTables)) {
      if (existingTables.includes(table)) {
        console.log(`   ✅ ${table} (${description})`);
      } else {
        console.log(`   ❌ ${table} (${description}) - 없음!`);
        missingTables.push(table);
      }
    }
    
    // 3. 각 테이블의 컬럼 구조 확인
    console.log('\n📊 3. 각 테이블의 컬럼 구조:');
    
    // 3-1. students 테이블
    if (existingTables.includes('students')) {
      console.log('\n   📚 students 테이블:');
      const studentColumns = await db.raw(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'students' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      console.log('   필드 목록:');
      studentColumns.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? '(선택)' : '(필수)';
        const defaultVal = col.column_default ? `[기본값: ${col.column_default}]` : '';
        console.log(`     - ${col.column_name}: ${col.data_type} ${nullable} ${defaultVal}`);
      });
      
      // Primary Key 확인
      const studentPK = await db.raw(`
        SELECT column_name
        FROM information_schema.key_column_usage
        WHERE table_name = 'students' 
        AND table_schema = 'public'
        AND constraint_name LIKE '%_pkey'
      `);
      if (studentPK.rows.length > 0) {
        console.log(`   🔑 Primary Key: ${studentPK.rows[0].column_name}`);
      }
    }
    
    // 3-2. agencies 테이블
    if (existingTables.includes('agencies')) {
      console.log('\n   🏢 agencies 테이블:');
      const agencyColumns = await db.raw(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'agencies' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      console.log('   필드 목록:');
      agencyColumns.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? '(선택)' : '(필수)';
        console.log(`     - ${col.column_name}: ${col.data_type} ${nullable}`);
      });
    }
    
    // 3-3. consultations 테이블
    if (existingTables.includes('consultations')) {
      console.log('\n   💬 consultations 테이블:');
      const consultColumns = await db.raw(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'consultations' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      console.log('   필드 목록:');
      consultColumns.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? '(선택)' : '(필수)';
        console.log(`     - ${col.column_name}: ${col.data_type} ${nullable}`);
      });
    }
    
    // 4. Foreign Key 관계 확인
    console.log('\n🔗 4. Foreign Key 관계:');
    const foreignKeys = await db.raw(`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name
    `);
    
    if (foreignKeys.rows.length > 0) {
      foreignKeys.rows.forEach(fk => {
        console.log(`   ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    } else {
      console.log('   Foreign Key 관계 없음 (또는 설정되지 않음)');
    }
    
    // 5. 진단 결과
    console.log('\n' + '='.repeat(70));
    console.log('🔍 진단 결과:');
    
    if (missingTables.length > 0) {
      console.log('\n❌ 문제 발견:');
      console.log(`   누락된 테이블: ${missingTables.join(', ')}`);
      console.log('\n💡 해결 방법:');
      console.log('   1. 테이블 생성 SQL 스크립트 실행 필요');
      console.log('   2. 또는 npm run migrate 실행');
    } else {
      console.log('✅ 모든 필수 테이블이 존재합니다.');
      console.log('\n다음 단계:');
      console.log('   1. 각 등록 API 엔드포인트 테스트');
      console.log('   2. 에러 메시지 분석');
    }
    
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
  } finally {
    await db.destroy();
  }
}

checkAllTables();