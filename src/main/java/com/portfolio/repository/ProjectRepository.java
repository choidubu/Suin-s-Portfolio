package com.portfolio.repository;

import com.portfolio.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

// 프로젝트 레포지토리 - 데이터베이스 작업을 처리해주는 인터페이스유
// JpaRepository를 상속받으면 기본 CRUD 메서드를 자동으로 사용할 수 있어
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    // 생성일 기준 내림차순으로 전체 조회 (최신순)
    List<Project> findAllByOrderByCreatedAtDesc();
    
    // 제목으로 검색
    List<Project> findByTitleContaining(String title);
}
