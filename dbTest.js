const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://portfolio_user:DuEtPnvb6uYRB7ginffwDdeWnCgdQIw9@dpg-d40sb1s9c44c73cc1ajg-a.singapore-postgres.render.com/portfolio_db_d1aq',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testDB() {
  try {
    await client.connect();
    console.log('✅ DB 연결 성공!');

    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public';");
    console.log('📋 테이블 목록:', tables.rows);

    const guestbook = await client.query('SELECT * FROM guestbook LIMIT 5;');
    console.log('📝 방명록 예시 데이터:', guestbook.rows);

  } catch (err) {
    console.error('❌ DB 연결/쿼리 에러:', err);
  } finally {
    await client.end();
  }
}

testDB();
