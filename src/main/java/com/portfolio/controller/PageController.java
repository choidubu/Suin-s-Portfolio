package com.portfolio.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.ui.Model;

// 페이지 컨트롤러 - HTML 페이지를 보여주는 역할!
@Controller
public class PageController {
    
    // 관리자 계정
    private static final String ADMIN_ID = "suin";
    private static final String ADMIN_PW = "tndlsWkd";
    
    // 메인 페이지
    @GetMapping("/page")
    public String index() {
        return "index";
    }
    
    // 로그인 페이지
    @GetMapping("/login")
    public String login() {
        return "login";
    }
    
    // 로그인 처리
     @PostMapping("/admin/login")
     public String adminLogin(
        @RequestParam String username,
        @RequestParam String password,
        HttpServletRequest request,  // 세션 사용
        Model model) {

    if (ADMIN_ID.equals(username) && ADMIN_PW.equals(password)) {
        // 로그인 성공: 세션에 로그인 상태 저장
        request.getSession().setAttribute("isAdmin", true);
        return "redirect:/admin";
    } else {
        // 로그인 실패
        model.addAttribute("error", true);
        return "login";
    }
}
    
    // 관리자 페이지
    @GetMapping("/admin")
    public String admin(HttpServletRequest request) {
    Boolean isAdmin = (Boolean) request.getSession().getAttribute("isAdmin");
    if (isAdmin != null && isAdmin) {
        return "admin"; // 로그인 상태면 관리자 페이지
    } else {
        return "login"; // 로그인 안 됐으면 로그인 페이지
    }
}
    
    // 로그아웃
    @GetMapping("/logout")
    public String logout(HttpServletRequest request) {
    request.getSession().invalidate(); // 세션 삭제
    return "redirect:/login"; // 로그인 페이지로 이동
    }
    
    // 에러 페이지
    @GetMapping("/error")
    public String error() {
        return "error";
    }
}