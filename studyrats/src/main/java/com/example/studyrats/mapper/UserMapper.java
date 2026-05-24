package com.example.studyrats.mapper;

import com.example.studyrats.dto.MembershipDTO;
import com.example.studyrats.dto.UserResponseDTO;
import com.example.studyrats.model.GroupMembership;
import com.example.studyrats.model.User;

import java.util.stream.Collectors;

public class UserMapper {

    public static UserResponseDTO toDTO(User user) {

        return UserResponseDTO.builder()
                .id(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .creationDate(user.getCreationDate())
                .memberships(
                        user.getMemberships().stream()
                                .map(UserMapper::mapMembership)
                                .collect(Collectors.toList())
                )
                .build();
    }

    private static MembershipDTO mapMembership(GroupMembership membership) {
        return MembershipDTO.builder()
                .id(membership.getId())
                .joinedAt(membership.getJoinedAt())
                .role(membership.getRole().name())
                .groupId(membership.getGroup().getId())
                .groupName(membership.getGroup().getName())
                .build();
    }
}