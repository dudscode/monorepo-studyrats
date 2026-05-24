package com.example.studyrats.dto;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
public class MembershipDTO {

    private String id;
    private LocalDateTime joinedAt;
    private String role;


    private String groupId;
    private String groupName;

    private String userId;
    private String userFirstName;
}
