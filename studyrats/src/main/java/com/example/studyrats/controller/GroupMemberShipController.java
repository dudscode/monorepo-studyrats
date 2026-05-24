package com.example.studyrats.controller;

import com.example.studyrats.dto.GroupResponseDTO;
import com.example.studyrats.dto.MembershipDTO;
import com.example.studyrats.model.User;
import com.example.studyrats.service.GroupMemberShipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.MediaTypes;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("groupmember")
public class GroupMemberShipController {

    private final GroupMemberShipService groupMemberShipService;

    public GroupMemberShipController(GroupMemberShipService groupMemberShipService) {
        this.groupMemberShipService = groupMemberShipService;
    }


    @PostMapping("/join/{idUser}/{idGroup}")
    public ResponseEntity<EntityModel<Optional<GroupResponseDTO>>> joinMember(@PathVariable String idUser, @PathVariable String idGroup) {
        Optional<GroupResponseDTO> group = groupMemberShipService.addUserToGroup(idUser, idGroup);
        if (group.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .contentType(MediaTypes.HAL_JSON)
                    .body(EntityModel.of(group,
                            linkTo(methodOn(GroupMemberShipController.class).joinMember(idUser,idGroup )).withRel("self").withType("POST")));
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaTypes.HAL_JSON)
                .body(EntityModel.of(group,
                        linkTo(methodOn(GroupController.class).createGroup(idUser,null )).withRel("create_group").withType("POST"),
                        linkTo(methodOn(GroupMemberShipController.class).joinMember(idUser,idGroup )).withRel("self").withType("POST"),
                        linkTo(methodOn(GroupController.class).getById(idUser,idGroup)).withRel("group").withType("GET"),
                        linkTo(methodOn(GroupController.class).getRanking(idGroup)).withRel("ranking").withType("GET")

                ));
    }
}
