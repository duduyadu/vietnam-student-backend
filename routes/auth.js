const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { logAction } = require('../middleware/auditLog');

// 로그인 라우트
router.post('/login', [
  body('username').notEmpty().trim().withMessage('Username is required'),
  body('password').notEmpty().trim()
], async (req, res, next) => {
  try {
    console.log('🔐 Login attempt for:', req.body.username);
    
    // 유효성 검사
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ 
        errors: errors.array(),
        message: 'Invalid input data'
      });
    }

    const { username, password } = req.body;
    console.log('Processing login for:', username);

    // 사용자 조회
    console.log('Looking for user with username:', username);
    
    // 디버깅: 테이블 컬럼 확인
    const columns = await db.raw(`SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND table_schema = 'public'`);
    console.log('🔍 Users table columns:', columns.rows.map(r => r.column_name).join(', '));
    
    // 디버깅: 실제 데이터 확인 (두 가지 테이블 구조 모두 지원)
    try {
      // id 컬럼이 있는 경우
      const allUsers = await db('users').select('id', 'username').limit(5);
      console.log('📊 Sample users in DB (id):', allUsers);
    } catch (err) {
      // user_id 컬럼이 있는 경우
      try {
        const allUsers = await db('users').select('user_id', 'username').limit(5);
        console.log('📊 Sample users in DB (user_id):', allUsers);
      } catch (err2) {
        console.log('❌ Cannot query users table:', err2.message);
      }
    }
    
    // 디버깅: 먼저 username으로만 조회
    const userCheck = await db('users').where('username', username).first();
    console.log('User exists?:', userCheck ? 'Yes' : 'No');
    if (userCheck) {
      console.log('User is_active value:', userCheck.is_active);
      console.log('User is_active type:', typeof userCheck.is_active);
      console.log('Available fields:', Object.keys(userCheck));
      console.log('Password field:', userCheck.password ? 'password' : userCheck.password_hash ? 'password_hash' : 'NOT FOUND');
    }
    
    // 실제 조회
    const user = await db('users')
      .where('username', username)
      .where('is_active', true)  // PostgreSQL boolean은 true/false 사용
      .first();
    
    console.log('User found with is_active=1?:', user ? 'Yes' : 'No');
    // Force reload
    if (user) {
      console.log('User details:', {
        user_id: user.user_id || user.id,
        username: user.username,
        role: user.role,
        has_password: !!user.password
      });
    }

    if (!user) {
      console.log('User not found or inactive');
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          message_ko: '잘못된 인증 정보입니다',
          message_vi: 'Thông tin xác thực không hợp lệ'
        }
      });
    }

    // 비밀번호 확인 (password_hash 필드 사용)
    console.log('Checking password...');
    const hashedPassword = user.password_hash;  // password_hash 필드만 사용
    
    if (!hashedPassword) {
      console.error('No password_hash field found in user record!');
      console.error('Available fields:', Object.keys(user));
      return res.status(500).json({
        error: {
          message: 'Password field not found',
          message_ko: '비밀번호 필드를 찾을 수 없습니다',
          message_vi: 'Không tìm thấy trường mật khẩu'
        }
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          message_ko: '잘못된 인증 정보입니다',
          message_vi: 'Thông tin xác thực không hợp lệ'
        }
      });
    }

    // JWT 토큰 생성 (teacher의 경우 자신의 id를 agency_id로 사용)
    const userId = user.id || user.user_id;  // id 또는 user_id 사용
    const token = jwt.sign(
      { 
        userId: userId,
        username: user.username,
        role: user.role,
        agencyId: user.role === 'teacher' ? userId : null
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // 마지막 로그인 시간 업데이트 (id 또는 user_id 사용)
    const whereClause = user.id ? { id: userId } : { user_id: userId };
    await db('users')
      .where(whereClause)
      .update({ last_login: new Date() });

    // 로그인 감사 로그
    req.user = user;
    await logAction(req, 'LOGIN', 'users', userId);

    // 비밀번호 제거
    delete user.password_hash;
    delete user.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        user_id: userId,  // 통일된 userId 사용
        username: user.username,
        name: user.name || user.full_name,  // name 또는 full_name
        role: user.role,
        agency_name: user.agency_name,
        branch_name: user.branch_name,
        preferred_language: user.preferred_language || 'ko'
      }
    });

  } catch (error) {
    console.error('❌ Login error caught:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('Request body:', req.body);
    
    // 에러를 다음 미들웨어로 전달하지 않고 직접 처리
    return res.status(500).json({
      error: {
        message: 'Login failed',
        message_ko: '로그인에 실패했습니다',
        message_vi: 'Đăng nhập thất bại',
        details: error.message // 디버깅용
      }
    });
  }
});

// 회원가입 라우트 (관리자만 가능)
router.post('/register', [
  body('username').notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('full_name').notEmpty().trim(),
  body('role').isIn(['admin', 'teacher', 'korean_branch']),
  body('phone').optional().trim(),
  body('agency_name').optional().trim(),
  body('branch_name').optional().trim(),
  body('preferred_language').optional().isIn(['ko', 'vi'])
], async (req, res) => {
  try {
    // 유효성 검사
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array(),
        message: 'Invalid input data'
      });
    }

    const { 
      username,
      email, 
      password, 
      full_name, 
      role, 
      phone,
      agency_name, 
      branch_name,
      preferred_language 
    } = req.body;

    // username 중복 확인
    const existingUser = await db('users')
      .where({ username })
      .first();

    if (existingUser) {
      return res.status(409).json({
        error: {
          message: 'Username already exists',
          message_ko: '이미 존재하는 사용자 ID입니다',
          message_vi: 'Tên người dùng đã tồn tại'
        }
      });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const [newUser] = await db('users')
      .insert({
        username,
        email,
        password_hash: hashedPassword,
        full_name,
        role,
        phone,
        agency_name: role === 'teacher' ? agency_name : null,
        branch_name: role === 'korean_branch' ? branch_name : null,
        preferred_language: preferred_language || 'ko'
      })
      .returning(['user_id', 'username', 'email', 'full_name', 'role']);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: newUser
    });

  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    
    // 더 구체적인 에러 메시지 제공
    let errorMessage = 'Registration failed';
    let errorMessageKo = '회원가입에 실패했습니다';
    
    if (error.code === '23505') { // Unique constraint violation
      errorMessage = 'Username or email already exists';
      errorMessageKo = '이미 존재하는 사용자명 또는 이메일입니다';
    } else if (error.code === '23502') { // Not null violation
      errorMessage = 'Required field is missing';
      errorMessageKo = '필수 항목이 누락되었습니다';
    }
    
    res.status(500).json({
      error: {
        message: errorMessage,
        message_ko: errorMessageKo,
        message_vi: 'Đăng ký thất bại',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

// 비밀번호 변경
router.post('/change-password', [
  body('current_password').notEmpty(),
  body('new_password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { current_password, new_password } = req.body;
    const userId = req.user.id || req.user.user_id;

    // 현재 비밀번호 확인
    const user = await db('users')
      .where({ user_id: userId })  // user_id 사용
      .first();

    const isPasswordValid = await bcrypt.compare(current_password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          message: 'Current password is incorrect',
          message_ko: '현재 비밀번호가 올바르지 않습니다',
          message_vi: 'Mật khẩu hiện tại không chính xác'
        }
      });
    }

    // 새 비밀번호 해싱 및 업데이트
    const hashedPassword = await bcrypt.hash(new_password, 10);
    
    await db('users')
      .where({ user_id: userId })  // user_id 사용
      .update({ 
        password_hash: hashedPassword,  // password_hash 사용
        updated_at: new Date()
      });

    // 감사 로그
    await logAction(req, 'UPDATE', 'users', userId, null, { password_changed: true });

    res.json({
      success: true,
      message: 'Password changed successfully',
      message_ko: '비밀번호가 성공적으로 변경되었습니다',
      message_vi: 'Đổi mật khẩu thành công'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      error: {
        message: 'Password change failed',
        message_ko: '비밀번호 변경에 실패했습니다',
        message_vi: 'Đổi mật khẩu thất bại'
      }
    });
  }
});

// 토큰 갱신
router.post('/refresh-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        error: {
          message: 'Token required',
          message_ko: '토큰이 필요합니다',
          message_vi: 'Yêu cầu mã thông báo'
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    
    // 토큰 만료 시간 체크 (7일 이내면 갱신 가능)
    const tokenExp = decoded.exp * 1000;
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    
    if (now - tokenExp > sevenDays) {
      return res.status(401).json({
        error: {
          message: 'Token too old to refresh',
          message_ko: '토큰이 너무 오래되어 갱신할 수 없습니다',
          message_vi: 'Mã thông báo quá cũ để làm mới'
        }
      });
    }

    // 사용자 확인
    const user = await db('users')
      .where({ user_id: decoded.userId, is_active: true })  // user_id 사용
      .first();

    if (!user) {
      return res.status(401).json({
        error: {
          message: 'User not found',
          message_ko: '사용자를 찾을 수 없습니다',
          message_vi: 'Không tìm thấy người dùng'
        }
      });
    }

    // 새 토큰 발급 (teacher의 경우 자신의 id를 agency_id로 사용)
    const newToken = jwt.sign(
      { 
        userId: user.user_id,  // user_id 사용
        username: user.username,
        role: user.role,
        agencyId: user.role === 'teacher' ? user.user_id : null  // user_id 사용
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      token: newToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: {
        message: 'Token refresh failed',
        message_ko: '토큰 갱신에 실패했습니다',
        message_vi: 'Làm mới mã thông báo thất bại'
      }
    });
  }
});

module.exports = router;