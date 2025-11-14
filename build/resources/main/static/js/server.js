import express from 'express';
import pkg from 'pg';
import cors from 'cors';
import * as dotenv from 'dotenv'; // 👈 dotenv 임포트 추가

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

// ------------------- 테이블 생성 함수 -------------------
const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
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
      CREATE TABLE IF NOT EXISTS guestbooks (
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

// ====================== 프로젝트 API (CRUD) ======================

// 1. 프로젝트 목록 조회 (GET /api/projects) - 수정됨: 별칭 및 컬럼 명시
app.get('/api/projects', async (req, res) => {
  try {
    // tech_stack -> "techStack", created_date -> "createdAt"으로 별칭 지정
    const result = await pool.query(
      'SELECT id, title, description, github_url, demo_url, tech_stack AS "techStack", thumbnail, created_date AS "createdAt" FROM projects ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ 프로젝트 목록 불러오기 실패:', err);
    res.status(500).send('DB 오류 발생');
  }
});

// 2. 프로젝트 개별 조회 (GET /api/projects/:id) - 추가됨
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, title, description, github_url, demo_url, tech_stack AS "techStack", thumbnail FROM projects WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).send('프로젝트를 찾을 수 없습니다.');
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error('❌ 프로젝트 개별 불러오기 실패:', err);
    res.status(500).send('DB 오류 발생');
  }
});


// 3. 프로젝트 추가 (POST /api/projects) - 기존 코드
app.post('/api/projects', async (req, res) => {
  try {
    const { title, description, techStack, githubUrl, demoUrl, thumbnail } = req.body;
    await pool.query(
      `INSERT INTO projects (title, description, tech_stack, github_url, demo_url, thumbnail)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [title, description, techStack, githubUrl, demoUrl, thumbnail]
    );
    res.status(201).send('프로젝트 추가 완료!');
  } catch (err) {
    console.error('❌ 프로젝트 추가 실패:', err);
    res.status(500).send('DB 오류 발생');
  }
});

// 4. 프로젝트 수정 (PUT /api/projects/:id) - 추가됨
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, techStack, githubUrl, demoUrl, thumbnail } = req.body;

    const result = await pool.query(
      `UPDATE projects 
       SET title = $1, description = $2, tech_stack = $3, github_url = $4, demo_url = $5, thumbnail = $6
       WHERE id = $7 RETURNING id`,
      [title, description, techStack, githubUrl, demoUrl, thumbnail, id]
    );

    if (result.rows.length === 0) {
      res.status(404).send('수정할 프로젝트를 찾을 수 없습니다.');
    } else {
      res.send('프로젝트 수정 완료!');
    }
  } catch (err) {
    console.error('❌ 프로젝트 수정 실패:', err);
    res.status(500).send('DB 오류 발생');
  }
});

// 5. 프로젝트 삭제 (DELETE /api/projects/:id) - 추가됨
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
        
    if (result.rows.length === 0) {
      res.status(404).send('삭제할 프로젝트를 찾을 수 없습니다.');
    } else {
      res.send('프로젝트 삭제 완료!');
    }
  } catch (err) {
    console.error('❌ 프로젝트 삭제 실패:', err);
    res.status(500).send('DB 오류 발생');
  }
});


// ====================== 방명록 API (CRUD) ======================

// 1. 방명록 목록 (GET /api/guestbooks) - 수정됨: 비밀번호 제외 및 별칭 통일
app.get('/api/guestbooks', async (req, res) => {
  try {
    // 🚨 핵심: DB 컬럼 이름을 프론트엔드(index.html, admin.js)가 기대하는 키 이름으로 별칭 지정.
    // 또한, 암호(password)는 제외합니다.
    const result = await pool.query(
      'SELECT id, author_name, content, created_date AS created FROM guestbooks ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ 방명록 목록 불러오기 실패:', err);
    res.status(500).send('DB 오류 발생');
  }
});
// 2. 방명록 추가 (POST /api/guestbooks) - 기존 코드
app.post('/api/guestbooks', async (req, res) => {
    // 1. 라우터 진입 디버깅 로그
    console.log('✨ [DEBUG] /api/guestbooks POST 라우터 진입 성공!'); 

    try {
        // 🚨 script.js가 보낸 키(key)와 정확히 일치하는 변수명을 사용합니다.
        const { author_name, content, password } = req.body; 

        // 2. 받은 데이터 디버깅 로그
        console.log('받은 방명록 데이터:', { author_name, content, password }); 

        // 데이터 누락 시 400 Bad Request 반환 (DB 오류 전에 먼저 처리)
        if (!author_name || !content || !password) {
            return res.status(400).send('필수 입력값(이름, 내용, 비밀번호)이 누락되었습니다.');
        }

        await pool.query(
              // DB 컬럼 이름과 매개변수 순서 확인
              'INSERT INTO guestbooks (author_name, content, password, created_date) VALUES ($1, $2, $3, NOW())',
              [author_name, content, password] 
        );
        // 3. 성공 응답
        res.status(201).send('방명록 추가 완료!');
    } catch (err) {
        // 4. DB 오류 상세 로그
        console.error('❌ 방명록 추가 실패 - 상세 오류:', err.stack || err); 
        // 클라이언트에 실패 응답
        res.status(500).send('서버에서 DB 오류가 발생했습니다. 자세한 내용은 서버 로그를 확인하세요.');
    }
});

// 3. 방명록 삭제 (DELETE /api/guestbooks/:id) - 추가됨
app.delete('/api/guestbooks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM guestbooks WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).send('삭제할 방명록을 찾을 수 없습니다.');
    } else {
      res.send('방명록 삭제 완료!');
    }
  } catch (err) {
    console.error('❌ 방명록 삭제 실패:', err);
    res.status(500).send('DB 오류 발생');
  }
});


// ------------------- 서버 시작 + 테이블 생성 -------------------
const port = process.env.PORT || 3000;
app.listen(port, async () => {
  console.log(`✅ Server running on port ${port}`);
  await createTables(); // 서버 시작 시 테이블 생성
});