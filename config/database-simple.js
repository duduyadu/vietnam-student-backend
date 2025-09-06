// 🧠 ULTRATHINK: 가장 단순한 DB 연결 설정
const knex = require('knex');
require('dotenv').config();

console.log('🚀 Starting SIMPLE database configuration...');

// Railway에서 설정한 DATABASE_URL 우선 사용
const connectionString = process.env.DATABASE_URL || 
  'postgresql://postgres:duyang3927duyang@db.zowugqovtbukjstgblwk.supabase.co:5432/postgres';

console.log('📍 Using connection string (first 50 chars):', connectionString.substring(0, 50) + '...');

const db = knex({
  client: 'pg',
  connection: connectionString + '?sslmode=require',
  pool: {
    min: 2,
    max: 10
  }
});

// 연결 테스트
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connection successful!');
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = db;