package com.examly.springapp.service.Impl;

import java.util.Collections;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.examly.springapp.model.User;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.CustomUserDetailsService;

@Service
public class CustomUserDetailsServiceImpl
        implements CustomUserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsServiceImpl(
            UserRepository userRepository) {

        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with username: " + username));

        return new org.springframework.security.core.userdetails.User(

                user.getUsername(),

                user.getPassword(),

                Collections.singletonList(
                        new SimpleGrantedAuthority(
                                "ROLE_" + user.getRole().name()))

        );
    }

}