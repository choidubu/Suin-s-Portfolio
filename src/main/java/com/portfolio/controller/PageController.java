package com.portfolio.controller;

import jakarta.servlet.http.HttpSession; // ✅ 이 import 추가!
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class PageController {

    // 관리자 계정
    private static final String ADMIN_ID = "suin";
    private static final String ADMIN_PW = "tndlsWkd";

    // 메인 페이지
    @GetMapping("/")
    public String index(HttpSession session, Model model) {
        // 로그인 상태 전달 (Thymeleaf에서 ${session.isAdmin} 사용 가능)
        model.addAttribute("isAdmin", session.getAttribute("isAdmin") != null);
        return "index";
    }

    // 로그인 페이지
    @GetMapping("/login")
    public String login(HttpSession session) {
        // 이미 로그인되어 있으면 바로 /admin으로 리다이렉트
        if (session.getAttribute("isAdmin") != null) {
            return "redirect:/admin";
        }
        return "login";
    }

    // 로그인 처리
    @PostMapping("/admin/login")
    public String adminLogin(
            @RequestParam String username,
            @RequestParam String password,
            HttpSession session,
            Model model) {

        if (ADMIN_ID.equals(username) && ADMIN_PW.equals(password)) {
            // ✅ 로그인 성공 → 세션에 저장
            session.setAttribute("isAdmin", true);
            return "redirect:/admin";
        } else {
            // 로그인 실패
            model.addAttribute("error", true);
            return "login";
        }
    }

    // 관리자 페이지
    @GetMapping("/admin")
    public String admin(HttpSession session) {
        // ✅ 로그인 안 돼 있으면 로그인 페이지로 리다이렉트
        if (session.getAttribute("isAdmin") == null) {
            return "redirect:/login";
        }
        return "admin";
    }

    // 로그아웃
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        // ✅ 세션 초기화 (로그인 상태 해제)
        session.invalidate();
        return "redirect:/";
    }

    // 에러 페이지
    @GetMapping("/error")
    public String error() {
        return "error";
    }
}
