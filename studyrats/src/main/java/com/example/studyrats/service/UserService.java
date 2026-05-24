package com.example.studyrats.service;

import com.example.studyrats.config.TokenConfig;
import com.example.studyrats.dto.*;
import com.example.studyrats.mapper.UserMapper;
import com.example.studyrats.model.Role;
import com.example.studyrats.model.User;
import com.example.studyrats.repository.RoleRepository;
import com.example.studyrats.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final  UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;


    private final AuthenticationManager authenticationManager;


    private final TokenConfig tokenConfig;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, TokenConfig tokenConfig) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenConfig = tokenConfig;
    }

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<UserResponseDTO> getUserById(String id) {
        return userRepository.findById(id)
                .map(UserMapper::toDTO);
    }

    public Optional<RegisterUserResponse> createUser(UserRequest user) {
        if (userRepository.findByEmail(user.email()) != null) {
            return Optional.empty();
        }
        User newUser = User.builder().
                firstName(user.firstName()).
                lastName(user.lastName()).
                email(user.email()).
                passwordHash(passwordEncoder.encode(user.password())).
                birthDate(user.birthday())
                .creationDate(LocalDateTime.now())
                .roles(List.of(Role.builder().name(user.role()).build()))
        .build();
        User savedUser = userRepository.save(newUser);
        RegisterUserResponse userResponse = new RegisterUserResponse(savedUser.getFirstName(), savedUser.getEmail(), newUser.getUserId());
        return Optional.of(userResponse);
    }

    public Optional<User> getEntityById(String id) {
        return userRepository.findById(id);
    }


    public Optional<LoginUserResponse> loginUser(LoginUserRequest loginUserRequest) {
        User user = userRepository.findByEmail(loginUserRequest.email());

        if (user == null) {
            return Optional.empty();
        }
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(loginUserRequest.email(), loginUserRequest.password());
        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        User authenticatedUser = (User) authentication.getPrincipal();
        String token = tokenConfig.generateToken(authenticatedUser);

        if (authentication.isAuthenticated()) {
            LoginUserResponse loginResponse = new LoginUserResponse(user.getFirstName(),token , user.getUserId());
            return Optional.of(loginResponse);
        }
        return Optional.empty();
    }
}
