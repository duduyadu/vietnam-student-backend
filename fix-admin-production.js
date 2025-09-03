const bcrypt = require('bcrypt');
const db = require('./config/database');

// Railway 프로덕션 환경 설정
process.env.NODE_ENV = 'production';
process.env.USE_POOLER = 'true'; // Railway에서 안정적인 연결을 위해

async function fixAdminAccount() {
  console.log('🚀 Railway 프로덕션 환경 admin 계정 수정 시작...');
  console.log('='.repeat(60));
  
  try {
    // 1. 데이터베이스 연결 확인
    console.log('\n1️⃣ 데이터베이스 연결 확인...');
    await db.raw('SELECT 1');
    console.log('✅ 데이터베이스 연결 성공!');
    
    // 2. users 테이블 컬럼 확인
    console.log('\n2️⃣ users 테이블 컬럼 구조 확인...');
    const columns = await db.raw(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 users 테이블 컬럼 목록:');
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    // password 또는 password_hash 필드 확인
    const hasPassword = columns.rows.some(col => col.column_name === 'password');
    const hasPasswordHash = columns.rows.some(col => col.column_name === 'password_hash');
    const hasUsername = columns.rows.some(col => col.column_name === 'username');
    
    console.log(`\n📋 필드 존재 여부:`);
    console.log(`   - username: ${hasUsername ? '✅' : '❌'}`);
    console.log(`   - password: ${hasPassword ? '✅' : '❌'}`);
    console.log(`   - password_hash: ${hasPasswordHash ? '✅' : '❌'}`);
    
    // 3. username 컬럼이 없으면 추가
    if (!hasUsername) {
      console.log('\n3️⃣ username 컬럼 추가 중...');
      await db.raw(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE
      `);
      console.log('✅ username 컬럼 추가 완료!');
    }
    
    // 4. admin 계정 확인
    console.log('\n4️⃣ admin 계정 확인...');
    let adminUser;
    
    // username으로 먼저 찾기
    if (hasUsername) {
      adminUser = await db('users')
        .where('username', 'admin')
        .first();
    }
    
    // username으로 못 찾으면 email로 찾기
    if (!adminUser) {
      adminUser = await db('users')
        .where('email', 'admin@system.com')
        .first();
    }
    
    // 5. admin123 비밀번호 해시 생성
    console.log('\n5️⃣ admin123 비밀번호 해시 생성...');
    const newPassword = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log('✅ 새 비밀번호 해시 생성 완료!');
    
    // 해시 검증
    const isValid = await bcrypt.compare('admin123', hashedPassword);
    console.log(`🔐 해시 검증: ${isValid ? '성공' : '실패'}`);
    
    if (adminUser) {
      // 6A. 기존 admin 계정 업데이트
      console.log('\n6️⃣ 기존 admin 계정 업데이트 중...');
      
      const updateData = {
        username: 'admin',
        is_active: true,
        updated_at: new Date()
      };
      
      // password_hash와 password 둘 다 업데이트
      if (hasPasswordHash) {
        updateData.password_hash = hashedPassword;
      }
      if (hasPassword) {
        updateData.password = hashedPassword;
      }
      
      const idField = adminUser.user_id ? 'user_id' : 'id';
      await db('users')
        .where(idField, adminUser[idField])
        .update(updateData);
        
      console.log('✅ admin 계정 업데이트 완료!');
      
    } else {
      // 6B. 새 admin 계정 생성
      console.log('\n6️⃣ 새 admin 계정 생성 중...');
      
      const insertData = {
        username: 'admin',
        email: 'admin@system.com',
        full_name: 'System Administrator',
        role: 'admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // 적절한 비밀번호 필드 사용
      if (hasPasswordHash) {
        insertData.password_hash = hashedPassword;
      } else if (hasPassword) {
        insertData.password = hashedPassword;
      }
      
      await db('users').insert(insertData);
      console.log('✅ admin 계정 생성 완료!');
    }
    
    // 7. 최종 확인
    console.log('\n7️⃣ 최종 확인...');
    const finalCheck = await db('users')
      .where('username', 'admin')
      .first();
      
    if (finalCheck) {
      console.log('✅ admin 계정 확인 완료!');
      console.log(`   - Username: ${finalCheck.username}`);
      console.log(`   - Email: ${finalCheck.email}`);
      console.log(`   - Role: ${finalCheck.role}`);
      console.log(`   - Active: ${finalCheck.is_active}`);
      
      // 비밀번호 필드 확인
      const passwordField = finalCheck.password_hash || finalCheck.password;
      if (passwordField) {
        const testLogin = await bcrypt.compare('admin123', passwordField);
        console.log(`   - Password Test: ${testLogin ? '✅ admin123으로 로그인 가능' : '❌ 비밀번호 불일치'}`);
      }
    } else {
      console.log('❌ admin 계정을 찾을 수 없습니다!');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 작업 완료!');
    console.log('📌 로그인 정보:');
    console.log('   - URL: https://vietnam-student-backend-production.up.railway.app');
    console.log('   - Username: admin');
    console.log('   - Password: admin123');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    console.error('상세 오류:', error);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

// 스크립트 실행
fixAdminAccount();