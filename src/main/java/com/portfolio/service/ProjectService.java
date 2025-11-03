package com.portfolio.service;

import com.portfolio.entity.Project;
import com.portfolio.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

// 프로젝트 서비스 - 비즈니스 로직을 처리하는 곳이여
@Service
@Transactional
public class ProjectService {
    
    private final ProjectRepository projectRepository;
    
    // 생성자 주입 방식 (권장되는 방식임 이건)
    @Autowired
    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }
    
    // 모든 프로젝트 조회 (최신순)
    public List<Project> getAllProjects() {
        return projectRepository.findAllByOrderByCreatedAtDesc();
    }
    
    // 특정 프로젝트 조회
    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }
    
    // 프로젝트 생성
    public Project createProject(Project project) {
        return projectRepository.save(project);
    }
    
    // 프로젝트 수정
    public Project updateProject(Long id, Project projectDetails) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다: " + id));
        
        // 수정할 내용 업데이트
        project.setTitle(projectDetails.getTitle());
        project.setDescription(projectDetails.getDescription());
        project.setTechStack(projectDetails.getTechStack());
        project.setGithubUrl(projectDetails.getGithubUrl());
        project.setDemoUrl(projectDetails.getDemoUrl());
        
        return projectRepository.save(project);
    }
    
    // 프로젝트 삭제
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다: " + id));
        projectRepository.delete(project);
    }
    
    // 제목으로 검색
    public List<Project> searchByTitle(String title) {
        return projectRepository.findByTitleContaining(title);
    }
}
