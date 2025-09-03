require('dotenv').config();
const knex = require('knex');

// DB 설정
const db = knex({
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: process.env.DB_PORT || 6543,
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres.zowugqovtbukjstgblwk',
    password: process.env.DB_PASSWORD || 'duyang3927duyang',
    ssl: { rejectUnauthorized: false }
  }
});

async function fixReportTemplate() {
  console.log('🧠 ULTRATHINK: report_templates 테이블 수정');
  console.log('=' .repeat(70));

  try {
    // 1. report_templates 테이블 확인
    const hasTable = await db.schema.hasTable('report_templates');
    
    if (!hasTable) {
      console.log('📊 report_templates 테이블 생성');
      await db.schema.createTable('report_templates', table => {
        table.increments('template_id').primary();
        table.string('template_name', 100).notNullable();
        table.string('template_code', 50).notNullable().unique();
        table.text('description');
        table.string('report_type', 50);
        table.json('allowed_roles');
        table.boolean('is_active').defaultTo(true);
        table.timestamps(true, true);
      });
      
      console.log('✅ report_templates 테이블 생성 완료');
      
      // 기본 템플릿 데이터 삽입
      await db('report_templates').insert([
        {
          template_name: '학생 종합 생활기록부',
          template_code: 'student_comprehensive',
          description: '학생의 모든 정보를 포함한 종합 보고서',
          report_type: 'comprehensive',
          allowed_roles: JSON.stringify(['admin', 'teacher', 'branch']),
          is_active: true
        },
        {
          template_name: '학업 성적 보고서',
          template_code: 'academic_report',
          description: '학업 성적 및 TOPIK 결과 보고서',
          report_type: 'academic',
          allowed_roles: JSON.stringify(['admin', 'teacher', 'branch']),
          is_active: true
        },
        {
          template_name: '상담 기록 보고서',
          template_code: 'consultation_report',
          description: '상담 내역 종합 보고서',
          report_type: 'consultation',
          allowed_roles: JSON.stringify(['admin', 'teacher', 'branch']),
          is_active: true
        }
      ]);
      
      console.log('✅ 기본 템플릿 데이터 삽입 완료');
    } else {
      // 컬럼 확인
      const columns = await db.raw(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'report_templates' 
        AND table_schema = 'public'
      `);
      
      const columnNames = columns.rows.map(col => col.column_name);
      console.log('📊 현재 컬럼:', columnNames);
      
      // template_code 컬럼이 없으면 추가
      if (!columnNames.includes('template_code')) {
        console.log('📝 template_code 컬럼 추가 중...');
        await db.schema.alterTable('report_templates', table => {
          table.string('template_code', 50).notNullable().defaultTo('default').unique();
        });
        
        // 기존 레코드에 template_code 값 설정
        const templates = await db('report_templates').select('*');
        for (const template of templates) {
          await db('report_templates')
            .where('template_id', template.template_id)
            .update({
              template_code: `template_${template.template_id}`
            });
        }
        
        console.log('✅ template_code 컬럼 추가 완료');
      } else {
        console.log('✅ template_code 컬럼이 이미 존재합니다');
      }
    }
    
    // 최종 확인
    const templates = await db('report_templates').select('*');
    console.log('\n📊 현재 템플릿 목록:');
    templates.forEach(t => {
      console.log(`  - ${t.template_code}: ${t.template_name}`);
    });
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
    console.error(error);
  } finally {
    await db.destroy();
  }
}

fixReportTemplate();