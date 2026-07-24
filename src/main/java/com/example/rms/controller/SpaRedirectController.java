package com.example.rms.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaRedirectController {

    // Match all GET requests that do not start with /api and do not contain a dot (like .js, .css, .png)
    // Forward them to the React index.html
    @RequestMapping(value = "/{path:[^\\.]+}/**")
    public String forward() {
        return "forward:/index.html";
    }
}
