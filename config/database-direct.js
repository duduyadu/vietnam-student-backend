// 🧠 ULTRATHINK: Supabase 직접 연결 (Pooler 우회)
const knex = require('knex');
require('dotenv').config();

console.log('🚀 Starting DIRECT database configuration...');
console.log('📍 Environment:', process.env.NODE_ENV || 'development');

// Railway 환경인지 확인
const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production' || 
                  process.env.USE_POOLER === 'true';

// 직접 연결 설정 (Pooler 우회)
const directConnection = {
  host: 'db.zowugqovtbukjstgblwk.supabase.co', // 직접 연결
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.DB_PASSWORD || 'duyang3927duyang',
  ssl: { rejectUnauthorized: false }
};

// Pooler 연결 설정 (기존)
const poolerConnection = {
  host: process.env.DB_HOST || 'aws-1-ap-northeast-2.pooler.supabase.com',
  port: process.env.DB_PORT || 6543,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres.zowugqovtbukjstgblwk',
  password: process.env.DB_PASSWORD || 'duyang3927duyang',
  ssl: { rejectUnauthorized: false }
};

// DATABASE_URL이 있으면 우선 사용
if (process.env.DATABASE_URL) {
  console.log('✅ Using DATABASE_URL');
  const db = knex({
    client: 'pg',
    connection: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000
    }
  });
  
  module.exports = db;
} else {
  // Railway는 직접 연결, 로컬은 Pooler 사용
  const connection = isRailway ? directConnection : poolerConnection;
  
  console.log(`📊 Using ${isRailway ? 'DIRECT' : 'POOLER'} connection`);
  console.log(`📌 Connecting to: ${connection.host}:${connection.port}`);
  
  const db = knex({
    client: 'pg',
    connection,
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000
    }
  });
  
  // 연결 테스트
  db.raw('SELECT 1')
    .then(() => {
      console.log('✅ Database connection successful!');
    })
    .catch(err => {
      console.error('❌ Database connection failed:', err.message);
      
      // 실패 시 다른 연결 방식 시도
      if (isRailway) {
        console.log('🔄 Trying Pooler connection as fallback...');
        return knex({
          client: 'pg',
          connection: poolerConnection,
          ssl: { rejectUnauthorized: false }
        });
      }
    });
  
  module.exports = db;
}