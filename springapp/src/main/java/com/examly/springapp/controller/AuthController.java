package com.examly.springapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.dto.LoginRequest;
import com.examly.springapp.dto.LoginResponse;
import com.examly.springapp.security.JwtUtil;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

        private final AuthenticationManager authenticationManager;

        private final JwtUtil jwtUtil;

        public AuthController(
                        AuthenticationManager authenticationManager,
                        JwtUtil jwtUtil) {

                this.authenticationManager = authenticationManager;
                this.jwtUtil = jwtUtil;
        }

        @PostMapping("/login")
        public ResponseEntity<LoginResponse> login(
                        @RequestBody LoginRequest request) {
                System.out.println("========== LOGIN API HIT ==========");

                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getUsername(),
                                                request.getPassword()));

                org.springframework.security.core.userdetails.User user = (org.springframework.security.core.userdetails.User) authentication
                                .getPrincipal();

                String token = jwtUtil.generateToken(user.getUsername());

                LoginResponse response = new LoginResponse();

                response.setToken(token);

                response.setUsername(user.getUsername());

                response.setRole(
                                user.getAuthorities()
                                                .iterator()
                                                .next()
                                                .getAuthority());

                return ResponseEntity.ok(response);
        }

}