package com.example.studyrats.dto;

import jakarta.validation.constraints.NotEmpty;

public record LoginUserRequest(
        @NotEmpty (message = "Email is required") String email,
        @NotEmpty (message = "Password is required") String password
) {
}
