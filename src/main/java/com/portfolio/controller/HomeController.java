package com.portfolio.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.HttpServletRequest;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(HttpServletRequest request, Model model) {
        Boolean isAdmin = (Boolean) request.getSession().getAttribute("isAdmin");
        if (isAdmin != null && isAdmin) {
            model.addAttribute("adminLoggedIn", true);
        } else {
            model.addAttribute("adminLoggedIn", false);
        }
        return "index"; // templates/index.html
    }
}

