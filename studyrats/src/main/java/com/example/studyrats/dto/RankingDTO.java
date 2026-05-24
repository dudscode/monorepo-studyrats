package com.example.studyrats.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RankingDTO {

    private String userId;
    private String firstName;
    private long totalCheckins;
}
