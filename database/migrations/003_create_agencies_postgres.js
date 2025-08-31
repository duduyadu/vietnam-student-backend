exports.up = function(knex) {
  return knex.schema.createTable('agencies', function(table) {
    table.increments('agency_id').primary();
    table.string('agency_name', 100).notNullable();
    table.string('agency_code', 20).unique().notNullable();
    table.string('contact_person', 100);
    table.string('phone', 20);
    table.string('email', 100);
    table.text('address');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.integer('created_by').references('user_id').inTable('users');
    
    // 인덱스 추가
    table.index('agency_code');
    table.index('agency_name');
  })
  .then(() => {
    // 기본 유학원 데이터 추가
    return knex('agencies').insert([
      {
        agency_name: '하노이 유학원',
        agency_code: '001',
        contact_person: '김철수',
        phone: '024-1234-5678',
        email: 'hanoi@edu.vn',
        address: '하노이시 동다구',
        created_by: null
      },
      {
        agency_name: '호치민 유학원',
        agency_code: '002',
        contact_person: '이영희',
        phone: '028-9876-5432',
        email: 'hcmc@edu.vn',
        address: '호치민시 1군',
        created_by: null
      },
      {
        agency_name: '다낭 유학원',
        agency_code: '003',
        contact_person: '박민수',
        phone: '0236-456-7890',
        email: 'danang@edu.vn',
        address: '다낭시 해안구',
        created_by: null
      }
    ]);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('agencies');
};