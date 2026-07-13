package com.examly.springapp.service;

import java.util.List;

import com.examly.springapp.dto.UserRequest;
import com.examly.springapp.dto.UserResponse;

public interface UserService {

    UserResponse createUser(UserRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long id);

    UserResponse updateUser(Long id, UserRequest request);

    void deleteUser(Long id);

    // Search users
    List<UserResponse> searchUsers(String keyword);
}