// ===== 관리자 페이지 JavaScript - 프로젝트와 방명록 관리! =====

let deleteTarget = null;  // 삭제할 대상 ID 저장
let deleteType = '';  // 'project' 또는 'guestbook'

// 페이지 로드되면 자동 실행
document.addEventListener('DOMContentLoaded', function() {
    loadProjectsAdmin();  // 프로젝트 목록 불러오기
    loadGuestbooksAdmin();  // 방명록 목록 불러오기
    
    // 프로젝트 폼 제출 이벤트 연결
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', saveProject);
    }
});

// =========================================================
// 탭 관리 함수
// =========================================================

/**
 * 탭 전환 함수
 * @param {string} tabName 'projects' 또는 'guestbook'
 */
function switchTab(tabName) {
    // 탭 전환 전 프로젝트 모달 닫음
    closeProjectModal();
    
    const tabBtns = document.querySelectorAll('.tab-btn');
    const projectsTab = document.getElementById('projects-tab');
    const guestbookTab = document.getElementById('guestbook-tab');
    
    // 모든 탭 버튼과 섹션 상태 초기화
    tabBtns.forEach(btn => btn.classList.remove('active'));
    projectsTab.style.display = 'none';
    guestbookTab.style.display = 'none';
    
    if (tabName === 'projects') {
        document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
        projectsTab.style.display = 'block';
    } else if (tabName === 'guestbook') {
        document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        guestbookTab.style.display = 'block';
    }
}

// =========================================================
// 프로젝트 관리 로직
// =========================================================

/**
 * 프로젝트 목록 불러오기 (관리자용)
 */
async function loadProjectsAdmin() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        
        // 통계 업데이트
        document.getElementById('totalProjects').textContent = projects.length;
        
        // 최근 한 달 내 추가된 프로젝트 개수 (createdAt 필드 사용 가정)
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const recentCount = projects.filter(p =>
            p.createdAt && new Date(p.createdAt) > oneMonthAgo
        ).length;
        document.getElementById('recentProjects').textContent = recentCount;
        
        displayProjectsAdmin(projects);
    } catch (error) {
        console.error('프로젝트 불러오기 실패:', error);
    }
}

/**
 * 프로젝트 목록 표시 (관리자용)
 * @param {Array<Object>} projects - 프로젝트 데이터 배열
 */
function displayProjectsAdmin(projects) {
    const list = document.getElementById('projectListAdmin');

    if (!projects || projects.length === 0) {
        list.innerHTML = '<p class="loading-text">아직 프로젝트가 없어요. 첫 프로젝트를 추가해보세요! ➕</p>';
        return;
    }

    list.innerHTML = projects.map(project => {
        const techTags = (project.techStack || '').split(',')
            .map(tech => `<span class="tech-tag">${tech.trim()}</span>`)
            .join('');

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

/**
 * 프로젝트 추가/수정 모달 열기
 * @param {number|null} projectId - 수정할 프로젝트 ID (추가 시 null)
 */
function openProjectModal(projectId = null) {
    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('projectForm');
    
    if (projectId) {
        modalTitle.textContent = '프로젝트 수정';
        loadProjectData(projectId);
    } else {
        modalTitle.textContent = '프로젝트 추가';
        form.reset();
        document.getElementById('projectId').value = '';
    }
    
    modal.style.display = 'flex';
}

/**
 * 프로젝트 추가 모달 닫기
 */
function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    modal.style.display = 'none';
    document.getElementById('projectForm').reset();
}

/**
 * 프로젝트 데이터 불러오기 (수정용)
 * @param {number} projectId
 */
async function loadProjectData(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}`);
        const project = await response.json();
        
        // 폼에 데이터 채우기
        document.getElementById('projectId').value = project.id;
        document.getElementById('projectTitle').value = project.title || '';
        document.getElementById('projectDesc').value = project.description || '';
        document.getElementById('projectTech').value = project.techStack || '';
        document.getElementById('projectGithub').value = project.githubUrl || '';
        document.getElementById('projectDemo').value = project.demoUrl || '';
        // ⭐ 이미지 URL 필드: 백엔드에서 thumbnail 필드를 사용한다고 가정
        document.getElementById('projectThumbnail').value = project.thumbnail || ''; 
    } catch (error) {
        console.error('프로젝트 데이터 불러오기 실패:', error);
        alert('프로젝트 정보를 불러오는데 실패했어요 😢');
    }
}

/**
 * 프로젝트 저장하기 (추가/수정)
 * @param {Event} e 
 */
async function saveProject(e) {
    e.preventDefault();
    
    const projectId = document.getElementById('projectId').value;
    
    const projectData = {
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDesc').value,
        techStack: document.getElementById('projectTech').value,
        githubUrl: document.getElementById('projectGithub').value,
        demoUrl: document.getElementById('projectDemo').value,
        // ⭐ 이미지 URL 필드 전송
        thumbnail: document.getElementById('projectThumbnail').value, 
    };
    
    try {
        // ⭐ 템플릿 리터럴 사용
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
            // 서버에서 에러 메시지를 JSON으로 반환하면 받아와서 표시
            const errorText = await response.text(); 
            alert(`프로젝트 저장에 실패했어요. (에러: ${errorText.substring(0, 50)}...)`);
        }
    } catch (error) {
        console.error('프로젝트 저장 실패:', error);
        alert('오류가 발생했어요. 네트워크를 확인해주세요.');
    }
}

/**
 * 프로젝트 수정 버튼 클릭 이벤트
 * @param {number} projectId
 */
function editProject(projectId) {
    openProjectModal(projectId);
}

/**
 * 프로젝트 삭제 확인 모달 열기
 * @param {number} projectId
 */
function deleteProject(projectId) {
    deleteTarget = projectId;
    deleteType = 'project';
    document.getElementById('deleteMessage').textContent = '삭제된 프로젝트는 복구할 수 없습니다.';
    document.getElementById('deleteModal').style.display = 'flex';
}

// =========================================================
// 방명록 관리 로직
// =========================================================

/**
 * 방명록 목록 불러오기 (관리자용)
 */
async function loadGuestbooksAdmin() {
    try {
        const response = await fetch('/api/guestbooks');
        const guestbooks = await response.json();
        
        // 통계 업데이트
        document.getElementById('totalGuestbooks').textContent = guestbooks.length;
        
        // 오늘 등록된 방명록 개수
        const today = new Date().toDateString();
        const todayCount = guestbooks.filter(gb => 
            gb.created && new Date(gb.created).toDateString() === today
        ).length;
        document.getElementById('todayGuestbooks').textContent = todayCount;
        
        displayGuestbooksAdmin(guestbooks);
    } catch (error) {
        console.error('방명록 불러오기 실패:', error);
        // ⭐ 500 에러 발생 시 사용자에게 안내
        const tbody = document.getElementById('adminGuestbookList');
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="error-cell">
                    ⚠️ 서버 오류(500)로 인해 방명록을 불러올 수 없습니다. 서버 로그를 확인하세요.
                </td>
            </tr>
        `;
    }
}

/**
 * 방명록 목록 표시 (관리자용) - 템플릿 리터럴 문법 오류 수정 완료
 * @param {Array<Object>} guestbooks
 */
function displayGuestbooksAdmin(guestbooks) {
    const tbody = document.getElementById('adminGuestbookList');
    
    if (!guestbooks || guestbooks.length === 0) {
        // ⭐ 백틱을 사용한 HTML 템플릿
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-cell">
                    아직 방명록이 없어요 📝
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = guestbooks.map((gb, index) => 
        // ⭐ 백틱을 사용한 HTML 템플릿
        `<tr>
            <td>${guestbooks.length - index}</td>
            <td>${escapeHtml(gb.author_name)}</td>
            <td>${escapeHtml(gb.content)}</td>
            <td>${formatDate(gb.created)}</td>
            <td>
                <button class="btn btn-delete" onclick="deleteGuestbook(${gb.id})">
                    삭제
                </button>
            </td>
        </tr>`
    ).join('');
}

/**
 * 방명록 삭제 확인 모달 열기
 * @param {number} guestbookId
 */
function deleteGuestbook(guestbookId) {
    deleteTarget = guestbookId;
    deleteType = 'guestbook';
    document.getElementById('deleteMessage').textContent = '삭제된 방명록은 복구할 수 없습니다.';
    document.getElementById('deleteModal').style.display = 'flex';
}

// =========================================================
// 공통 함수
// =========================================================

/**
 * 삭제 확인 모달 닫기
 */
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    deleteTarget = null;
    deleteType = '';
}

/**
 * 삭제 확인 및 실행 - 템플릿 리터럴 문법 오류 수정 완료
 */
async function confirmDelete() {
    if (!deleteTarget || !deleteType) return;
    
    try {
        // ⭐ 백틱을 사용한 템플릿 문자열로 URL 구성
        const url = deleteType === 'project' 
            ? `/api/projects/${deleteTarget}` 
            : `/api/guestbooks/${deleteTarget}`;
        
        const response = await fetch(url, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('삭제되었습니다! ✅');
            closeDeleteModal();
            
            // 목록 새로고침
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

/**
 * 날짜 포맷 함수 (YYYY-MM-DD HH:MM 형식) - 안전성 강화
 * @param {string} dateString
 */
function formatDate(dateString) {
    if (!dateString) return '날짜 정보 없음';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return '날짜 오류'; 
    }
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    // ⭐ 깔끔한 포맷
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${hours}:${minutes}`;
}

/**
 * HTML 이스케이프 함수 (XSS 방지) - 안정성 강화
 * @param {string} text
 */
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}