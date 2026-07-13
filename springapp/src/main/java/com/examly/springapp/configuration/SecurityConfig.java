package com.examly.springapp.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.examly.springapp.security.JwtAuthenticationFilter;
import com.examly.springapp.service.CustomUserDetailsService;

@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        private final CustomUserDetailsService customUserDetailsService;

        public SecurityConfig(
                        JwtAuthenticationFilter jwtAuthenticationFilter,
                        CustomUserDetailsService customUserDetailsService) {

                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
                this.customUserDetailsService = customUserDetailsService;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http)
                        throws Exception {

                http

                                .csrf(csrf -> csrf.disable())

                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                .authenticationProvider(authenticationProvider())

                                .authorizeRequests(auth -> auth

                                                // =========================
                                                // USER MODULE
                                                // =========================

                                                // Register User
                                                .antMatchers(HttpMethod.POST, "/api/users")
                                                .permitAll()

                                                // Login
                                                .antMatchers("/api/auth/**")
                                                .permitAll()

                                                // Admin Only - User APIs
                                                .antMatchers(HttpMethod.GET, "/api/users")
                                                .hasRole("ADMIN")

                                                .antMatchers(HttpMethod.GET, "/api/users/search")
                                                .hasRole("ADMIN")

                                                .antMatchers(HttpMethod.GET, "/api/users/*")
                                                .hasRole("ADMIN")

                                                .antMatchers(HttpMethod.PUT, "/api/users/*")
                                                .hasRole("ADMIN")

                                                .antMatchers(HttpMethod.DELETE, "/api/users/*")
                                                .hasRole("ADMIN")

                                                // =========================
                                                // EVENT MODULE
                                                // =========================

                                                // Anyone can view events
                                                .antMatchers(HttpMethod.GET, "/api/events/**")
                                                .permitAll()

                                                // Only ADMIN and ORGANIZER can create events
                                                .antMatchers(HttpMethod.POST, "/api/events")
                                                .hasAnyRole("ADMIN", "ORGANIZER")

                                                // Only logged-in users can RSVP
                                                .antMatchers(HttpMethod.POST, "/api/events/*/rsvp")
                                                .authenticated()

                                                // ADMIN and ORGANIZER can update events
                                                .antMatchers(HttpMethod.PUT, "/api/events/**")
                                                .hasAnyRole("ADMIN", "ORGANIZER")

                                                // ADMIN and ORGANIZER can delete events
                                                .antMatchers(HttpMethod.DELETE, "/api/events/**")
                                                .hasAnyRole("ADMIN", "ORGANIZER")

                                                // =========================
                                                // SESSION MODULE
                                                // =========================

                                                // Anyone can view sessions
                                                .antMatchers(HttpMethod.GET, "/api/sessions/**")
                                                .permitAll()

                                                // Only ADMIN and ORGANIZER can create sessions
                                                .antMatchers(HttpMethod.POST, "/api/sessions")
                                                .hasAnyRole("ADMIN", "ORGANIZER")

                                                // Only ADMIN and ORGANIZER can update sessions
                                                .antMatchers(HttpMethod.PUT, "/api/sessions/**")
                                                .hasAnyRole("ADMIN", "ORGANIZER")

                                                // Only ADMIN and ORGANIZER can delete sessions
                                                .antMatchers(HttpMethod.DELETE, "/api/sessions/**")
                                                .hasAnyRole("ADMIN", "ORGANIZER")
                                                // =========================
                                                // =========================
                                                // =========================
                                                // REGISTRATION MODULE
                                                // =========================

                                                // Only ATTENDEE can register for an event
                                                .antMatchers(HttpMethod.POST, "/api/registrations")
                                                .hasRole("ATTENDEE")

                                                // ADMIN & ORGANIZER can view all registrations
                                                .antMatchers(HttpMethod.GET, "/api/registrations")
                                                .hasAnyRole("ADMIN", "ORGANIZER")

                                                // Logged-in users (ownership checked in Service)
                                                .antMatchers(HttpMethod.GET, "/api/registrations/*")
                                                .authenticated()

                                                // ADMIN & ORGANIZER can view registrations for an event
                                                .antMatchers(HttpMethod.GET, "/api/registrations/event/**")
                                                .hasAnyRole("ADMIN", "ORGANIZER")

                                                // Logged-in users (ownership checked in Service)
                                                .antMatchers(HttpMethod.GET, "/api/registrations/attendee/**")
                                                .authenticated()

                                                // Only ADMIN can delete registrations
                                                .antMatchers(HttpMethod.DELETE, "/api/registrations/**")
                                                .hasRole("ADMIN")
                                                // =========================
                                                // SESSION ATTENDANCE MODULE
                                                // =========================

                                                // Anyone can view attendance
                                                .antMatchers(HttpMethod.GET, "/api/attendance/**")
                                                .permitAll()

                                                // Only ATTENDEE can mark attendance
                                                .antMatchers(HttpMethod.POST, "/api/attendance")
                                                .hasRole("ATTENDEE")

                                                // ADMIN and ORGANIZER can update attendance
                                                .antMatchers(HttpMethod.PUT, "/api/attendance/**")
                                                .hasAnyRole("ADMIN", "ORGANIZER")

                                                // Only ADMIN can delete attendance
                                                .antMatchers(HttpMethod.DELETE, "/api/attendance/**")
                                                .hasRole("ADMIN")

                                                // =========================
                                                // LIVE INTERACTION MODULE
                                                // =========================

                                                // Everyone can view chats
                                                .antMatchers(HttpMethod.GET, "/api/interactions/**")
                                                .permitAll()

                                                // Logged-in users can send chats
                                                .antMatchers(HttpMethod.POST, "/api/interactions")
                                                .authenticated()

                                                // Only ADMIN and ORGANIZER can moderate chats
                                                .antMatchers(HttpMethod.PUT, "/api/interactions/*/moderate")
                                                .hasAnyRole("ADMIN", "ORGANIZER")

                                                // Only ADMIN can delete chats
                                                .antMatchers(HttpMethod.DELETE, "/api/interactions/**")
                                                .hasRole("ADMIN")

                                                // =============================
                                                // =========================
                                                // NETWORKING CONNECTION MODULE
                                                // =========================

                                                // Admin can view all connections
                                                .antMatchers(HttpMethod.GET, "/api/connections")
                                                .hasRole("ADMIN")

                                                // Logged-in attendee/admin can send connection request
                                                .antMatchers(HttpMethod.POST, "/api/connections")
                                                .hasAnyRole("ATTENDEE", "ADMIN")

                                                // Logged-in user's own connections
                                                .antMatchers(HttpMethod.GET, "/api/connections/me")
                                                .authenticated()

                                                // Owner/Admin validation happens in Service
                                                .antMatchers(HttpMethod.GET, "/api/connections/*")
                                                .authenticated()

                                                // Recipient validation happens in Service
                                                .antMatchers(HttpMethod.PUT, "/api/connections/*/respond")
                                                .authenticated()

                                                // Requester/Recipient/Admin validation happens in Service
                                                .antMatchers(HttpMethod.DELETE, "/api/connections/*")
                                                .authenticated()

                                                // =========================
                                                // SWAGGER
                                                // =========================

                                                .antMatchers(
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**",
                                                                "/swagger-resources/**")
                                                .permitAll()

                                                // All other APIs require authentication
                                                .anyRequest()
                                                .authenticated())

                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public DaoAuthenticationProvider authenticationProvider() {

                DaoAuthenticationProvider provider = new DaoAuthenticationProvider();

                provider.setUserDetailsService(customUserDetailsService);

                provider.setPasswordEncoder(passwordEncoder());

                return provider;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {

                return new BCryptPasswordEncoder();

        }

        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration configuration)
                        throws Exception {

                return configuration.getAuthenticationManager();

        }
}