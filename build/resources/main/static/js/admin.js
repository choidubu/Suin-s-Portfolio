let deleteTarget = null;  // 삭제할 대상 ID 저장
let deleteType = '';      // 'project' 또는 'guestbook'
let currentThumbnailBase64 = '';  // Base64 데이터 임시 저장
let isDeleting = false;  // 더블 클릭 방지 플래그

// 페이지 로드 시 자동 실행
document.addEventListener('DOMContentLoaded', function() {
    loadProjectsAdmin();    // 프로젝트 목록 불러오기
    loadGuestbooksAdmin();  // 방명록 목록 불러오기

    // 프로젝트 폼 제출 이벤트 연결
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', saveProject);
    }

    // 파일 선택 시 미리보기 + Base64 변환 + 압축!
    const thumbnailFileInput = document.getElementById('projectThumbnailFile');
    const thumbnailPreview = document.getElementById('thumbnailPreview');

    if (thumbnailFileInput && thumbnailPreview) {
        thumbnailFileInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            
            if (!file) {
                thumbnailPreview.style.display = 'none';
                currentThumbnailBase64 = '';
                return;
            }

            // 파일 크기 체크 (500KB 이하만 허용)
            if (file.size > 500 * 1024) {
                alert('이미지 크기는 500KB 이하여야 해요! 😅\n현재 크기: ' + (file.size / 1024).toFixed(0) + 'KB');
                thumbnailFileInput.value = '';
                thumbnailPreview.style.display = 'none';
                currentThumbnailBase64 = '';
                return;
            }

            // 이미지 타입 체크
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능해요! 📸');
                thumbnailFileInput.value = '';
                thumbnailPreview.style.display = 'none';
                currentThumbnailBase64 = '';
                return;
            }

            try {
                // 자동 압축!
                const compressedBlob = await compressImage(file);
                const base64 = await blobToBase64(compressedBlob);
                currentThumbnailBase64 = base64;
                
                // 미리보기 표시
                thumbnailPreview.src = base64;
                thumbnailPreview.style.display = 'block';
                
                console.log('원본:', (file.size / 1024).toFixed(0) + 'KB', '→ 압축:', (compressedBlob.size / 1024).toFixed(0) + 'KB');
            } catch (error) {
                console.error('이미지 변환 실패:', error);
                alert('이미지를 불러오는데 실패했어요 😢');
                thumbnailPreview.style.display = 'none';
                currentThumbnailBase64 = '';
            }
        });
    }
});

// 이미지 자동 압축 함수 - 800px 리사이즈 + JPEG 70% 품질
async function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // 최대 너비 800px로 리사이즈
                const maxWidth = 800;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // JPEG 70% 품질로 압축
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('이미지 압축 실패'));
                    }
                }, 'image/jpeg', 0.7);
            };
            
            img.onerror = () => reject(new Error('이미지 로드 실패'));
            img.src = e.target.result;
        };
        
        reader.onerror = () => reject(new Error('파일 읽기 실패'));
        reader.readAsDataURL(file);
    });
}

// Blob을 Base64로 변환
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Blob 변환 실패'));
        reader.readAsDataURL(blob);
    });
}

// 파일을 Base64로 변환하는 헬퍼 함수
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
            resolve(reader.result);  // data:image/jpeg;base64,/9j/4AAQ... 형식
        };
        
        reader.onerror = () => {
            reject(new Error('파일 읽기 실패'));
        };
        
        reader.readAsDataURL(file);  // Base64로 변환
    });
}

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
        
        // thumbnail이 Base64 데이터야! 그대로 img src에 넣으면 돼
        const thumbnailSrc = project.thumbnail || '';
        
        return `
            <div class="project-item-admin">
                <h4 class="project-item-header">${title}</h4>
                <p class="project-item-desc">${description}</p>
                <div class="project-item-tech">${techTags}</div>
                ${thumbnailSrc ? `<img src="${thumbnailSrc}" alt="프로젝트 썸네일" style="max-width:150px; max-height:100px; object-fit:cover; border-radius:4px;">` : ''}
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
    const fileInput = document.getElementById('projectThumbnailFile');

    if (projectId) {
        modalTitle.textContent = '프로젝트 수정';
        fileInput.removeAttribute('required');  // 수정 시에는 이미지 선택 안 해도 됨
        loadProjectData(projectId);
    } else {
        modalTitle.textContent = '프로젝트 추가';
        form.reset();
        document.getElementById('projectId').value = '';
        preview.style.display = 'none';
        currentThumbnailBase64 = '';
        fileInput.setAttribute('required', 'required');  // 추가 시에는 이미지 필수
    }

    modal.style.display = 'flex';
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    modal.style.display = 'none';
    document.getElementById('projectForm').reset();
    currentThumbnailBase64 = '';
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

        const preview = document.getElementById('thumbnailPreview');
        if (project.thumbnail) {
            // 기존 이미지가 있으면 미리보기 표시하고 Base64 저장
            preview.src = project.thumbnail;
            preview.style.display = 'block';
            currentThumbnailBase64 = project.thumbnail;
        } else {
            preview.style.display = 'none';
            currentThumbnailBase64 = '';
        }
    } catch (error) {
        console.error('프로젝트 데이터 불러오기 실패:', error);
        alert('프로젝트 정보를 불러오는데 실패했어요 😢');
    }
}

async function saveProject(e) {
    e.preventDefault();
    
    const projectId = document.getElementById('projectId').value;

    // 새 이미지를 선택하지 않았으면 기존 Base64 데이터 사용
    const finalThumbnail = currentThumbnailBase64;

    if (!finalThumbnail && !projectId) {
        // 새로 추가하는데 이미지가 없으면 에러
        alert('이미지를 선택해주세요! 📸');
        return;
    }

    const projectData = {
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDesc').value,
        techStack: document.getElementById('projectTech').value,
        githubUrl: document.getElementById('projectGithub').value,
        demoUrl: document.getElementById('projectDemo').value,
        thumbnail: finalThumbnail  // Base64 데이터 전송!
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

// 삭제 함수 - 더블 클릭 방지 + 204/404 처리!
async function confirmDelete() {
    if (!deleteTarget || !deleteType) return;
    
    // 이미 삭제 중이면 리턴!
    if (isDeleting) {
        console.log('⚠️ 이미 삭제 처리 중입니다...');
        return;
    }
    
    isDeleting = true;  // 플래그 설정
    console.log('🗑️ 삭제 시작:', deleteType, deleteTarget);
    
    try {
        const url = deleteType === 'project' 
            ? `/api/projects/${deleteTarget}` 
            : `/api/guestbooks/${deleteTarget}`;

        const response = await fetch(url, { method: 'DELETE' });
        console.log('📡 서버 응답:', response.status, response.statusText);

        // 204 No Content = 삭제 성공!
        if (response.status === 204 || response.ok) {
            alert('삭제되었습니다! ✅');
            closeDeleteModal();
            if (deleteType === 'project') loadProjectsAdmin();
            else loadGuestbooksAdmin();
        } 
        // 404 = 이미 삭제됨 (화면 새로고침)
        else if (response.status === 404) {
            alert('이미 삭제된 항목입니다 😅');
            closeDeleteModal();
            if (deleteType === 'project') loadProjectsAdmin();
            else loadGuestbooksAdmin();
        } 
        // 기타 에러
        else {
            alert('삭제에 실패했어요 😢\n상태 코드: ' + response.status);
        }
    } catch (error) {
        console.error('❌ 삭제 실패:', error);
        alert('오류가 발생했어요 😢\n' + error.message);
    } finally {
        isDeleting = false;  // 완료 후 플래그 해제
        console.log('✅ 삭제 처리 완료');
    }
}

// 한국 시간 포맷팅 함수
function formatDateKST(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}