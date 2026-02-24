package com.springapp.rideshare.controller;

import com.springapp.rideshare.entity.User;
import com.springapp.rideshare.security.SecurityUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProfileController {

    @GetMapping("/api/profile")
    public User getProfile() {

        User currentUser = SecurityUtils.getCurrentUser();

        if (currentUser == null) {
            throw new RuntimeException("User not authenticated");
        }

        return currentUser;
    }
}