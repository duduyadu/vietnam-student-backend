// 🧠 ULTRATHINK: DB 필드명 동적 매핑 헬퍼
// 환경에 따라 다른 필드명 사용 (name_ko vs name_korean)

const db = require('../config/database');

let fieldMapping = null;
let lastCheck = null;

/**
 * DB 필드명을 동적으로 확인하고 캐싱
 */
async function getFieldMapping() {
  // 10분마다 재확인
  if (fieldMapping && lastCheck && (Date.now() - lastCheck < 600000)) {
    return fieldMapping;
  }

  try {
    console.log('🔍 Checking DB field names...');
    
    // 실제 컬럼 확인
    const result = await db.raw(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'students' 
      AND column_name IN ('name_ko', 'name_korean', 'name_vi', 'name_vietnamese')
    `);
    
    const columns = result.rows.map(r => r.column_name);
    console.log('📋 Found columns:', columns);
    
    // 매핑 결정
    fieldMapping = {
      name_ko: columns.includes('name_korean') ? 'name_korean' : 'name_ko',
      name_vi: columns.includes('name_vietnamese') ? 'name_vietnamese' : 'name_vi',
      // 역매핑
      name_korean: columns.includes('name_korean') ? 'name_korean' : 'name_ko',
      name_vietnamese: columns.includes('name_vietnamese') ? 'name_vietnamese' : 'name_vi'
    };
    
    console.log('✅ Field mapping:', fieldMapping);
    lastCheck = Date.now();
    
  } catch (error) {
    console.error('❌ Error checking field mapping:', error.message);
    // 기본값 사용
    fieldMapping = {
      name_ko: 'name_ko',
      name_vi: 'name_vi',
      name_korean: 'name_ko',
      name_vietnamese: 'name_vi'
    };
  }
  
  return fieldMapping;
}

/**
 * 필드명 변환 함수
 */
async function mapField(fieldName) {
  const mapping = await getFieldMapping();
  return mapping[fieldName] || fieldName;
}

/**
 * 여러 필드를 한번에 매핑
 */
async function mapFields(fields) {
  const mapping = await getFieldMapping();
  return fields.map(field => mapping[field] || field);
}

module.exports = {
  getFieldMapping,
  mapField,
  mapFields
};