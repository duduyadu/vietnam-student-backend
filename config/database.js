const knex = require('knex');
require('dotenv').config();

// 환경변수 기반 설정 (프로덕션 환경 우선)
const isProd = process.env.NODE_ENV === 'production';

console.log('🚀 Starting database configuration...');
console.log('📍 Environment:', process.env.NODE_ENV);
console.log('📍 DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('📍 USE_POOLER:', process.env.USE_POOLER);
console.log('📍 DB_HOST:', process.env.DB_HOST);
console.log('📍 Timestamp:', new Date().toISOString());

// DATABASE_URL이 있으면 사용, 없으면 개별 환경변수 사용
let dbConfig;

// Production에서는 무조건 개별 파라미터 사용 (IPv6 완전 회피)
if (isProd) {
  console.log('🚀 PRODUCTION MODE - Forcing individual parameters to avoid IPv6');
  
  // Railway에서 IPv6 문제를 피하기 위해 Pooler 사용을 기본으로
  const usePooler = process.env.USE_POOLER !== 'false';  // 기본값 true
  
  let dbHost, dbPort, dbUser;
  
  if (usePooler) {
    // Pooler 연결 (IPv6 문제 없음)
    dbHost = process.env.DB_HOST || 'aws-0-ap-northeast-2.pooler.supabase.com';
    dbPort = process.env.DB_PORT || '6543';
    dbUser = process.env.DB_USER || 'postgres.zowugqovtbukjstgblwk';
    console.log('🔄 Using Pooler connection (IPv4 only)');
  } else {
    // 직접 연결 (환경변수로 제어 가능)
    dbHost = process.env.DB_HOST || 'db.zowugqovtbukjstgblwk.supabase.co';
    dbPort = process.env.DB_PORT || '5432';
    dbUser = process.env.DB_USER || 'postgres';
    console.log('📡 Using direct connection');
  }
  
  const dbPassword = process.env.DB_PASSWORD || 'duyang3927!';
  const dbDatabase = process.env.DB_DATABASE || 'postgres';
  
  console.log(`📊 Connecting to: ${dbHost}:${dbPort}`);
  console.log(`📊 Database: ${dbDatabase}, User: ${dbUser}`);
  console.log(`📊 Project: zowugqovtbukjstgblwk (Expected)`);
  
  // IPv6 문제를 완전히 피하기 위해 connectionString 사용 안 함
  dbConfig = {
    client: 'pg',
    connection: {
      host: dbHost,
      port: parseInt(dbPort),
      database: dbDatabase,
      user: dbUser,
      password: dbPassword,
      ssl: { rejectUnauthorized: false }
    },
    searchPath: ['public'],
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000
    }
  };
  
  console.log('✅ Database config created with individual parameters');
} else if (process.env.DATABASE_URL) {
  // Railway/Heroku 등에서 제공하는 DATABASE_URL 사용
  console.log('🔍 Using DATABASE_URL from environment');
  
  // IPv6 문제 해결: DATABASE_URL에 IPv6가 포함되어 있으면 무시하고 Pooler 사용
  const dbUrl = process.env.DATABASE_URL;
  const hasIPv6 = dbUrl.includes('2406:da12') || dbUrl.includes('::');
  
  if (hasIPv6) {
    console.log('⚠️ IPv6 detected in DATABASE_URL, switching to Pooler connection');
    dbConfig = {
      client: 'pg',
      connection: {
        host: 'aws-0-ap-northeast-2.pooler.supabase.com',
        port: 6543,
        database: 'postgres',
        user: 'postgres.zowugqovtbukjstgblwk',
        password: 'duyang3927!',
        ssl: { rejectUnauthorized: false }
      },
      searchPath: ['public'],
      pool: {
        min: 2,
        max: 10
      }
    };
  } else {
    // Railway Production에서는 DATABASE_URL을 파싱하여 재구성
    if (isProd) {
      console.log('🔄 Production detected - Parsing and reconstructing DATABASE_URL');
      
      // DATABASE_URL에서 파라미터 추출
      const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
      
      if (urlParts) {
        const [, user, password, host, port, database] = urlParts;
        console.log(`📊 Parsed: user=${user}, host=${host}, port=${port}, db=${database}`);
        
        // 직접 연결 설정 (connectionString 대신 개별 파라미터 사용)
        dbConfig = {
          client: 'pg',
          connection: {
            host: host,
            port: parseInt(port),
            database: database,
            user: user,
            password: password,
            ssl: { rejectUnauthorized: false }
          },
          searchPath: ['public'],
          pool: {
            min: 2,
            max: 10
          }
        };
      } else {
        // 파싱 실패 시 기본값 사용
        console.log('⚠️ Failed to parse DATABASE_URL, using fallback');
        dbConfig = {
          client: 'pg',
          connection: {
            connectionString: dbUrl,
            ssl: { rejectUnauthorized: false }
          },
          searchPath: ['public'],
          pool: {
            min: 2,
            max: 10
          }
        };
      }
    } else {
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
    }
  }
} else {
  // 개별 환경변수 사용 (로컬 개발 또는 환경변수 직접 설정)
  console.log('🔍 Using individual database environment variables');
  
  // Railway에서 IPv6 문제가 있으면 Pooler 사용
  const usePooler = process.env.USE_POOLER === 'true' || isProd;
  
  if (usePooler) {
    console.log('🔄 Using Supabase Pooler connection for stability');
    dbConfig = {
      client: 'pg',
      connection: {
        host: process.env.DB_HOST || 'aws-0-ap-northeast-2.pooler.supabase.com',
        port: process.env.DB_PORT || 6543,
        database: process.env.DB_DATABASE || 'postgres',
        user: process.env.DB_USER || 'postgres.zowugqovtbukjstgblwk',
        password: process.env.DB_PASSWORD || 'duyang3927!',
        ssl: { rejectUnauthorized: false }
      },
      searchPath: ['public'],
      pool: {
        min: 2,
        max: 10
      }
    };
  } else {
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