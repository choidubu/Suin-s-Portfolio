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
            new Date(gb.created).toDateString() === today
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
            <td>${escapeHtml(gb.author_name)}</td>
            <td>${escapeHtml(gb.content)}</td>
            <td>${formatDate(gb.created)}</td>
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
    if (!dateString) return '날짜 정보 없음';

    const date = new Date(dateString);
    // Invalid Date일 경우 '날짜 오류' 반환 (NaN 오류 방지)
    if (isNaN(date.getTime())) {
        return '날짜 오류'; 
    }
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${hours}:${minutes}`;
}

// ===== HTML 이스케이프 함수 =====
function escapeHtml(text) {
    if (text === null || text === undefined) return ''; // Null/Undefined 방지
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}