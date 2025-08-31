const knex = require('knex');
require('dotenv').config();

// Supabase Pooler 연결 (더 안정적)
const db = knex({
  client: 'pg',
  connection: {
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',  // Pooler endpoint
    port: 6543,  // Pooler port
    database: 'postgres',
    user: 'postgres.zowugqovtbukjstgblwk',  // Full username for pooler
    password: 'duyang3927!',
    ssl: { rejectUnauthorized: false }
  },
  searchPath: ['public'],
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

console.log('📌 Connecting via Supabase Pooler...');

// Test connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Pooler connection successful!');
    return db.raw("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username'");
  })
  .then((result) => {
    console.log('📊 Username column exists:', result.rows.length > 0 ? 'YES' : 'NO');
  })
  .catch((err) => {
    console.error('❌ Pooler connection failed:', err.message);
  });

// PostgreSQL Client 가져오기 함수
const getClient = async () => {
  return {
    query: async (sql, params) => {
      try {
        const result = await db.raw(sql, params);
        return { rows: result.rows || result };
      } catch (error) {
        throw error;
      }
    },
    release: () => {}
  };
};

module.exports = db;
module.exports.getClient = getClient;