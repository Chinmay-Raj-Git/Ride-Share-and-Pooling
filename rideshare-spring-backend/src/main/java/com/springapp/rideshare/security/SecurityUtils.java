package com.springapp.rideshare.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.springapp.rideshare.entity.User;

public class SecurityUtils {

    public static User getCurrentUser() {

        Authentication auth = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            return null;
        }

        return (User) auth.getPrincipal();
    }
}