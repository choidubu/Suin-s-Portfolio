// ===== 관리자 페이지 JavaScript - 프로젝트와 방명록 관리! =====

let deleteTarget = null;  // 삭제할 대상 정보 저장
let deleteType = '';  // 'project' 또는 'guestbook'

// 페이지 로드되면 실행
document.addEventListener('DOMContentLoaded', function() {
    loadProjectsAdmin();  // 프로젝트 목록 불러오기
    loadGuestbooksAdmin();  // 방명록 목록 불러오기
    
    // 프로젝트 폼 제출 이벤트
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', saveProject);
    }
});

// ===== 탭 전환 함수 =====
// 프로젝트 관리와 방명록 관리 탭을 전환행
function switchTab(tabName) {
    // 모든 탭 버튼과 섹션 가져옴
    const tabBtns = document.querySelectorAll('.tab-btn');
    const projectsTab = document.getElementById('projects-tab');
    const guestbookTab = document.getElementById('guestbook-tab');
    
    // 모든 탭 버튼의 active 클래스 제거함ㅋㅋ
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
    
    if (!projects || projects.length === 0) {
        list.innerHTML = '<p class="loading-text">아직 프로젝트가 없어요. 첫 프로젝트를 추가해보세요! ➕</p>';
        return;
    }
    
    list.innerHTML = projects.map(project => {
        const techTags = project.techStack.split(',').map(tech => 
            `<span class="tech-tag">${tech.trim()}</span>`
        ).join('');
        
        return `
            <div class="project-item-admin">
                <h4 class="project-item-header">${project.title}</h4>
                <p class="project-item-desc">${project.description}</p>
                <div class="project-item-tech">${techTags}</div>
                <div class="project-item-actions">
                    <button class="btn btn-edit" onclick="editProject(${project.id})">
                        ✏️ 수정
                    </button>
                    <button class="btn btn-delete" onclick="deleteProject(${project.id})">
                        🗑️ 삭제
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
        // 수정 모드(이수정아님)
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
    } catch (error) {
        console.error('프로젝트 데이터 불러오기 실패:', error);
        alert('프로젝트 정보를 불러오는데 실패했어요 😢');
    }
}

// ===== 프로젝트 저장하기 (추가/수정) =====
async function saveProject(e) {
    e.preventDefault();
    
    const projectId = document.getElementById('projectId').value;
    const projectData = {
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDesc').value,
        techStack: document.getElementById('projectTech').value,
        githubUrl: document.getElementById('projectGithub').value,
        demoUrl: document.getElementById('projectDemo').value
    };
    
    try {
        const url = projectId ? `/api/projects/${projectId}` : '/api/projects';
        const method = projectId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData)
        });
        
        if (response.ok) {
            alert(projectId ? '프로젝트가 수정되었습니다! ✨' : '프로젝트가 추가되었습니다! 🎉');
            closeProjectModal();
            loadProjectsAdmin();
        } else {
            alert('프로젝트 저장에 실패했어요ㅠㅠ');
        }
    } catch (error) {
        console.error('프로젝트 저장 실패:', error);
        alert('오류가 발생했어요ㅠㅠ');
    }
}

// ===== 프로젝트 수정 =====
function editProject(projectId) {
    openProjectModal(projectId);
}

// ===== 프로젝트 삭제 =====
function deleteProject(projectId) {
    deleteTarget = projectId;
    deleteType = 'project';
    document.getElementById('deleteMessage').textContent = '삭제된 프로젝트는 복구할 수 없습니다.';
    document.getElementById('deleteModal').style.display = 'flex';
}

// ===== 방명록 목록 불러오기 (관리자용) =====
async function loadGuestbooksAdmin() {
    try {
        const response = await fetch('/api/guestbooks');
        const guestbooks = await response.json();
        
        // 통계 업데이트
        document.getElementById('totalGuestbooks').textContent = guestbooks.length;
        
        // 오늘 등록된 방명록 개수
        const today = new Date().toDateString();
        const todayCount = guestbooks.filter(gb => 
            new Date(gb.createdAt).toDateString() === today
        ).length;
        document.getElementById('todayGuestbooks').textContent = todayCount;
        
        displayGuestbooksAdmin(guestbooks);
    } catch (error) {
        console.error('방명록 불러오기 실패:', error);
    }
}

// ===== 방명록 목록 표시 (관리자용) =====
function displayGuestbooksAdmin(guestbooks) {
    const tbody = document.getElementById('adminGuestbookList');
    
    if (!guestbooks || guestbooks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-cell">
                    아직 방명록이 없어요 📝
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = guestbooks.map((gb, index) => `
        <tr>
            <td>${guestbooks.length - index}</td>
            <td>${escapeHtml(gb.name)}</td>
            <td>${escapeHtml(gb.message)}</td>
            <td>${formatDate(gb.createdAt)}</td>
            <td>
                <button class="btn btn-delete" onclick="deleteGuestbook(${gb.id})">
                    삭제
                </button>
            </td>
        </tr>
    `).join('');
}

// ===== 방명록 삭제 =====
function deleteGuestbook(guestbookId) {
    deleteTarget = guestbookId;
    deleteType = 'guestbook';
    document.getElementById('deleteMessage').textContent = '삭제된 방명록은 복구할 수 없습니다.';
    document.getElementById('deleteModal').style.display = 'flex';
}

// ===== 삭제 확인 모달 닫기 =====
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    deleteTarget = null;
    deleteType = '';
}

// ===== 삭제 확인 =====
async function confirmDelete() {
    if (!deleteTarget || !deleteType) return;
    
    try {
        const url = deleteType === 'project' 
            ? `/api/projects/${deleteTarget}` 
            : `/api/guestbooks/${deleteTarget}`;
        
        const response = await fetch(url, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('삭제되었습니다! ✅');
            closeDeleteModal();
            
            // 목록 새로고침!!
            if (deleteType === 'project') {
                loadProjectsAdmin();
            } else {
                loadGuestbooksAdmin();
            }
        } else {
            alert('삭제에 실패했어요 😢');
        }
    } catch (error) {
        console.error('삭제 실패:', error);
        alert('오류가 발생했어요 😢');
    }
}

// ===== 날짜 포맷 함수 =====
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${hours}:${minutes}`;
}

// ===== HTML 이스케이프 함수 =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
