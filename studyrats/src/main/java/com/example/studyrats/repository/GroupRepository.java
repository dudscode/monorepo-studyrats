package com.example.studyrats.repository;

import com.example.studyrats.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface GroupRepository extends JpaRepository<Group, String > {


     @Query("SELECT g.group FROM GroupMembership g WHERE g.user.userId = :userId")
     List<Group> findAllByUserId(String userId);
}
