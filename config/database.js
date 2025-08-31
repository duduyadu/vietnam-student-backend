const knex = require('knex');
require('dotenv').config();

// 환경변수 기반 설정 (프로덕션 환경 우선)
const isProd = process.env.NODE_ENV === 'production';

// DATABASE_URL이 있으면 사용, 없으면 개별 환경변수 사용
let dbConfig;

if (process.env.DATABASE_URL) {
  // Railway/Heroku 등에서 제공하는 DATABASE_URL 사용
  console.log('🔍 Using DATABASE_URL from environment');
  
  // IPv6 문제 해결을 위한 URL 파싱 및 수정
  const dbUrl = process.env.DATABASE_URL;
  
  dbConfig = {
    client: 'pg',
    connection: {
      connectionString: dbUrl,
      ssl: isProd ? { rejectUnauthorized: false } : false
    },
    searchPath: ['public'],
    pool: {
      min: 2,
      max: 10
    }
  };
} else {
  // 개별 환경변수 사용 (로컬 개발 또는 환경변수 직접 설정)
  console.log('🔍 Using individual database environment variables');
  
  dbConfig = {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'db.zowugqovtbukjstgblwk.supabase.co',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_DATABASE || 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'duyang3927!',
      ssl: isProd ? { rejectUnauthorized: false } : false
    },
    searchPath: ['public'],
    pool: {
      min: 2,
      max: 10
    }
  };
}

// migrations와 seeds 설정 추가
dbConfig.migrations = {
  directory: './database/migrations',
  tableName: 'knex_migrations'
};

dbConfig.seeds = {
  directory: './database/seeds'
};

// 데이터베이스 연결 생성
const db = knex(dbConfig);

// 연결 정보 로깅 (비밀번호는 숨김)
const connectionInfo = dbConfig.connection.connectionString 
  ? 'Connection String Mode'
  : `${dbConfig.connection.host}:${dbConfig.connection.port}`;
console.log(`📌 Connecting to: ${connectionInfo}`);

// 연결 테스트 및 username 컬럼 확인
async function testConnection() {
  try {
    // 연결 테스트
    await db.raw('SELECT 1');
    console.log('✅ Database connection successful!');
    
    // username 컬럼 확인
    const result = await db.raw(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
      AND column_name = 'username'
    `);
    
    if (result.rows.length > 0) {
      console.log('📊 Username column exists: YES');
    } else {
      console.error('⚠️ WARNING: username column not found in users table!');
      
      // 자동으로 username 컬럼 추가 시도
      if (isProd) {
        try {
          await db.raw('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username VARCHAR(255)');
          console.log('✅ Username column added successfully');
        } catch (err) {
          console.error('Failed to add username column:', err.message);
        }
      }
    }
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    
    // IPv6 문제인 경우 안내
    if (err.message.includes('ENETUNREACH')) {
      console.error('💡 This looks like an IPv6 issue. Please check DATABASE_URL or use DB_HOST with IPv4 address.');
    }
  }
}

// 연결 테스트 실행
testConnection();

// PostgreSQL Client 가져오기 함수 (dashboard.js에서 사용)
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
    release: () => {
      // knex는 자동으로 connection pool을 관리
    }
  };
};

module.exports = db;
module.exports.getClient = getClient;