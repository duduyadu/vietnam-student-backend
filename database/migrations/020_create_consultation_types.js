exports.up = function(knex) {
  return knex.schema.createTable('consultation_types', function(table) {
    table.increments('type_id').primary();
    table.string('type_code', 20).unique().notNullable();
    table.string('type_name', 100).notNullable();
    table.string('type_name_ko', 100);
    table.string('type_name_vi', 100);
    table.text('description');
    table.integer('display_order').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // 인덱스 추가
    table.index('type_code');
    table.index('is_active');
  })
  .then(() => {
    // 기본 상담 유형 데이터 추가
    return knex('consultation_types').insert([
      {
        type_code: 'REGULAR',
        type_name: '정기 상담',
        type_name_ko: '정기 상담',
        type_name_vi: 'Tư vấn định kỳ',
        description: '매월 진행하는 정기 상담',
        display_order: 1,
        is_active: true
      },
      {
        type_code: 'ACADEMIC',
        type_name: '학업 상담',
        type_name_ko: '학업 상담',
        type_name_vi: 'Tư vấn học tập',
        description: '학업 성취도 및 진로 상담',
        display_order: 2,
        is_active: true
      },
      {
        type_code: 'LIFE',
        type_name: '생활 상담',
        type_name_ko: '생활 상담',
        type_name_vi: 'Tư vấn sinh hoạt',
        description: '일상 생활 관련 상담',
        display_order: 3,
        is_active: true
      },
      {
        type_code: 'CAREER',
        type_name: '진로 상담',
        type_name_ko: '진로 상담',
        type_name_vi: 'Tư vấn hướng nghiệp',
        description: '대학 진학 및 진로 상담',
        display_order: 4,
        is_active: true
      },
      {
        type_code: 'EMERGENCY',
        type_name: '긴급 상담',
        type_name_ko: '긴급 상담',
        type_name_vi: 'Tư vấn khẩn cấp',
        description: '긴급한 문제 발생 시 상담',
        display_order: 5,
        is_active: true
      },
      {
        type_code: 'PARENT',
        type_name: '학부모 상담',
        type_name_ko: '학부모 상담',
        type_name_vi: 'Tư vấn phụ huynh',
        description: '학부모와 함께하는 상담',
        display_order: 6,
        is_active: true
      }
    ]);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('consultation_types');
};