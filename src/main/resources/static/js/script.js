// ===== 메인 페이지 JavaScript - 프론트엔드 로직임 =====

// 페이지가 로드되면 자동으로 실행되는 함수이다...
document.addEventListener('DOMContentLoaded', function() {
    loadProjects();  // 프로젝트 목록 불러오기
    loadGuestbooks();  // 방명록 목록 불러오기
    
    // 방명록 폼 제출 이벤트 연결
    const guestbookForm = document.getElementById('guestbookForm');
    if (guestbookForm) {
        guestbookForm.addEventListener('submit', submitGuestbook);
    }
    
    addScrollAnimation();  // 스크롤 애니메이션 추가
});

// ===== 프로젝트 목록 불러오기 =====
// 백엔드 API에서 프로젝트 데이터를 가져와서 화면에 보여쥬
async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        displayProjects(projects);
    } catch (error) {
        console.error('프로젝트 불러오기 실패:', error);
        const grid = document.getElementById('portfolio-grid');
        grid.innerHTML = '<p class="loading-message">프로젝트를 불러오는 중 오류가 발생했어요</p>';
    }
}

// ===== 프로젝트를 화면에 표시하기 =====
// 받아온 프로젝트 데이터를 카드형태로 보여주
function displayProjects(projects) {
    const grid = document.getElementById('portfolio-grid');
    
    // 프로젝트가 하나도 없으면 빈 메시지 표시
    if (!projects || projects.length === 0) {
        grid.innerHTML = '<p class="empty-message">아직 등록된 프로젝트가 없어요</p>';
        return;
    }
    
    // 프로젝트마다 카드 HTML 만들기
    grid.innerHTML = projects.map(project => {
        // 기술 스택을 쉼표로 나눠서 태그로 만든당
        const techTags = project.techStack.split(',').map(tech =>
            `<span class="tech-tag">${tech.trim()}</span>`
        ).join('');
        
        return `
            <div class="project-card">
                <div class="card-header">
                    <h3>${project.title}</h3>
                </div>
                <div class="card-body">
                    <p class="project-desc">${project.description}</p>
                    <div class="tech-stack">
                        ${techTags}
                    </div>
                </div>
                <div class="card-footer">
                    ${project.githubUrl ? 
                        `<a href="${project.githubUrl}" target="_blank" class="btn btn-github">GitHub</a>` 
                        : ''}
                    ${project.demoUrl ? 
                        `<a href="${project.demoUrl}" target="_blank" class="btn btn-demo">Demo</a>` 
                        : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ===== 방명록 목록 불러오기 =====
// 백엔드에서 방명록 데이터를 가져옴
async function loadGuestbooks() {
    try {
        const response = await fetch('/api/guestbooks');
        const guestbooks = await response.json();
        displayGuestbooks(guestbooks);
    } catch (error) {
        console.error('방명록 불러오기 실패:', error);
    }
}

// ===== 방명록을 화면에 표시하기 =====
// 받아온 방명록 데이터를 리스트로 보여줘
function displayGuestbooks(guestbooks) {
    const list = document.getElementById('guestbookList');
    
    // 방명록이 없으면 빈 메시지 표시
    if (!guestbooks || guestbooks.length === 0) {
        list.innerHTML = '<p class="empty-message">아직 방명록이 없어요. 첫 번째 방명록의 주인공이 되어주세요! 🎉</p>';
        return;
    }
    
    // 방명록 아이템마다 HTML 만들기
    list.innerHTML = guestbooks.map(gb => `
        <div class="guestbook-item">
            <div class="guestbook-header">
                <span class="guestbook-name">${gb.author_name}</span>
                <span class="guestbook-date">${formatDate(gb.created)}</span>
            </div>
            <div class="guestbook-message">${escapeHtml(gb.content)}</div>
        </div>
    `).join('');
}

// ===== 방명록 작성하기 =====
// 폼에 입력한 내용을 백엔드로 전송해서 저장함긔
async function submitGuestbook(e) {
    e.preventDefault();  // 폼 기본 동작(페이지 새로고침) 막기
    
    const name = document.getElementById('name').value;
    const message = document.getElementById('message').value;
    
    // 입력값 검증
    if (!name.trim() || !message.trim()) {
        alert('이름과 메시지를 모두 입력해주세요!');
        return;
    }
    
    try {
        const response = await fetch('/api/guestbooks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ author_name: name, content: message, password: 'dummy' })
        });
        
        if (response.ok) {
            alert('방명록이 등록되었습니다! 감사합니다 💖');
            document.getElementById('guestbookForm').reset();  // 폼 초기화
            loadGuestbooks();  // 방명록 목록 다시 불러오기
        } else {
            alert('방명록 등록에 실패했어요. 다시 시도해주세요.');
        }
    } catch (error) {
        console.error('방명록 등록 실패:', error);
        alert('오류가 발생했어요.');
    }
}

// ===== 날짜 포맷 함수 =====
// 날짜를 "2025년 10월 15일 22:30" 머이런 타임스탬프 형식으로 바꿔준다!!
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
}

// ===== HTML 이스케이프 함수 =====
// XSS 공격 방지를 위해 특수문자를 안전하게 변환함 아휴
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== 스크롤 애니메이션 추가 =====
// 스크롤하면 부드럽게 나타나유
function addScrollAnimation() {
    const sections = document.querySelectorAll('.section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1  // 10%만 보여도 애니메이션 시작함
    });
    
    // 각 섹션에 초기 스타일과 옵저버 적용
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// ===== 네비게이션 부드러운 스크롤 =====
// 메뉴 클릭하면 해당 섹션으로 부드럽게 이동
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',  // 부드럽게 스크롤
                block: 'start'
            });
        }
    });
});
