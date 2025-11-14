let deleteTarget = null;  // 삭제할 대상 ID 저장
let deleteType = '';      // 'project' 또는 'guestbook'

// 페이지 로드 시 자동 실행
document.addEventListener('DOMContentLoaded', function() {
    loadProjectsAdmin();    // 프로젝트 목록 불러오기
    loadGuestbooksAdmin();  // 방명록 목록 불러오기

    // 프로젝트 폼 제출 이벤트 연결
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', saveProject);
    }

    // 썸네일 미리보기 이벤트 (통합, 안전 처리)
    const thumbnailInput = document.getElementById('projectThumbnail');
    const thumbnailPreview = document.getElementById('thumbnailPreview');

    if (thumbnailInput && thumbnailPreview) {
        let debounceTimeout;

        // 이미지 로딩 실패 시 숨기기
        thumbnailPreview.onerror = () => {
            thumbnailPreview.style.display = 'none';
        };

        // 입력 이벤트 처리 (debounce)
        thumbnailInput.addEventListener('input', () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                const url = thumbnailInput.value.trim();
                if (url) {
                    thumbnailPreview.src = url;
                    thumbnailPreview.style.display = 'block';
                } else {
                    thumbnailPreview.src = '';
                    thumbnailPreview.style.display = 'none';
                }
            }, 300); // 300ms 대기 후 갱신
        });
    }
});

// =========================================================
// 탭 관리 함수
// =========================================================
function switchTab(tabName) {
    closeProjectModal();
    
    const tabBtns = document.querySelectorAll('.tab-btn');
    const projectsTab = document.getElementById('projects-tab');
    const guestbookTab = document.getElementById('guestbook-tab');
    
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
async function loadProjectsAdmin() {
    try {
        const response = await fetch('/api/projects');
        const projects = await response.json();
        
        document.getElementById('totalProjects').textContent = projects.length;
        
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
                <img src="${project.thumbnail || ''}" alt="프로젝트 썸네일" style="max-width:150px; max-height:100px;">
                <div class="project-item-actions">
                    <button class="btn btn-edit" onclick="editProject(${project.id})">수정</button>
                    <button class="btn btn-delete" onclick="deleteProject(${project.id})">삭제</button>
                </div>
            </div>
        `;
    }).join('');
}

function openProjectModal(projectId = null) {
    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('projectForm');
    const preview = document.getElementById('thumbnailPreview');

    if (projectId) {
        modalTitle.textContent = '프로젝트 수정';
        loadProjectData(projectId);
    } else {
        modalTitle.textContent = '프로젝트 추가';
        form.reset();
        document.getElementById('projectId').value = '';
        preview.style.display = 'none';
    }

    modal.style.display = 'flex';
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    modal.style.display = 'none';
    document.getElementById('projectForm').reset();
}

async function loadProjectData(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}`);
        const project = await response.json();

        document.getElementById('projectId').value = project.id;
        document.getElementById('projectTitle').value = project.title || '';
        document.getElementById('projectDesc').value = project.description || '';
        document.getElementById('projectTech').value = project.techStack || '';
        document.getElementById('projectGithub').value = project.githubUrl || '';
        document.getElementById('projectDemo').value = project.demoUrl || '';
        document.getElementById('projectThumbnail').value = project.thumbnail || '';

        const preview = document.getElementById('thumbnailPreview');
        if (project.thumbnail) {
            preview.src = project.thumbnail;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    } catch (error) {
        console.error('프로젝트 데이터 불러오기 실패:', error);
        alert('프로젝트 정보를 불러오는데 실패했어요 😢');
    }
}

async function saveProject(e) {
    e.preventDefault();
    
    const projectId = document.getElementById('projectId').value;
    const thumbnailUrl = document.getElementById('projectThumbnail').value.trim();
    const preview = document.getElementById('thumbnailPreview');

    if (thumbnailUrl) {
        preview.src = thumbnailUrl;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }

    const projectData = {
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDesc').value,
        techStack: document.getElementById('projectTech').value,
        githubUrl: document.getElementById('projectGithub').value,
        demoUrl: document.getElementById('projectDemo').value,
        thumbnail: thumbnailUrl
    };

    try {
        const url = projectId ? `/api/projects/${projectId}` : '/api/projects';
        const method = projectId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });

        if (response.ok) {
            alert(projectId ? '프로젝트가 수정되었습니다! ✨' : '프로젝트가 추가되었습니다! 🎉');
            closeProjectModal();
            loadProjectsAdmin();
        } else {
            const errorText = await response.text();
            alert(`프로젝트 저장에 실패했어요. (에러: ${errorText.substring(0, 50)}...)`);
        }
    } catch (error) {
        console.error('프로젝트 저장 실패:', error);
        alert('오류가 발생했어요. 네트워크를 확인해주세요.');
    }
}

function editProject(projectId) {
    openProjectModal(projectId);
}

function deleteProject(projectId) {
    deleteTarget = projectId;
    deleteType = 'project';
    document.getElementById('deleteMessage').textContent = '삭제된 프로젝트는 복구할 수 없습니다.';
    document.getElementById('deleteModal').style.display = 'flex';
}

// =========================================================
// 방명록 관리 로직
// =========================================================
async function loadGuestbooksAdmin() {
    try {
        const response = await fetch('/api/guestbooks');
        const guestbooks = await response.json();

        document.getElementById('totalGuestbooks').textContent = guestbooks.length;

        const today = new Date().toDateString();
        const todayCount = guestbooks.filter(gb => 
            gb.created && new Date(gb.created).toDateString() === today
        ).length;
        document.getElementById('todayGuestbooks').textContent = todayCount;

        displayGuestbooksAdmin(guestbooks);
    } catch (error) {
        console.error('방명록 불러오기 실패:', error);
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

    tbody.innerHTML = guestbooks.map((gb, index) => 
        `<tr>
            <td>${guestbooks.length - index}</td>
            <td>${escapeHtml(gb.author_name)}</td>
            <td>${escapeHtml(gb.content)}</td>
            <td>${formatDateKST(gb.created)}</td>
            <td>
                <button class="btn btn-delete" onclick="deleteGuestbook(${gb.id})">삭제</button>
            </td>
        </tr>` 
    ).join('');
}

function deleteGuestbook(guestbookId) {
    deleteTarget = guestbookId;
    deleteType = 'guestbook';
    document.getElementById('deleteMessage').textContent = '삭제된 방명록은 복구할 수 없습니다.';
    document.getElementById('deleteModal').style.display = 'flex';
}

// =========================================================
// 공통 함수
// =========================================================
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    deleteTarget = null;
    deleteType = '';
}

async function confirmDelete() {
    if (!deleteTarget || !deleteType) return;
    
    try {
        const url = deleteType === 'project' 
            ? `/api/projects/${deleteTarget}` 
            : `/api/guestbooks/${deleteTarget}`;

        const response = await fetch(url, { method: 'DELETE' });

        if (response.ok) {
            alert('삭제되었습니다! ✅');
            closeDeleteModal();
            if (deleteType === 'project') loadProjectsAdmin();
            else loadGuestbooksAdmin();
        } else {
            alert('삭제에 실패했어요 😢');
        }
    } catch (error) {
        console.error('삭제 실패:', error);
        alert('오류가 발생했어요 😢');
    }
}

function formatDateKST(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    
    // UTC → KST 변환 (UTC +9)
    const kstTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    const year = kstTime.getFullYear();
    const month = String(kstTime.getMonth() + 1).padStart(2, '0');
    const day = String(kstTime.getDate()).padStart(2, '0');
    const hours = String(kstTime.getHours()).padStart(2, '0');
    const minutes = String(kstTime.getMinutes()).padStart(2, '0');

    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
