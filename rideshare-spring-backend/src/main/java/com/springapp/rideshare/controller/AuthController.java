package com.springapp.rideshare.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.springapp.rideshare.dto.LoginRequest;
import com.springapp.rideshare.dto.OtpRequest;
import com.springapp.rideshare.dto.RegisterRequest;
import com.springapp.rideshare.entity.User;
import com.springapp.rideshare.security.JwtService;
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
                request.getName(),
                request.getContact());
    }

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        User user = authService.login(
                request.getEmail(),
                request.getPassword());

        if (!user.isVerified()) {
            throw new RuntimeException("Email not verified");
        }

        return jwtService.generateToken(user.getEmail());
    }

    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestBody OtpRequest request) {
        authService.verifyOtp(request);
        return "Email verified successfully";
    }
}
