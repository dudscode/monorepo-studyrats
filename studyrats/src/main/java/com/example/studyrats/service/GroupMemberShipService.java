package com.example.studyrats.service;

import com.example.studyrats.dto.GroupResponseDTO;
import com.example.studyrats.mapper.GroupMapper;
import com.example.studyrats.model.Group;
import com.example.studyrats.model.GroupMembership;
import com.example.studyrats.model.User;
import com.example.studyrats.repository.GroupRepository;
import com.example.studyrats.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
@Service
public class GroupMemberShipService {

    private final UserService userService;

    private final GroupRepository groupRepository;

    public GroupMemberShipService(UserService userService, GroupRepository groupRepository) {
        this.userService = userService;
        this.groupRepository = groupRepository;
    }

    public Optional<GroupResponseDTO> addUserToGroup(String userId, String groupId) {

        Optional<User> optionalUser = userService.getEntityById(userId);
        Optional<Group> optionalGroup = groupRepository.findById(groupId);

        if (optionalUser.isEmpty() || optionalGroup.isEmpty()) {
            return Optional.empty();
        }

        User user = optionalUser.get();
        Group group = optionalGroup.get();

        boolean alreadyMember = group.getMemberships()
                .stream()
                .anyMatch(m -> m.getUser().getUserId().equals(userId));

        if (alreadyMember) {
            return Optional.of(GroupMapper.toDTO(group));
        }

        GroupMembership membership = GroupMembership.builder()
                .user(user)
                .group(group)
                .joinedAt(LocalDateTime.now())
                .role(GroupMembership.Role.MEMBER)
                .build();

        group.getMemberships().add(membership);

        Group savedGroup = groupRepository.save(group);

        return Optional.of(GroupMapper.toDTO(savedGroup));
    }
}
