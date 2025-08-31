const knex = require('knex');
require('dotenv').config();

// Supabase PostgreSQL 설정 - Railway 환경변수 사용
const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL || {
    host: 'db.zowugqovtbukjstgblwk.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'duyang3927!',  // 비밀번호에 ! 추가
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
});

// Test database connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Supabase PostgreSQL 연결 성공!');
    console.log('⚡ 예상 성능 향상: 10-20배');
  })
  .catch((err) => {
    console.error('❌ Supabase 연결 실패:', err.message);
    console.log('Supabase 키와 URL을 확인해주세요.');
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