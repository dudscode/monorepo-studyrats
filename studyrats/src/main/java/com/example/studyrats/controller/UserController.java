package com.example.studyrats.controller;


import com.example.studyrats.dto.*;
import com.example.studyrats.model.User;
import com.example.studyrats.service.UserService;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.MediaTypes;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("users")
public class UserController {

    private final  UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    @PostMapping("/create")
   public ResponseEntity<EntityModel<RegisterUserResponse>> create(@RequestBody UserRequest  user) {

            Optional<RegisterUserResponse> createdUser = userService.createUser(user);
            if(createdUser.isPresent()) {
                RegisterUserResponse userDTO = createdUser.get();
                return ResponseEntity.status(HttpStatus.CREATED)
                        .contentType(MediaTypes.HAL_JSON)
                        .body(EntityModel.of(userDTO,
                                linkTo(methodOn(GroupController.class).createGroup(userDTO.idUser(),null )).withRel("create_group").withType("POST"),
                                linkTo(methodOn(GroupMemberShipController.class).joinMember(userDTO.idUser(),null )).withRel("join_group").withType("POST"),
                                linkTo(methodOn(CheckinController.class).createCheckin(userDTO.idUser(), null, null, 0, null)).withRel("checkin").withType("POST")

                        ));
            }
            return  ResponseEntity.status(HttpStatus.CONFLICT).build();
    }

    @PostMapping("/login")
    public ResponseEntity<EntityModel<Optional<LoginUserResponse>>> login(@RequestBody LoginUserRequest loginUserRequest) {
        Optional<LoginUserResponse> loginResponse = userService.loginUser(loginUserRequest);
        if (loginResponse.isPresent()) {
            return ResponseEntity.status(HttpStatus.ACCEPTED)
                    .contentType(MediaTypes.HAL_JSON)
                    .body(EntityModel.of(loginResponse,
                            linkTo(methodOn(GroupController.class).createGroup(loginResponse.get().idUser(),null )).withRel("create_group").withType("POST"),
                            linkTo(methodOn(GroupMemberShipController.class).joinMember(loginResponse.get().idUser(),null )).withRel("join_group").withType("POST"),
                            linkTo(methodOn(CheckinController.class).createCheckin(loginResponse.get().idUser(), null, null, 0, null)).withRel("checkin").withType("POST")

                    ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }


    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> getAll() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
