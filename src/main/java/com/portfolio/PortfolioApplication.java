package com.portfolio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// 스프링 부트 애플리케이션의 시작점
@SpringBootApplication
public class PortfolioApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(PortfolioApplication.class, args);
        System.out.println("수인이의 포트폴리오 서버가 시작되었습니다");
    }
}
