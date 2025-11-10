// GuestbookController.java (최종 수정본)
package com.portfolio.controller;

import com.portfolio.entity.Guestbook;
import com.portfolio.repository.GuestbookRepository; // ⭐ Repository import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional; // Optional 임포트

// 방명록 컨트롤러 - 방명록 API 처리하는거임
@RestController
@RequestMapping("/api/guestbooks")
@CrossOrigin(origins = "*")
public class GuestbookController {
    
    // ⭐ GuestbookService 대신 Repository를 주입받습니다.
    private final GuestbookRepository guestbookRepository; 
    
    @Autowired
    // ⭐ 생성자도 Repository를 주입받도록 변경합니다.
    public GuestbookController(GuestbookRepository guestbookRepository) {
        this.guestbookRepository = guestbookRepository;
    }
    
    // 모든 방명록 조회 - GET /api/guestbooks
    @GetMapping
    public ResponseEntity<List<Guestbook>> getAllGuestbooks() {
        // ⭐ Repository를 직접 호출합니다. 
        // Spring Data JPA는 null 대신 빈 리스트를 반환하므로 NullPointerException이 발생하지 않습니다.
        List<Guestbook> guestbooks = guestbookRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(guestbooks);
    }
    
    // 특정 방명록 조회 - GET /api/guestbooks/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Guestbook> getGuestbookById(@PathVariable Long id) {
        // Optional<T> 반환하는 findById 사용
        Optional<Guestbook> guestbook = guestbookRepository.findById(id); 
        return guestbook.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }
    
    // 방명록 작성 - POST /api/guestbooks
    @PostMapping
    public ResponseEntity<Guestbook> createGuestbook(@RequestBody Guestbook guestbook) {
        // ⭐ Repository를 직접 호출
        Guestbook createdGuestbook = guestbookRepository.save(guestbook);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdGuestbook);
    }
    
    // 방명록 삭제 - DELETE /api/guestbooks/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGuestbook(@PathVariable Long id) {
        // ⭐ Repository를 직접 호출
        if (guestbookRepository.existsById(id)) {
            guestbookRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            // 존재하지 않는 ID를 삭제하려 할 경우
            return ResponseEntity.notFound().build();
        }
    }
    
    // 이름으로 검색 - GET /api/guestbooks/search?name=검색어
    @GetMapping("/search")
    public ResponseEntity<List<Guestbook>> searchGuestbooks(@RequestParam String name) {
        // ⭐ Repository의 findByNameContaining 메서드 사용
        List<Guestbook> guestbooks = guestbookRepository.findByNameContaining(name);
        return ResponseEntity.ok(guestbooks);
    }
}