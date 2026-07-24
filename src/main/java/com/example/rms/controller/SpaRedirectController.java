package com.example.rms.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class SpaRedirectController implements ErrorController {

    @RequestMapping("/error")
    public Object handleError(HttpServletRequest request) {
        String uri = (String) request.getAttribute("jakarta.servlet.error.request_uri");
        // If the API 404s, return 404. Otherwise (for UI routes), serve the React app
        if (uri != null && uri.startsWith("/api")) {
            return org.springframework.http.ResponseEntity.notFound().build();
        }
        return "forward:/index.html";
    }
}
