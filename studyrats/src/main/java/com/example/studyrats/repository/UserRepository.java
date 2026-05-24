package com.example.studyrats.repository;

import com.example.studyrats.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;


public interface UserRepository  extends JpaRepository<User, String> {
    User findByEmail(String email);
    Optional<UserDetails> findUserByEmail(String username);
}
