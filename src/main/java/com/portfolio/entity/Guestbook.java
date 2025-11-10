// Guestbook.java (수정된 최종 코드)
package com.portfolio.entity;

import com.fasterxml.jackson.annotation.JsonProperty; // 1. import 추가
import jakarta.persistence.*;
import java.time.LocalDateTime;

// 방명록 엔티티 - 방문자들의 메시지를 저장하는 테이블이예여
@Entity
@Table(name = "guestbooks")
public class Guestbook {
    
    // 기본키 (자동 증가)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // 2. 필드명 매핑
    @JsonProperty("author_name") // ⭐ JSON 응답 시 name 대신 author_name 사용
    @Column(nullable = false, length = 50)
    private String name;
    
    // 2. 필드명 매핑
    @JsonProperty("content") // ⭐ JSON 응답 시 message 대신 content 사용
    @Column(nullable = false, length = 1000)
    private String message;
    
    // 2. 필드명 매핑
    @JsonProperty("created") // ⭐ JSON 응답 시 createdAt 대신 created 사용
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // ... (나머지 메서드는 생략)
    
    // 엔티티 저장 전 자동으로 실행 - 생성일 설정
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // 기본 생성자
    public Guestbook() {}
    
    // 생성자
    public Guestbook(String name, String message) {
        this.name = name;
        this.message = message;
    }
    
    // Getter와 Setter들
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

