package com.example.studyrats.dto;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class GroupResponseDTO {

    private String id;
    private String name;
    private String description;
    private LocalDateTime createdAt;

    private List<MembershipDTO> memberships;
}