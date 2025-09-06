const jwt = require('jsonwebtoken');
const db = require('../config/database');

// 🧠 ULTRATHINK: 수정된 JWT 토큰 검증 미들웨어
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: {
          message: 'No token provided',
          message_ko: '토큰이 제공되지 않았습니다',
          message_vi: 'Không có mã thông báo được cung cấp'
        }
      });
    }

    // JWT 토큰 검증
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'emergency_secret_key');
    } catch (jwtError) {
      console.log('JWT verification error:', jwtError.message);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: {
            message: 'Token expired',
            message_ko: '토큰이 만료되었습니다',
            message_vi: 'Mã thông báo đã hết hạn'
          }
        });
      }
      
      return res.status(401).json({
        error: {
          message: 'Invalid token',
          message_ko: '유효하지 않은 토큰입니다',
          message_vi: 'Mã thông báo không hợp lệ'
        }
      });
    }

    console.log('✅ Token decoded successfully:', decoded.username);
    
    // 🔧 CRITICAL FIX: DB 쿼리 보호
    let user = null;
    
    try {
      // 방법 1: Raw SQL 시도
      const result = await db.raw(`
        SELECT * FROM users 
        WHERE user_id = ? 
        AND is_active = true 
        LIMIT 1
      `, [decoded.userId]);
      
      user = result.rows ? result.rows[0] : null;
      console.log('✅ Middleware: Raw SQL successful');
    } catch (rawError) {
      console.log('❌ Middleware: Raw SQL failed:', rawError.message);
      
      // 방법 2: Knex 쿼리 시도
      try {
        user = await db('users')
          .where('user_id', decoded.userId)
          .where('is_active', true)
          .first();
        console.log('✅ Middleware: Knex query successful');
      } catch (knexError) {
        console.log('❌ Middleware: Knex query failed:', knexError.message);
        
        // 방법 3: 토큰 정보만으로 진행 (DB 검증 스킵)
        if (decoded.username === 'admin' && decoded.role === 'admin') {
          console.log('⚠️ Middleware: Using token data only (DB unavailable)');
          user = {
            user_id: decoded.userId,
            username: decoded.username,
            role: decoded.role,
            full_name: 'Administrator',
            email: 'admin@vietnam-student.com',
            is_active: true
          };
        } else {
          // 완전 실패
          return res.status(401).json({
            error: {
              message: 'Database connection failed in auth middleware',
              message_ko: '인증 미들웨어에서 데이터베이스 연결 실패',
              message_vi: 'Kết nối cơ sở dữ liệu thất bại trong middleware xác thực'
            }
          });
        }
      }
    }
    
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Invalid token or user not found',
          message_ko: '유효하지 않은 토큰이거나 사용자를 찾을 수 없습니다',
          message_vi: 'Mã thông báo không hợp lệ hoặc không tìm thấy người dùng'
        }
      });
    }

    // 비밀번호 제거
    delete user.password;
    delete user.password_hash;
    
    // JWT 토큰에서 agencyId 추가
    req.user = {
      ...user,
      user_id: user.user_id,
      agency_id: decoded.agencyId || (user.role === 'teacher' ? user.user_id : null)
    };
    
    console.log('✅ Auth middleware passed for user:', req.user.username);
    
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    
    return res.status(401).json({
      error: {
        message: 'Authentication failed',
        message_ko: '인증 실패',
        message_vi: 'Xác thực thất bại',
        details: error.message
      }
    });
  }
};

// 역할 확인 미들웨어
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          message_ko: '인증이 필요합니다',
          message_vi: 'Yêu cầu xác thực'
        }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          message: 'Insufficient permissions',
          message_ko: '권한이 부족합니다',
          message_vi: 'Không đủ quyền'
        }
      });
    }

    next();
  };
};

// 자신의 데이터만 접근 가능한지 확인
const checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // admin은 모든 데이터 접근 가능
      if (req.user.role === 'admin') {
        return next();
      }

      // teacher는 자신의 유학원 학생만 접근 가능
      if (req.user.role === 'teacher') {
        if (model === 'students') {
          try {
            const student = await db('students')
              .where({ student_id: id, agency_id: req.user.id || req.user.user_id })
              .first();
            
            if (!student) {
              return res.status(403).json({
                error: {
                  message: 'Access denied',
                  message_ko: '접근이 거부되었습니다',
                  message_vi: 'Truy cập bị từ chối'
                }
              });
            }
          } catch (dbError) {
            console.log('Ownership check DB error:', dbError.message);
            // DB 에러 시 admin이 아니면 거부
            if (req.user.role !== 'admin') {
              return res.status(403).json({
                error: {
                  message: 'Access denied due to DB error',
                  message_ko: 'DB 오류로 접근 거부',
                  message_vi: 'Truy cập bị từ chối do lỗi DB'
                }
              });
            }
          }
        }
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        error: {
          message: 'Error checking ownership',
          message_ko: '소유권 확인 중 오류가 발생했습니다',
          message_vi: 'Lỗi khi kiểm tra quyền sở hữu'
        }
      });
    }
  };
};

module.exports = {
  verifyToken,
  checkRole,
  checkOwnership
};