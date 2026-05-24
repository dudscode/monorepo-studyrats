package com.example.studyrats.controller;


import com.example.studyrats.dto.GroupResponseDTO;
import com.example.studyrats.dto.RankingDTO;
import com.example.studyrats.mapper.GroupMapper;
import com.example.studyrats.model.Group;
import com.example.studyrats.service.CheckinService;
import com.example.studyrats.service.GroupService;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;
import org.springframework.hateoas.MediaTypes;

@RestController
@RequestMapping("groups")
public class GroupController {

    private final GroupService groupService;


    private final  CheckinService checkinService;

    public GroupController(GroupService groupService, CheckinService checkinService) {
        this.groupService = groupService;
        this.checkinService = checkinService;
    }


    @PostMapping("/create/{idUser}")
    public ResponseEntity<EntityModel<GroupResponseDTO>> createGroup(@PathVariable String idUser, @RequestBody Group group) {
        Optional<GroupResponseDTO> groupOptional = groupService.save(idUser, group);

        if (groupOptional.isPresent()) {
            GroupResponseDTO groupResponseDTO = groupOptional.get();
            return ResponseEntity.status(HttpStatus.CREATED)
                    .contentType(MediaTypes.HAL_JSON)
                    .body(EntityModel.of(groupResponseDTO,
                            linkTo(methodOn(GroupController.class).getById(idUser,group.getId())).withRel("grupo").withType("GET"),
                            linkTo(methodOn(GroupController.class).getRanking(group.getId())).withRel("ranking").withType("GET"),
                            linkTo(methodOn(GroupController.class).createGroup(idUser, group)).withRel("self").withType("POST")
                    ));
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);

    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity
            <CollectionModel<EntityModel<GroupResponseDTO>>> getAllGroups() {
        List<GroupResponseDTO> groups = groupService.findAll();
        List<EntityModel<GroupResponseDTO>> entities = groups.stream().map(g -> EntityModel.of(g,
                linkTo(methodOn(GroupController.class).getRanking(g.getId())).withRel("ranking").withType("GET")
        )).collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaTypes.HAL_JSON)
                .body(CollectionModel.of(entities,
                        linkTo(methodOn(GroupController.class).getAllGroups()).withRel("self").withType("GET")
                ));

    }

    @GetMapping("/{idUser}/{idGroup}")
    public ResponseEntity<EntityModel<GroupResponseDTO>> getById(@PathVariable String idUser, @PathVariable String idGroup) {
        Optional<GroupResponseDTO> groupOptional = groupService.findById(idUser, idGroup);
        if (groupOptional.isPresent()) {
            GroupResponseDTO groupResponseDTO = groupOptional.get();

            return ResponseEntity.status(HttpStatus.OK)
                    .contentType(MediaTypes.HAL_JSON)
                    .body(EntityModel.of(groupResponseDTO,
                            linkTo(methodOn(GroupController.class).getById(idUser, idGroup)).withRel("self").withType("GET"),
                            linkTo(methodOn(GroupController.class).getRanking(idGroup)).withRel("ranking").withType("GET")
                    ));
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/user/{idUser}")
    public ResponseEntity<?> getAllGroupByUser(@PathVariable String idUser) {
        List<Group> groups = groupService.getAllGroupByUser(idUser);
        List<EntityModel<GroupResponseDTO>> entities = groups.stream().map(g -> EntityModel.of(GroupMapper.toDTO(g),
                linkTo(methodOn(GroupController.class).getRanking(g.getId())).withRel("ranking").withType("GET")
        )).collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaTypes.HAL_JSON)
                .body(CollectionModel.of(entities,
                        linkTo(methodOn(GroupController.class).getAllGroupByUser(idUser)).withRel("self").withType("GET")
                ));
    }

    @GetMapping("/ranking/{idGroup}")
    public ResponseEntity<?> getRanking(
            @PathVariable String idGroup) {
        List<RankingDTO> ranking = checkinService.getRanking(idGroup);

        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaTypes.HAL_JSON)
                .body(CollectionModel.of(ranking,
                        List.of(
                                linkTo(methodOn(GroupController.class).getRanking(idGroup)).withRel("self").withType("GET")
                        )
                ));

    }
}
