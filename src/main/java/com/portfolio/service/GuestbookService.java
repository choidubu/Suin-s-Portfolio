package com.portfolio.service;

import com.portfolio.entity.Guestbook;
import com.portfolio.repository.GuestbookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

// 방명록 서비스 - 방명록 관련 비즈니스 로직 처리한다
@Service
@Transactional
public class GuestbookService {
    
    private final GuestbookRepository guestbookRepository;
    
    // 생성자 주입
    @Autowired
    public GuestbookService(GuestbookRepository guestbookRepository) {
        this.guestbookRepository = guestbookRepository;
    }
    
    // 모든 방명록 조회 (최신순)
    public List<Guestbook> getAllGuestbooks() {
        return guestbookRepository.findAllByOrderByCreatedAtDesc();
    }
    
    // 특정 방명록 조회
    public Optional<Guestbook> getGuestbookById(Long id) {
        return guestbookRepository.findById(id);
    }
    
    // 방명록 생성
    public Guestbook createGuestbook(Guestbook guestbook) {
        return guestbookRepository.save(guestbook);
    }
    
    // 방명록 삭제
    public void deleteGuestbook(Long id) {
        Guestbook guestbook = guestbookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("방명록을 찾을 수 없습니다: " + id));
        guestbookRepository.delete(guestbook);
    }
    
    // 이름으로 검색
    public List<Guestbook> searchByName(String name) {
        return guestbookRepository.findByNameContaining(name);
    }
}
