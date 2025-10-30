package com.portfolio.repository;

import com.portfolio.entity.Guestbook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

// 방명록 레포지토리 - 방명록 데이터베이스 작업 처리
@Repository
public interface GuestbookRepository extends JpaRepository<Guestbook, Long> {
    
    // 생성일 기준 내림차순으로 전체 조회 (최신순)
    List<Guestbook> findAllByOrderByCreatedAtDesc();
    
    // 이름으로 검색
    List<Guestbook> findByNameContaining(String name);
}