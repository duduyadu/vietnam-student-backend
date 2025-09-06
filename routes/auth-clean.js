const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { logAction } = require('../middleware/auditLog');

// 로그인 라우트 - 깨끗한 버전
router.post('/login', [
  body('username').notEmpty().trim().withMessage('Username is required'),
  body('password').notEmpty().trim()
], async (req, res, next) => {
  try {
    console.log('🔐 Login attempt for:', req.body.username);
    
    // 유효성 검사
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array(),
        message: 'Invalid input data'
      });
    }

    const { username, password } = req.body;
    
    // 사용자 조회
    const user = await db('users')
      .where('username', username)
      .where('is_active', true)
      .first();

    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          message_ko: '잘못된 인증 정보입니다',
          message_vi: 'Thông tin xác thực không hợp lệ'
        }
      });
    }

    // 비밀번호 확인
    const hashedPassword = user.password_hash;
    
    if (!hashedPassword) {
      return res.status(500).json({
        error: {
          message: 'Password field not found',
          message_ko: '비밀번호 필드를 찾을 수 없습니다',
          message_vi: 'Không tìm thấy trường mật khẩu'
        }
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
          message_ko: '잘못된 인증 정보입니다',
          message_vi: 'Thông tin xác thực không hợp lệ'
        }
      });
    }

    // JWT 토큰 생성
    const userId = user.user_id || user.id;
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

    // 마지막 로그인 시간 업데이트
    await db('users')
      .where('user_id', userId)
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
      user
    });

  } catch (error) {
    console.error('❌ Login error:', error.message);
    
    res.status(500).json({
      error: {
        message: 'Login failed',
        message_ko: '로그인에 실패했습니다',
        message_vi: 'Đăng nhập thất bại',
        details: error.message
      }
    });
  }
});

module.exports = router;