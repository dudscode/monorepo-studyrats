package com.example.studyrats.service;


import com.example.studyrats.dto.RankingDTO;
import com.example.studyrats.model.Checkin;
import com.example.studyrats.model.Group;
import com.example.studyrats.model.User;
import com.example.studyrats.repository.CheckinRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CheckinService {


    private final CheckinRepository checkinRepository;


    private final UserService userService;


    private final GroupService groupService;

    public CheckinService(CheckinRepository checkinRepository, UserService userService, GroupService groupService) {
        this.checkinRepository = checkinRepository;
        this.userService = userService;
        this.groupService = groupService;
    }


    public List<Checkin> createCheckin(String userId, Checkin checkinTemplate, MultipartFile image) throws IOException {

        Optional<User> optionalUser = userService.getEntityById(userId);
        if (optionalUser.isEmpty()) {
            return new ArrayList<>();
        }

        User user = optionalUser.get();

        List<Group> userGroups = groupService.allEntity().stream()
                .filter(group -> group.getMemberships().stream()
                        .anyMatch(membership -> membership.getUser().getUserId().equals(userId)))
                .toList();

        if (userGroups.isEmpty()) {
            return new ArrayList<>();
        }

        byte[] imageBytes = (image != null && !image.isEmpty()) ? image.getBytes() : null;
        String imageContentType = (image != null && !image.isEmpty()) ? image.getContentType() : null;

        List<Checkin> createdCheckins = new ArrayList<>();
        LocalDateTime checkinTime = LocalDateTime.now();

        for (Group group : userGroups) {
            if (!hasCheckedInTodayForGroup(user, group)) {
                Checkin checkin = Checkin.builder()
                        .user(user)
                        .group(group)
                        .title(checkinTemplate.getTitle())
                        .description(checkinTemplate.getDescription())
                        .durationMinutes(checkinTemplate.getDurationMinutes())
                        .imageData(imageBytes)
                        .imageContentType(imageContentType)
                        .checkinDate(checkinTime)
                        .build();

                Checkin savedCheckin = checkinRepository.save(checkin);
                createdCheckins.add(savedCheckin);
            }
        }

        return createdCheckins;
    }



    public boolean hasCheckedInTodayForGroup(User user, Group group) {
        return checkinRepository.existsByUserAndGroupAndCheckinDateBetween(
                user,
                group,
                LocalDateTime.now().toLocalDate().atStartOfDay(),
                LocalDateTime.now().toLocalDate().atTime(23, 59, 59)
        );
    }

    public List<RankingDTO> getRanking( String groupId) {
        return checkinRepository.getRankingByGroup(groupId);
    }

    public List<Checkin> getCheckinsByUser(String userId) {
        return checkinRepository.findByUserUserIdOrderByCheckinDateDesc(userId);
    }

}
