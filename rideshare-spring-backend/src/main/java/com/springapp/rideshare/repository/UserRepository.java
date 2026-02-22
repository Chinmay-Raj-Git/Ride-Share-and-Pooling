package com.springapp.rideshare.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.springapp.rideshare.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

}