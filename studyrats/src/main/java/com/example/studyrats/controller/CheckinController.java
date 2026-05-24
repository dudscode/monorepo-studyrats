package com.example.studyrats.controller;

import com.example.studyrats.model.Checkin;
import com.example.studyrats.service.CheckinService;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.MediaTypes;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("checkin")
public class CheckinController {

    private final CheckinService checkinService;

    public CheckinController(CheckinService checkinService) {
        this.checkinService = checkinService;
    }

    @PostMapping(value = "/{idUser}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CollectionModel<EntityModel<Checkin>>> createCheckin(
            @PathVariable String idUser,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam int durationMinutes,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        try {
            Checkin checkinTemplate = new Checkin();
            checkinTemplate.setTitle(title);
            checkinTemplate.setDescription(description);
            checkinTemplate.setDurationMinutes(durationMinutes);

            List<Checkin> createdCheckins = checkinService.createCheckin(idUser, checkinTemplate, image);

            if (!createdCheckins.isEmpty()) {
                return ResponseEntity.status(HttpStatus.CREATED)
                        .contentType(MediaTypes.HAL_JSON)
                        .body(CollectionModel.of(createdCheckins.stream().map(c -> EntityModel.of(c,
                                linkTo(CheckinController.class).slash(idUser).withRel("self").withType("POST")
                        )).toList()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user/{idUser}")
    public ResponseEntity<CollectionModel<EntityModel<Checkin>>> getCheckinsByUser(@PathVariable String idUser) {
        List<Checkin> checkins = checkinService.getCheckinsByUser(idUser);
        if (checkins.isEmpty()) {
            return ResponseEntity.ok()
                    .contentType(MediaTypes.HAL_JSON)
                    .body(CollectionModel.empty());
        }
        List<EntityModel<Checkin>> entities = checkins.stream()
                .map(c -> EntityModel.of(c,
                        linkTo(CheckinController.class).slash("user").slash(idUser).withRel("self").withType("GET")
                ))
                .toList();
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaTypes.HAL_JSON)
                .body(CollectionModel.of(entities,
                        linkTo(methodOn(CheckinController.class).getCheckinsByUser(idUser)).withRel("self").withType("GET")
                ));
    }
}
