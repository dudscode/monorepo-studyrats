package com.example.studyrats.repository;

import com.example.studyrats.dto.RankingDTO;
import com.example.studyrats.model.Checkin;
import com.example.studyrats.model.Group;
import com.example.studyrats.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CheckinRepository extends JpaRepository<Checkin, String> {
    @Query("""
   SELECT new com.example.studyrats.dto.RankingDTO(
       m.user.userId,
       m.user.firstName,
       COUNT(c)
   )
   FROM GroupMembership m
   LEFT JOIN Checkin c\s
      ON c.user = m.user AND c.group = m.group
   WHERE m.group.id = :groupId
   GROUP BY m.user.userId, m.user.firstName
   ORDER BY COUNT(c) DESC
""")
    List<RankingDTO> getRankingByGroup(String groupId);


    boolean existsByUserAndCheckinDateBetween(User user, java.time.LocalDateTime startOfDay, java.time.LocalDateTime endOfDay);

    List<Checkin> findByUserUserIdOrderByCheckinDateDesc(String userId);

    boolean existsByUserAndGroupAndCheckinDateBetween(User user, Group group, java.time.LocalDateTime startOfDay, java.time.LocalDateTime endOfDay);


}
