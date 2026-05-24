package com.example.studyrats.service;

import com.example.studyrats.dto.GroupResponseDTO;
import com.example.studyrats.mapper.GroupMapper;
import com.example.studyrats.model.Group;
import com.example.studyrats.model.GroupMembership;
import com.example.studyrats.model.User;
import com.example.studyrats.repository.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GroupService {

    private final  GroupRepository groupRepository;


    private final  UserService userService;

    public GroupService(GroupRepository groupRepository, UserService userService) {
        this.groupRepository = groupRepository;
        this.userService = userService;
    }

    public Optional<GroupResponseDTO> save(String userId, Group group) {

        Optional<User> optionalUser = userService.getEntityById(userId);
        if (optionalUser.isEmpty()) {
            return Optional.empty();
        }

        User user = optionalUser.get();

        group.setCreatedAt(LocalDateTime.now());

        GroupMembership membership = GroupMembership.builder()
                .user(user)
                .group(group)
                .joinedAt(LocalDateTime.now())
                .role(GroupMembership.Role.ADMIN)
                .build();

        group.getMemberships().add(membership);
        user.getMemberships().add(membership);

        Group savedGroup = groupRepository.save(group);

        return Optional.of(GroupMapper.toDTO(savedGroup));
    }

    public List<GroupResponseDTO> findAll() {
        return groupRepository.findAll()
                .stream()
                .map(GroupMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<GroupResponseDTO> findById(String idUser,  String idGroup) {
        Optional<Group> groupFilter = groupRepository.findById(idGroup).filter(group ->
                group.getMemberships()
                        .stream()
                        .anyMatch(m -> m.getUser().getUserId().equals(idUser))
        );
        if(groupFilter.isPresent()) {
            return groupRepository.findById(idGroup)
                    .map(GroupMapper::toDTO);
        }

        return Optional.empty();
    }

    public List<Group> getAllGroupByUser(String idUser) {
        return groupRepository.findAllByUserId(idUser);
    }

    public List<Group> allEntity() {
        return groupRepository.findAll();
    }
}
