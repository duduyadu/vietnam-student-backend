// 이 파일로 연결 테스트
const { Client } = require('pg');

// Supabase에서 복사한 연결 정보로 교체
const client = new Client({
  host: 'aws-1-ap-northeast-2.pooler.supabase.com',  // aws-1로 변경!
  port: 6543,  // Pooler 포트
  database: 'postgres',
  user: 'postgres.zowugqovtbukjstgblwk',  // Pooler 사용자명
  password: 'duyang3927duyang',
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('🔄 Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT username FROM users WHERE username = $1', ['admin']);
    console.log('✅ Query result:', result.rows);
    
    await client.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();