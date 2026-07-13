package com.examly.springapp.controller;

import java.util.List;

import javax.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.dto.UserRequest;
import com.examly.springapp.dto.UserResponse;
import com.examly.springapp.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    // Create User - 201 CREATED
    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody UserRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.createUser(request));

    }

    // Get All Users - 200 OK
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(
                service.getAllUsers());

    }

    // Get User By ID - 200 OK
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                service.getUserById(id));

    }

    // Update User - 200 OK
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest request) {

        return ResponseEntity.ok(
                service.updateUser(id, request));

    }

    // Delete User - 204 NO CONTENT
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id) {

        service.deleteUser(id);

        return ResponseEntity
                .noContent()
                .build();

    }

    // Search Users - 200 OK
    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsers(
            @RequestParam String keyword) {

        return ResponseEntity.ok(
                service.searchUsers(keyword));

    }

}