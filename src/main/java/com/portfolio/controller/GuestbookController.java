package com.portfolio.controller;

import com.portfolio.entity.Guestbook;
import com.portfolio.service.GuestbookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// 방명록 컨트롤러 - 방명록 API 처리하는거임
@RestController
@RequestMapping("/api/guestbooks")
@CrossOrigin(origins = "*")
public class GuestbookController {
    
    private final GuestbookService guestbookService;
    
    @Autowired
    public GuestbookController(GuestbookService guestbookService) {
        this.guestbookService = guestbookService;
    }
    
    // 모든 방명록 조회 - GET /api/guestbooks
    @GetMapping
    public ResponseEntity<List<Guestbook>> getAllGuestbooks() {
        List<Guestbook> guestbooks = guestbookService.getAllGuestbooks();
        return ResponseEntity.ok(guestbooks);
    }
    
    // 특정 방명록 조회 - GET /api/guestbooks/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Guestbook> getGuestbookById(@PathVariable Long id) {
        return guestbookService.getGuestbookById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // 방명록 작성 - POST /api/guestbooks
    @PostMapping
    public ResponseEntity<Guestbook> createGuestbook(@RequestBody Guestbook guestbook) {
        Guestbook createdGuestbook = guestbookService.createGuestbook(guestbook);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdGuestbook);
    }
    
    // 방명록 삭제 - DELETE /api/guestbooks/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGuestbook(@PathVariable Long id) {
        try {
            guestbookService.deleteGuestbook(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // 이름으로 검색 - GET /api/guestbooks/search?name=검색어
    @GetMapping("/search")
    public ResponseEntity<List<Guestbook>> searchGuestbooks(@RequestParam String name) {
        List<Guestbook> guestbooks = guestbookService.searchByName(name);
        return ResponseEntity.ok(guestbooks);
    }
}
