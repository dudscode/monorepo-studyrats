package com.example.studyrats.mapper;

import com.example.studyrats.dto.GroupResponseDTO;
import com.example.studyrats.dto.MembershipDTO;
import com.example.studyrats.model.Group;
import com.example.studyrats.model.GroupMembership;

import java.util.stream.Collectors;

public class GroupMapper {

    public static GroupResponseDTO toDTO(Group group) {

        return GroupResponseDTO.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .createdAt(group.getCreatedAt())
                .memberships(
                        group.getMemberships().stream()
                                .map(GroupMapper::mapMembership)
                                .collect(Collectors.toList())
                )
                .build();
    }

    private static MembershipDTO mapMembership(GroupMembership membership) {
        return MembershipDTO.builder()
                .id(membership.getId())
                .joinedAt(membership.getJoinedAt())
                .role(membership.getRole().name())
                .userId(membership.getUser().getUserId())
                .userFirstName(membership.getUser().getFirstName())
                .build();
    }
}