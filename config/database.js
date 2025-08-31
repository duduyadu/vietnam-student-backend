const knex = require('knex');
require('dotenv').config();

// 디버깅: 현재 DATABASE_URL 확인
console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
if (process.env.DATABASE_URL) {
  console.log('🔍 DATABASE_URL contains:', process.env.DATABASE_URL.substring(0, 50) + '...');
}

// Supabase PostgreSQL 직접 연결 (DATABASE_URL 무시)
const dbConfig = {
  client: 'pg',
  connection: {
    host: 'db.zowugqovtbukjstgblwk.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'duyang3927!',
    ssl: { rejectUnauthorized: false }
  },
  searchPath: ['public'],  // public 스키마 명시적 지정
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: './database/migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './database/seeds'
  }
};

console.log('📌 Connecting to:', dbConfig.connection.host);

const db = knex(dbConfig);

// Test database connection and check username column
db.raw("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username'")
  .then((result) => {
    console.log('✅ Database 연결 성공!');
    console.log('📊 Username column exists:', result.rows.length > 0 ? 'YES' : 'NO');
    if (result.rows.length === 0) {
      console.error('⚠️ WARNING: username column not found in users table!');
    }
  })
  .catch((err) => {
    console.error('❌ Database 연결 실패:', err.message);
    console.log('Connection config:', dbConfig.connection.host);
  });

// PostgreSQL Client 가져오기 함수 (dashboard.js에서 사용)
const getClient = async () => {
  return {
    query: async (sql, params) => {
      try {
        // knex raw query를 사용하여 PostgreSQL 쿼리 실행
        const result = await db.raw(sql, params);
        return { rows: result.rows || result };
      } catch (error) {
        throw error;
      }
    },
    release: () => {
      // knex는 자동으로 connection pool을 관리하므로 별도 release 불필요
    }
  };
};

module.exports = db;
module.exports.getClient = getClient;