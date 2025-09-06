// 🧠 ULTRATHINK: Admin 사용자 확인 및 진단
const db = require('./config/database');
const bcrypt = require('bcrypt');

async function checkAdminUser() {
  console.log('='.repeat(60));
  console.log('🔍 ADMIN USER CHECK');
  console.log('='.repeat(60));
  
  try {
    // 1. users 테이블 구조 확인
    console.log('\n📊 Users table structure:');
    const columns = await db.raw(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // 2. admin 사용자 확인
    console.log('\n👤 Looking for admin user:');
    const adminUser = await db('users')
      .where('username', 'admin')
      .first();
    
    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log(`  - user_id: ${adminUser.user_id}`);
      console.log(`  - username: ${adminUser.username}`);
      console.log(`  - email: ${adminUser.email}`);
      console.log(`  - role: ${adminUser.role}`);
      console.log(`  - password_hash exists: ${!!adminUser.password_hash}`);
      
      // 3. 비밀번호 검증 테스트
      if (adminUser.password_hash) {
        const testPassword = 'admin123';
        const isValid = await bcrypt.compare(testPassword, adminUser.password_hash);
        console.log(`\n🔐 Password test (admin123): ${isValid ? '✅ VALID' : '❌ INVALID'}`);
        
        if (!isValid) {
          console.log('\n⚠️ Password needs to be reset to admin123');
        }
      }
    } else {
      console.log('❌ Admin user NOT found');
      console.log('\n📝 Need to create admin user');
    }
    
    // 4. 모든 사용자 목록
    console.log('\n👥 All users:');
    const allUsers = await db('users')
      .select('user_id', 'username', 'role', 'email')
      .orderBy('user_id');
    
    if (allUsers.length === 0) {
      console.log('  ❌ No users found in database');
    } else {
      allUsers.forEach(user => {
        console.log(`  - ID: ${user.user_id}, Username: ${user.username}, Role: ${user.role}, Email: ${user.email}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('Tenant or user not found')) {
      console.log('\n🚨 DATABASE CONNECTION ERROR:');
      console.log('The error "Tenant or user not found" indicates a connection problem.');
      console.log('This might be due to:');
      console.log('  1. Wrong database credentials');
      console.log('  2. Wrong Supabase project');
      console.log('  3. Network/firewall issues');
    }
  } finally {
    await db.destroy();
  }
}

// 즉시 실행
checkAdminUser();