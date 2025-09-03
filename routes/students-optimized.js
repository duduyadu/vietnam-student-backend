const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../config/database');

console.log('🚀 Students router OPTIMIZED - With automatic ID generation');

router.use(verifyToken);

// ============================
// 학생 목록 조회 (뷰 사용으로 최적화)
// ============================
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', agency_id } = req.query;
    const offset = (page - 1) * limit;
    
    // students 테이블 직접 조회
    let query = db('students');
    
    // 권한 필터링
    if (req.user.role === 'teacher') {
      const agency = await db('agencies')
        .where('created_by', req.user.user_id)
        .first();
      if (agency) {
        query = query.where('agency_code', agency.agency_code);
      }
    }
    
    // 검색 필터
    if (search) {
      query = query.where(function() {
        this.where('student_code', 'like', `%${search}%`)
          .orWhere('name_ko', 'like', `%${search}%`);
      });
    }
    
    // 특정 유학원 필터
    if (agency_id) {
      query = query.where('agency_id', agency_id);
    }
    
    // 전체 개수
    const countQuery = query.clone();
    const [{ count }] = await countQuery.count('* as count');
    
    // 페이지네이션 및 agencies 조인
    const students = await query
      .leftJoin('agencies', 'students.agency_id', 'agencies.agency_id')
      .select(
        'students.*',
        'agencies.agency_name',
        'agencies.agency_code'
      )
      .orderBy('students.student_code', 'desc')
      .limit(limit)
      .offset(offset);
    
    // 응답 데이터 형식 통일
    const formattedStudents = students.map(student => ({
      ...student,
      // 이름 필드 확인 (name_ko가 있으면 사용, 없으면 name 필드 사용)
      name: student.name_ko || student.name || '-',
      // 다른 필드들도 확인
      phone: student.phone || '-',
      email: student.email || '-',
      // agency 정보 추가
      agency_name: student.agency_name || '-',
      agency_code: student.agency_code || '-'
    }));
    
    res.json({
      success: true,
      data: formattedStudents,
      pagination: {
        total: parseInt(count),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
        total_items: parseInt(count) // 프론트엔드 호환성
      }
    });
    
  } catch (error) {
    console.error('❌ Get students error:', error);
    res.status(500).json({ 
      error: 'Failed to get students',
      message: error.message 
    });
  }
});

// ============================
// 학생 생성 (자동 ID 생성)
// ============================
router.post('/', async (req, res) => {
  try {
    // 필드명 호환성 처리 (프론트엔드와 백엔드 필드명 매핑)
    const { 
      name_ko, 
      name_korean,  // 프론트엔드에서 사용하는 필드명
      name_vi, 
      name_vietnamese,  // 프론트엔드에서 사용하는 필드명
      agency_id,
      phone,
      email,
      birth_date,
      gender,
      address_vietnam,
      address_korea,
      parent_name,
      parent_phone,
      parent_income,
      parent_income_level,  // 프론트엔드에서 사용하는 필드명
      high_school,
      high_school_name,  // 프론트엔드에서 사용하는 필드명
      gpa,
      high_school_gpa,  // 프론트엔드에서 사용하는 필드명
      desired_major,
      target_major,  // 프론트엔드에서 사용하는 필드명
      desired_university,
      target_university,  // 프론트엔드에서 사용하는 필드명
      visa_type,
      visa_expiry,
      visa_expiry_date,  // 프론트엔드에서 사용하는 필드명
      alien_registration,
      agency_enrollment_date,
      enrollment_date  // 프론트엔드에서 사용하는 필드명
    } = req.body;
    
    // 필드명 정규화 (프론트엔드/백엔드 호환성)
    const normalizedName = name_ko || name_korean;
    const normalizedNameVi = name_vi || name_vietnamese;
    const normalizedParentIncome = parent_income || parent_income_level;
    const normalizedHighSchool = high_school || high_school_name;
    const normalizedGpa = gpa || high_school_gpa;
    const normalizedMajor = desired_major || target_major;
    const normalizedUniversity = desired_university || target_university;
    const normalizedVisaExpiry = visa_expiry || visa_expiry_date;
    const normalizedEnrollmentDate = agency_enrollment_date || enrollment_date;
    
    console.log('📋 Request body received:', {
      normalizedName,
      agency_id,
      hasName: !!normalizedName,
      hasAgency: !!agency_id,
      fullBody: req.body
    });
    
    // 필수 필드 검증 - agency_id는 admin이 아닌 경우 선택사항으로 처리
    if (!normalizedName) {
      console.error('❌ Missing required name field');
      return res.status(400).json({
        error: 'Required fields missing',
        message_ko: '학생 이름은 필수입니다',
        details: {
          name: !normalizedName ? 'missing' : 'ok'
        }
      });
    }
    
    // teacher의 경우 자신의 agency_id 자동 설정
    let finalAgencyId = agency_id;
    if (req.user.role === 'teacher' && !agency_id) {
      // teacher가 속한 agency 찾기
      const teacherAgency = await db('agencies')
        .where('created_by', req.user.user_id)
        .first();
      
      if (teacherAgency) {
        finalAgencyId = teacherAgency.agency_id;
        console.log('📌 Teacher agency auto-assigned:', finalAgencyId);
      }
    }
    
    // 유학원 코드 조회 (agency_id가 있는 경우에만)
    let agency = null;
    let student_code;
    
    if (finalAgencyId) {
      agency = await db('agencies')
        .where('agency_id', finalAgencyId)
        .first();
      
      if (!agency) {
        console.error('❌ Agency not found for ID:', finalAgencyId);
        return res.status(404).json({
          error: 'Agency not found',
          message_ko: '유학원을 찾을 수 없습니다',
          agency_id: finalAgencyId
        });
      }
    }
    
    if (agency) {
      console.log('✅ Agency found:', {
        agency_id: agency.agency_id,
        agency_code: agency.agency_code,
        name: agency.name
      });
      
      // agency_code가 없으면 기본값 사용
      if (!agency.agency_code) {
        console.warn('⚠️ Agency has no agency_code, using default');
        agency.agency_code = 'DEFAULT';
      }
    }
    
    // 권한 체크 (교사는 자기 유학원만)
    if (req.user.role === 'teacher' && finalAgencyId) {
      const teacherAgency = await db('agencies')
        .where('created_by', req.user.user_id)
        .first();
      
      if (!teacherAgency || teacherAgency.agency_id !== finalAgencyId) {
        return res.status(403).json({
          error: 'Access denied',
          message_ko: '권한이 없습니다'
        });
      }
    }
    
    // 학생 코드 자동 생성
    if (agency) {
      try {
        const result = await db.raw('SELECT generate_student_code(?) as student_code', [agency.agency_code]);
        student_code = result.rows[0].student_code;
        console.log('✅ Generated student code:', student_code);
      } catch (genError) {
        console.error('❌ Error generating student code:', genError);
        // 함수가 없거나 에러가 발생하면 타임스탬프 기반 코드 생성
        const timestamp = Date.now().toString(36).toUpperCase();
        student_code = `${agency.agency_code || 'STU'}-${timestamp}`;
        console.log('⚠️ Using fallback student code:', student_code);
      }
    } else {
      // agency가 없을 경우 기본 학생 코드 생성
      const timestamp = Date.now().toString(36).toUpperCase();
      student_code = `STU-${timestamp}`;
      console.log('🆔 Using default student code (no agency):', student_code);
    }
    
    console.log(`📝 Creating student with code: ${student_code}`);
    
    // birth_date와 visa_expiry 형식 변환 (YYYY-MM-DD)
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      
      // YYYY-MM 형식이면 01일 추가 (월 단위 날짜)
      if (/^\d{4}-\d{2}$/.test(dateStr)) {
        return `${dateStr}-01`;
      }
      
      // YYYY-MM-DD 형식이면 그대로 사용
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }
      
      // YYYYMMDD 형식을 YYYY-MM-DD로 변환
      if (/^\d{8}$/.test(dateStr)) {
        return `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
      }
      
      // YYYY/MM/DD 형식을 YYYY-MM-DD로 변환
      if (/^\d{4}\/\d{2}\/\d{2}$/.test(dateStr)) {
        return dateStr.replace(/\//g, '-');
      }
      
      return dateStr;
    };
    
    // 사용자 정보 디버깅
    console.log('🔐 Current user info:', {
      user_id: req.user?.user_id,
      role: req.user?.role,
      email: req.user?.email,
      agency_id: req.user?.agency_id,
      full_user: req.user
    });
    
    // created_by 필드 확인 및 기본값 설정
    const createdBy = req.user?.user_id || 1; // 기본값 1 설정 (임시)
    
    if (!req.user?.user_id) {
      console.warn('⚠️ Warning: req.user.user_id is undefined, using default value:', createdBy);
    }
    
    // 학생 데이터 준비 (정규화된 필드 사용)
    const studentData = {
      student_code,
      name_korean: normalizedName,  // 테이블 컬럼명과 일치
      name_vietnamese: normalizedNameVi || normalizedName,
      agency_id: finalAgencyId,  // null일 수 있음
      // status field removed - column doesn't exist in database
      phone,
      email,
      birth_date: formatDate(birth_date),
      gender,
      address_vietnam,
      address_korea,
      parent_name,
      parent_phone,
      parent_income_level: normalizedParentIncome,  // 테이블 컬럼명과 일치
      high_school_name: normalizedHighSchool,  // 테이블 컬럼명과 일치
      high_school_gpa: normalizedGpa ? parseFloat(normalizedGpa) : null,  // 테이블 컬럼명과 일치
      target_major: normalizedMajor,  // 테이블 컬럼명과 일치
      target_university: normalizedUniversity,  // 테이블 컬럼명과 일치
      visa_type,
      visa_expiry_date: formatDate(normalizedVisaExpiry),  // 테이블 컬럼명과 일치
      // alien_registration removed - column doesn't exist in database
      enrollment_date: normalizedEnrollmentDate,  // 테이블 컬럼명과 일치
      created_by: createdBy
    };
    
    console.log('📝 Student data prepared with created_by:', createdBy);
    console.log('📝 Full student data:', JSON.stringify(studentData, null, 2));
    
    // 학생 생성
    let newStudent;
    try {
      const result = await db('students')
        .insert(studentData)
        .returning('*');
      
      newStudent = result[0];
      console.log(`✅ Created student: ${name_ko} with code: ${student_code}`);
      console.log('✅ New student data:', newStudent);
    } catch (dbError) {
      console.error('❌ Database insert error:', dbError);
      console.error('❌ Error details:', {
        code: dbError.code,
        detail: dbError.detail,
        message: dbError.message,
        table: dbError.table,
        constraint: dbError.constraint
      });
      
      // 특정 데이터베이스 에러에 대한 처리
      if (dbError.code === '23505') { // Unique violation
        return res.status(409).json({
          error: 'Duplicate student code',
          message_ko: '중복된 학생 코드입니다',
          detail: dbError.detail
        });
      }
      
      if (dbError.code === '23503') { // Foreign key violation
        return res.status(400).json({
          error: 'Invalid reference',
          message_ko: '유효하지 않은 참조입니다 (유학원 또는 사용자)',
          detail: dbError.detail
        });
      }
      
      if (dbError.code === '23502') { // Not null violation
        return res.status(400).json({
          error: 'Missing required field',
          message_ko: '필수 필드가 누락되었습니다',
          detail: dbError.detail,
          column: dbError.column
        });
      }
      
      // 기타 에러
      return res.status(500).json({
        error: 'Database error',
        message_ko: '데이터베이스 오류가 발생했습니다',
        message: dbError.message,
        code: dbError.code
      });
    }
    
    res.status(201).json({
      success: true,
      message: `학생이 등록되었습니다. 학생 ID: ${student_code}`,
      data: newStudent
    });
    
  } catch (error) {
    console.error('❌ Create student error:', error);
    console.error('❌ Full error object:', JSON.stringify(error, null, 2));
    res.status(500).json({
      error: 'Failed to create student',
      message: error.message,
      details: error.toString()
    });
  }
});

// ============================
// 학생 정보 수정
// ============================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name_ko, 
      name_vi,
      status,
      phone,
      email,
      birth_date,
      address
    } = req.body;
    
    // 학생 존재 확인
    const student = await db('students')
      .where('student_id', id)
      .first();
    
    if (!student) {
      return res.status(404).json({
        error: 'Student not found',
        message_ko: '학생을 찾을 수 없습니다'
      });
    }
    
    // 권한 체크
    if (req.user.role === 'teacher') {
      const agency = await db('agencies')
        .where('agency_id', student.agency_id)
        .first();
      
      if (agency.created_by !== req.user.user_id) {
        return res.status(403).json({
          error: 'Access denied',
          message_ko: '수정 권한이 없습니다'
        });
      }
    }
    
    // 업데이트
    const [updated] = await db('students')
      .where('student_id', id)
      .update({
        name_ko,
        name_vi: name_vi || '',
        status,
        updated_at: new Date()
      })
      .returning('*');
    
    res.json({
      success: true,
      message: '학생 정보가 수정되었습니다',
      data: updated
    });
    
  } catch (error) {
    console.error('❌ Update student error:', error);
    res.status(500).json({
      error: 'Failed to update student',
      message: error.message
    });
  }
});

// ============================
// 학생 삭제 - CASCADE DELETE 활용
// ============================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { force } = req.query;
    
    console.log(`🗑️ Delete request for student ID: ${id}, force: ${force}`);
    
    // 학생 존재 확인
    const student = await db('students')
      .where('student_id', id)
      .first();
    
    if (!student) {
      return res.status(404).json({
        error: 'Student not found',
        message_ko: '학생을 찾을 수 없습니다'
      });
    }
    
    console.log(`📋 Found student: ${student.student_code} (${student.name_ko})`);
    
    // 권한 체크 (관리자만)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message_ko: '삭제 권한이 없습니다'
      });
    }
    
    // 관련 데이터 확인 (정보 제공용)
    const consultationResult = await db('consultations')
      .where('student_id', id)
      .count('* as count');
    const consultationCount = parseInt(consultationResult[0].count) || 0;
    
    console.log(`📊 Student has ${consultationCount} consultation records`);
    
    // 삭제 옵션 결정
    if (consultationCount > 0 && force !== 'true') {
      // 소프트 삭제: archived 상태로 변경
      console.log('📦 Archiving student (soft delete)');
      
      await db('students')
        .where('student_id', id)
        .update({
          status: 'archived',
          updated_at: new Date()
        });
      
      return res.json({
        success: true,
        message: '학생이 보관 처리되었습니다',
        message_ko: '학생이 보관 처리되었습니다',
        soft_delete: true,
        consultation_count: consultationCount
      });
    }
    
    // 하드 삭제: CASCADE DELETE 활용
    console.log('🔥 Hard delete - CASCADE DELETE will remove all related data');
    
    // Foreign keys는 모두 CASCADE DELETE로 설정되어 있으므로
    // 학생만 삭제하면 관련 데이터도 자동으로 삭제됨
    const deletedCount = await db('students')
      .where('student_id', id)
      .delete();
    
    if (deletedCount === 0) {
      throw new Error('Failed to delete student');
    }
    
    console.log(`✅ Successfully deleted student ${student.student_code} and all related data`);
    
    return res.json({
      success: true,
      message: '학생이 완전히 삭제되었습니다',
      message_ko: '학생이 완전히 삭제되었습니다',
      hard_delete: true,
      force: force === 'true',
      deleted_student: student.student_code
    });
    
  } catch (error) {
    console.error('❌ Delete student error:', error);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    
    res.status(500).json({
      error: 'Failed to delete student',
      message: error.message,
      code: error.code
    });
  }
});

// ============================
// 학생 상세 정보 조회
// ============================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await db('v_students_full')
      .where('student_id', id)
      .first();
    
    if (!student) {
      return res.status(404).json({
        error: 'Student not found',
        message_ko: '학생을 찾을 수 없습니다'
      });
    }
    
    // 권한 체크
    if (req.user.role === 'teacher') {
      const agency = await db('agencies')
        .where('agency_id', student.agency_id)
        .first();
      
      if (agency.created_by !== req.user.user_id) {
        return res.status(403).json({
          error: 'Access denied',
          message_ko: '조회 권한이 없습니다'
        });
      }
    }
    
    res.json({
      success: true,
      data: student
    });
    
  } catch (error) {
    console.error('❌ Get student error:', error);
    res.status(500).json({
      error: 'Failed to get student',
      message: error.message
    });
  }
});

// ============================
// 학생 사진 업로드
// ============================
const multer = require('multer');
const path = require('path');

// 사진 업로드 설정
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/student-photos/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'student-' + req.params.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const photoUpload = multer({ 
  storage: photoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다 (jpg, jpeg, png, gif)'));
    }
  }
});

// 학생 사진 업로드
router.post('/:id/photo', photoUpload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: '사진 파일이 필요합니다' });
    }
    
    // 파일 경로를 상대 경로로 저장
    const photoUrl = '/uploads/student-photos/' + req.file.filename;
    
    // 학생 정보 업데이트
    const [updatedStudent] = await db('students')
      .where('id', id)
      .update({
        photo_url: photoUrl,
        photo_uploaded_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');
    
    if (!updatedStudent) {
      return res.status(404).json({ error: '학생을 찾을 수 없습니다' });
    }
    
    res.json({
      success: true,
      message: '사진이 업로드되었습니다',
      photo_url: photoUrl,
      student: updatedStudent
    });
    
  } catch (error) {
    console.error('❌ Photo upload error:', error);
    res.status(500).json({
      error: '사진 업로드 실패',
      message: error.message
    });
  }
});

// 학생 사진 삭제
router.delete('/:id/photo', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 기존 사진 정보 조회
    const student = await db('students')
      .where('id', id)
      .first();
    
    if (!student) {
      return res.status(404).json({ error: '학생을 찾을 수 없습니다' });
    }
    
    // 파일 시스템에서 사진 삭제 (옵션)
    if (student.photo_url) {
      const fs = require('fs').promises;
      const filePath = path.join(__dirname, '..', student.photo_url);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn('파일 삭제 실패:', err.message);
      }
    }
    
    // DB에서 사진 정보 제거
    const [updatedStudent] = await db('students')
      .where('id', id)
      .update({
        photo_url: null,
        photo_uploaded_at: null,
        updated_at: db.fn.now()
      })
      .returning('*');
    
    res.json({
      success: true,
      message: '사진이 삭제되었습니다',
      student: updatedStudent
    });
    
  } catch (error) {
    console.error('❌ Photo delete error:', error);
    res.status(500).json({
      error: '사진 삭제 실패',
      message: error.message
    });
  }
});

module.exports = router;