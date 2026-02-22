package com.springapp.rideshare.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.springapp.rideshare.dto.LoginRequest;
import com.springapp.rideshare.dto.RegisterRequest;
import com.springapp.rideshare.entity.User;
import com.springapp.rideshare.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest request) {

        return authService.register(
                request.getEmail(),
                request.getPassword(),
                request.getRole()
        );
    }

    @PostMapping("/login")
    public User login(@RequestBody LoginRequest request) {

        return authService.login(
                request.getEmail(),
                request.getPassword()
        );
    }
}
