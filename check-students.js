// 🧠 ULTRATHINK: 실제 학생 데이터 확인
const db = require('./config/database');

async function checkStudents() {
  console.log('='.repeat(60));
  console.log('🔍 CHECKING STUDENT DATA');
  console.log('='.repeat(60));
  
  try {
    // 1. 모든 학생 조회 (동적으로 필드 확인)
    const allStudents = await db('students')
      .select('student_id', 'student_code', 'name_korean', 'name_vietnamese', 'created_at')
      .orderBy('student_id', 'asc');
    
    console.log('\n📋 All Students:');
    allStudents.forEach(s => {
      console.log(`  - ID: ${s.student_id}, Code: ${s.student_code}, Name: ${s.name_korean || s.name_vietnamese || 'NO NAME'}, Created: ${s.created_at}`);
    });
    
    // 2. 상담 기록 확인
    const consultations = await db('consultations')
      .select('consultation_id', 'student_id', 'consultation_date')
      .orderBy('consultation_date', 'desc')
      .limit(10);
    
    console.log('\n📝 Recent Consultations:');
    consultations.forEach(c => {
      console.log(`  - ID: ${c.consultation_id}, Student ID: ${c.student_id}, Date: ${c.consultation_date}`);
    });
    
    // 3. student_id 매핑 문제 확인
    const orphanConsultations = await db('consultations as c')
      .leftJoin('students as s', 'c.student_id', 's.student_id')
      .whereNull('s.student_id')
      .select('c.consultation_id', 'c.student_id')
      .limit(10);
    
    if (orphanConsultations.length > 0) {
      console.log('\n⚠️ Consultations with non-existent students:');
      orphanConsultations.forEach(c => {
        console.log(`  - Consultation ${c.consultation_id} references non-existent student ${c.student_id}`);
      });
    }
    
    // 4. 컬럼 확인
    const columns = await db.raw(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'students' 
      AND column_name LIKE 'name%'
      ORDER BY column_name
    `);
    
    console.log('\n📊 Student table name columns:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}`);
    });
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.destroy();
  }
}

checkStudents();