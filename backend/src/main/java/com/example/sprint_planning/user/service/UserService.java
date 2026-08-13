package com.example.sprint_planning.user.service;

import com.example.sprint_planning.user.dto.CreateUserRequest;
import com.example.sprint_planning.user.dto.UpdateUserRequest;
import com.example.sprint_planning.user.dto.UserResponse;

import java.util.List;
import java.util.UUID;

public interface UserService {

    List<UserResponse> getAllUsers();

    UserResponse getUserById(UUID id);

    UserResponse createUser(CreateUserRequest request);

    UserResponse updateUser(UUID id, UpdateUserRequest request);

    void deleteUser(UUID id);
}
