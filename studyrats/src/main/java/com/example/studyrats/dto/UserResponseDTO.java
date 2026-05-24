package com.example.studyrats.dto;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class UserResponseDTO {

    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private LocalDateTime creationDate;

    private List<MembershipDTO> memberships;
}