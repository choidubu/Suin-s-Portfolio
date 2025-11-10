// ===== 프로젝트 저장하기 (추가/수정) =====
async function saveProject(e) {
    e.preventDefault();
    
    const projectId = document.getElementById('projectId').value;
    
    // 🚨 썸네일 필드의 값을 가져와 projectData에 포함 (수정됨)
    const thumbnail = document.getElementById('projectThumbnail').value; 

    const projectData = {
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDesc').value,
        techStack: document.getElementById('projectTech').value,
        githubUrl: document.getElementById('projectGithub').value,
        demoUrl: document.getElementById('projectDemo').value,
        // 🚨 썸네일 데이터를 서버로 보낼 객체에 추가 (수정됨)
        thumbnail: thumbnail, 
    };
    
    try {
        const url = projectId ? `/api/projects/${projectId}` : '/api/projects';
        // 🚨 수정: 여기에서 중괄호를 제거하고 삼항 연산자를 완성합니다.
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
            alert('프로젝트 저장에 실패했어요.');
        }
    } catch (error) {
        console.error('프로젝트 저장 실패:', error);
        alert('오류가 발생했어요.');
    }
}