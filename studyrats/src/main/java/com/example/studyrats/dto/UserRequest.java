package com.example.studyrats.dto;

import com.example.studyrats.model.RoleName;

import java.time.LocalDate;

public record UserRequest(
        String firstName,
        String lastName,
        String email,
        String password,
        LocalDate birthday,
        RoleName role
) {
}
