package com.portfolio.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

// 프로젝트 엔티티 - 데이터베이스 테이블과 매핑되는 클래스예여 알몸인거져
@Entity
@Table(name = "projects")
public class Project {
    
    // 기본키 (자동 증가)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // 프로젝트 제목
    @Column(nullable = false, length = 200)
    private String title;
    
    // 프로젝트 설명
    @Column(nullable = false, length = 1000)
    private String description;
    
    // 기술 스택 (쉼표로 구분)
    @Column(nullable = false, length = 500)
    private String techStack;
    
    // GitHub 주소
    @Column(length = 500)
    private String githubUrl;
    
    // Demo 주소
    @Column(length = 500)
    private String demoUrl;
    
    // 생성 날짜
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // 수정 날짜
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // 엔티티 저장 전 자동으로 실행 - 생성일 설정
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    // 엔티티 업데이트 전 자동으로 실행 - 수정일 갱신
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // 기본 생성자 (JPA가 필요로 함)
    public Project() {}
    
    // 생성자
    public Project(String title, String description, String techStack, String githubUrl, String demoUrl) {
        this.title = title;
        this.description = description;
        this.techStack = techStack;
        this.githubUrl = githubUrl;
        this.demoUrl = demoUrl;
    }
    
    // Getter와 Setter들
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getTechStack() {
        return techStack;
    }
    
    public void setTechStack(String techStack) {
        this.techStack = techStack;
    }
    
    public String getGithubUrl() {
        return githubUrl;
    }
    
    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }
    
    public String getDemoUrl() {
        return demoUrl;
    }
    
    public void setDemoUrl(String demoUrl) {
        this.demoUrl = demoUrl;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

