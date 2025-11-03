import express from 'express';
import pkg from 'pg';
import cors from 'cors';

dotenv.config(); // .env 불러오기

const { Pool } = pkg;
const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// DB 연결 확인
pool.connect()
  .then(() => console.log('✅ PostgreSQL connected!'))
  .catch(err => console.error('❌ DB 연결 실패:', err));

// --- 테이블 생성 함수 ---
const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Portfolio (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description VARCHAR(2000),
        github_url VARCHAR(500),
        demo_url VARCHAR(500),
        tech_stack VARCHAR(200),
        thumbnail VARCHAR(500),
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Guestbook (
        id SERIAL PRIMARY KEY,
        author_name VARCHAR(50) NOT NULL,
        content VARCHAR(1000),
        password VARCHAR(100) NOT NULL,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ 테이블 생성 완료!');
  } catch (err) {
    console.error('❌ 테이블 생성 실패:', err);
  }
};

// --- 기존 API 코드 ---
// 프로젝트 목록
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Portfolio ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ 프로젝트 불러오기 실패:', err);
    res.status(500).send('DB 오류 발생');
  }
});

// 프로젝트 추가
app.post('/api/projects', async (req, res) => {
  const { title, description, techStack, githubUrl, demoUrl, thumbnail } = req.body;
  await pool.query(
    `INSERT INTO Portfolio (title, description, tech_stack, github_url, demo_url, thumbnail)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [title, description, techStack, githubUrl, demoUrl, thumbnail]
  );
  res.status(201).send('프로젝트 추가 완료!');
});

// 방명록 목록
app.get('/api/guestbooks', async (req, res) => {
  const result = await pool.query('SELECT * FROM Guestbook ORDER BY id DESC');
  res.json(result.rows);
});

// 방명록 추가
app.post('/api/guestbooks', async (req, res) => {
  const { author_name, content, password } = req.body;
  await pool.query(
    'INSERT INTO Guestbook (author_name, content, password, created_date) VALUES ($1, $2, $3, NOW())',
    [author_name, content, password]
  );
  res.status(201).send('방명록 추가 완료!');
});

// --- 서버 시작 + 테이블 생성 ---
const port = process.env.PORT || 3000;
app.listen(port, async () => {
  console.log(`✅ Server running on port ${port}`);
  await createTables(); // 서버 시작 시 테이블 생성
});
