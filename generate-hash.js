const bcrypt = require('bcrypt');

async function generateHash() {
  const passwords = ['admin123', 'password123', 'test123'];
  
  for (const password of passwords) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log('---');
  }
  
  // 해시 검증 테스트
  const testHash = '$2b$10$xE8iQZ7V5.9Kt3XRz5mWIugKWMwCH3KQpzKQcXKp5pE0mxXEQKGRa';
  const isValid = await bcrypt.compare('admin123', testHash);
  console.log('admin123 해시 검증:', isValid);
}

generateHash();