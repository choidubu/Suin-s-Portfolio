// ===== 관리자 페이지 JavaScript - 프로젝트와 방명록 관리! =====

let deleteTarget = null;  // 삭제할 대상 정보 저장
let deleteType = '';  // 'project' 또는 'guestbook'

// 페이지 로드되면 실행
document.addEventListener('DOMContentLoaded', function() {
    loadProjectsAdmin();  // 프로젝트 목록 불러오기
    loadGuestbooksAdmin();  // 방명록 목록 불러오기
    
    // 프로젝트 폼 제출 이벤트
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', saveProject);
    }
});

// ===== 탭 전환 함수 =====
// 프로젝트 관리와 방명록 관리 탭을 전환
function switchTab(tabName) {
    // 모든 탭 버튼과 섹션 가져옴
    const tabBtns = document.querySelectorAll('.tab-btn');
    const projectsTab = document.getElementById('projects-tab');
    const guestbookTab = document.getElementById('guestbook-tab');
    
    // 모든 탭 버튼의 active 클래스 제거함
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    if (tabName === 'projects') {
        // 프로젝트 탭 활성화
        tabBtns[0].classList.add('active');
        projectsTab.style.display = 'block';
        guestbookTab.style.display = 'none';
    } else if (tabName === 'guestbook') {
        // 방명록 탭 활성화
        tabBtns[1].classList.add('active');
        projectsTab.style.display = 'none';
        guestbookTab.style.display = 'block';
    }
}

// ===== 프로젝트 목록 불러오기 (관리자용) =====
async function loadProjectsAdmin() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        
        // 통계 업데이트한다
        document.getElementById('totalProjects').textContent = projects.length;
        
        // 최근 한 달 내 추가된 프로젝트 개수
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const recentCount = projects.filter(p =>
            new Date(p.createdAt) > oneMonthAgo
        ).length;
        document.getElementById('recentProjects').textContent = recentCount;
        
        displayProjectsAdmin(projects);
    } catch (error) {
        console.error('프로젝트 불러오기 실패:', error);
    }
}

// ===== 프로젝트 목록 표시 (관리자용) =====
function displayProjectsAdmin(projects) {
    const list = document.getElementById('projectListAdmin');

    // 데이터 없으면 안내문
    if (!projects || projects.length === 0) {
        list.innerHTML = '<p class="loading-text">아직 프로젝트가 없어요. 첫 프로젝트를 추가해보세요! ➕</p>';
        return;
    }

    // 프로젝트 리스트 출력
    list.innerHTML = projects.map(project => {
        // techStack이 없을 수도 있으므로 안전하게 처리
        const techTags = (project.techStack || '').split(',')
            .map(tech => `<span class="tech-tag">${tech.trim()}</span>`)
            .join('');

        // 각 필드도 안전하게 확인
        const title = project.title || '(제목 없음)';
        const description = project.description || '(설명 없음)';
        
        return `
            <div class="project-item-admin">
                <h4 class="project-item-header">${title}</h4>
                <p class="project-item-desc">${description}</p>
                <div class="project-item-tech">${techTags}</div>
                <div class="project-item-actions">
                    <button class="btn btn-edit" onclick="editProject(${project.id})">
                        수정
                    </button>
                    <button class="btn btn-delete" onclick="deleteProject(${project.id})">
                        삭제
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ===== 프로젝트 추가 모달 열기 ================
function openProjectModal(projectId = null) {
    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('projectForm');
    
    if (projectId) {
        // 수정 모드
        modalTitle.textContent = '프로젝트 수정';
        loadProjectData(projectId);
    } else {
        // 추가 모드
        modalTitle.textContent = '프로젝트 추가';
        form.reset();
        document.getElementById('projectId').value = '';
    }
    
    modal.style.display = 'flex';
}

// ===== 프로젝트 추가 모달 닫기 =====
function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    modal.style.display = 'none';
    document.getElementById('projectForm').reset();
}

// ===== 프로젝트 데이터 불러오기 (수정용) ===
async function loadProjectData(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}`);
        const project = await response.json();
        
        // 폼에 데이터 채우기
        document.getElementById('projectId').value = project.id;
        document.getElementById('projectTitle').value = project.title;
        document.getElementById('projectDesc').value = project.description;
        document.getElementById('projectTech').value = project.techStack;
        document.getElementById('projectGithub').value = project.githubUrl || '';
        document.getElementById('projectDemo').value = project.demoUrl || '';
        // 🚨 수정: 썸네일 URL을 모달 폼에 채워넣는 코드 추가
        document.getElementById('projectThumbnail').value = project.thumbnail || ''; 
    } catch (error) {
        console.error('프로젝트 데이터 불러오기 실패:', error);
        alert('프로젝트 정보를 불러오는데 실패했어요 😢');
    }
}