package com.examly.springapp.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.examly.springapp.service.CustomUserDetailsService;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtUtil jwtUtil,
            CustomUserDetailsService userDetailsService) {

        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {
                System.out.println("Request URI = " + request.getRequestURI());
                System.out.println("Authorization Header = " + request.getHeader("Authorization"));

        String authHeader = request.getHeader("Authorization");

        String jwtToken = null;

        String username = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            jwtToken = authHeader.substring(7);

            username = jwtUtil.extractUsername(jwtToken);
            System.out.println("JWT Username = " + username);

        }

        if (username != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            System.out.println("JWT Valid = " + jwtUtil.validateToken(jwtToken));

            if (jwtUtil.validateToken(jwtToken)) {

                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());

                authenticationToken.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request));

                SecurityContextHolder.getContext()
                        .setAuthentication(authenticationToken);

                System.out.println("Authentication Success");

            }

        }

        filterChain.doFilter(request, response);

    }

}