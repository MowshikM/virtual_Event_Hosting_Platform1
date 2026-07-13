package com.examly.springapp.service.Impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.examly.springapp.dto.UserRequest;
import com.examly.springapp.dto.UserResponse;
import com.examly.springapp.model.Role;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(
            UserRepository repository,
            PasswordEncoder passwordEncoder) {

        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserResponse createUser(UserRequest request) {

        if (repository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username already exists");
        }

        if (repository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already exists");
        }

        User user = new User();

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        // Encrypt password
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setCompany(request.getCompany());
        user.setJobTitle(request.getJobTitle());
        user.setPhoneNumber(request.getPhoneNumber());

        user.setRole(
                request.getRole() != null
                        ? request.getRole()
                        : Role.ATTENDEE);

        user.setProfileData(request.getProfileData());
        user.setIsActive(true);

        return toResponse(repository.save(user));
    }

    @Override
    public List<UserResponse> getAllUsers() {

        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse getUserById(Long id) {

        User user = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found with id: " + id));

        return toResponse(user);
    }

    @Override
    public UserResponse updateUser(Long id, UserRequest request) {

        User user = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found with id: " + id));

        if (!user.getUsername().equals(request.getUsername())
                && repository.existsByUsername(request.getUsername())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username already exists");
        }

        if (!user.getEmail().equals(request.getEmail())
                && repository.existsByEmail(request.getEmail())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already exists");
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        if (request.getPassword() != null
                && !request.getPassword().isBlank()) {

            user.setPassword(
                    passwordEncoder.encode(request.getPassword()));
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setCompany(request.getCompany());
        user.setJobTitle(request.getJobTitle());
        user.setPhoneNumber(request.getPhoneNumber());

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        user.setProfileData(request.getProfileData());

        return toResponse(repository.save(user));
    }

    @Override
    public void deleteUser(Long id) {

        if (!repository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "User not found with id: " + id);
        }

        repository.deleteById(id);
    }

    @Override
    public List<UserResponse> searchUsers(String keyword) {

        return repository
                .findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrCompanyContainingIgnoreCaseOrJobTitleContainingIgnoreCase(
                        keyword,
                        keyword,
                        keyword,
                        keyword,
                        keyword,
                        keyword)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private UserResponse toResponse(User user) {

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setCompany(user.getCompany());
        response.setJobTitle(user.getJobTitle());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setRole(user.getRole());
        response.setProfileData(user.getProfileData());
        response.setIsActive(user.getIsActive());
        response.setCreatedDate(user.getCreatedDate());

        return response;
    }
}