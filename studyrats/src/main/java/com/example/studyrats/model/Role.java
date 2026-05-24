package com.example.studyrats.model;


import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity(name = "roles")
@Table(name = "roles")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class Role implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    private RoleName name;
}
