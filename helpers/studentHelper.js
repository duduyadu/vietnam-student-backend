const db = require('../config/database');
// const { mapField } = require('./dbFieldMapper'); // 임시 비활성화

/**
 * 학생의 완전한 정보를 조회하는 헬퍼 함수
 * students 테이블에서 직접 정보를 가져옴
 */

// 단일 학생의 완전한 정보 조회
async function getStudentFullInfo(studentId) {
  try {
    // students 테이블에서 직접 조회
    const student = await db('students')
      .where('student_id', studentId)
      .first();
    
    if (!student) {
      return null;
    }
    
    // 이미 모든 정보가 students 테이블에 있음
    return student;
  } catch (error) {
    console.error('Error getting student full info:', error);
    return null;
  }
}

// 여러 학생의 완전한 정보 조회
async function getStudentsFullInfo(studentIds = []) {
  try {
    let query = db('students').select('*');
    
    if (studentIds.length > 0) {
      query = query.whereIn('student_id', studentIds);
    }
    
    const students = await query;
    return students;
  } catch (error) {
    console.error('Error getting students full info:', error);
    return [];
  }
}

// 학생 이름만 빠르게 조회
async function getStudentName(studentId) {
  try {
    // 🧠 ULTRATHINK: 환경별로 다른 필드명 사용!
    // Railway = name_ko, Local = name_korean
    const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production';
    const nameField = isRailway ? 'name_ko' : 'name_korean';
    const nameViField = isRailway ? 'name_vi' : 'name_vietnamese';
    
    // students 테이블에서 직접 이름 조회
    const student = await db('students')
      .where('student_id', studentId)
      .select('*')  // 모든 필드 가져오기
      .first();
    
    if (!student) {
      return '이름 없음';
    }
    
    // 환경에 따라 다른 필드 접근
    return student[nameField] || student[nameViField] || 
           student.name_ko || student.name_korean || 
           student.name_vi || student.name_vietnamese || '이름 없음';
  } catch (error) {
    console.error('Error getting student name:', error);
    return '이름 없음';
  }
}

module.exports = {
  getStudentFullInfo,
  getStudentsFullInfo,
  getStudentName
};