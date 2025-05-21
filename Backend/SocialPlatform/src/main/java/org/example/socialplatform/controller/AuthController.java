package org.example.socialplatform.controller;


import jakarta.transaction.Transactional;
import org.example.socialplatform.config.JwtUtil;
import org.example.socialplatform.dto.LoginRequest;
import org.example.socialplatform.dto.LoginResponse;
import org.example.socialplatform.dto.UserBuilder;
import org.example.socialplatform.dto.UserDTO;
import org.example.socialplatform.entity.User;
import org.example.socialplatform.repository.UserRepository;
import org.example.socialplatform.service.CustomUserDetailsService;
import org.example.socialplatform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping(value = "/auth")
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    @Autowired
    private UserService userService;


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            return new ResponseEntity<>(new LoginResponse("Incorrect username or password"), HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new LoginResponse("Authentication failed"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Person not found"));

        final UserDetails userDetails = customUserDetailsService.loadUserByUsername(loginRequest.getEmail());

        final String jwt = jwtUtil.generateToken(userDetails.getUsername(), user.getRole().name());
        return ResponseEntity.ok(new LoginResponse(jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody UserDTO userDTO) {
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            System.out.println("User already exists with email: " + userDTO.getEmail());
            return new ResponseEntity<>(Map.of("message","User already exists"), HttpStatus.CONFLICT);
        }

        User person = UserBuilder.toUser(userDTO);
        person.setPassword(passwordEncoder.encode(userDTO.getPassword()));

        try {
            UUID personId = userService.insert(userDTO);
            return new ResponseEntity<>(Map.of("message", "User registered successfully"), HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(Map.of("message", "Failed to save user"), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    @Transactional
    @GetMapping("/user")
    public ResponseEntity<UserDTO> getUserData(@RequestHeader("Authorization") String authorizationHeader) {
        String jwtToken = authorizationHeader.substring(7);  // Remove "Bearer " prefix
        String email = jwtUtil.extractEmail(jwtToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Convert the user entity to a DTO
        System.out.println(user.getEmail());
        UserDTO userDTO = UserBuilder.toUserDTO(user);

        return ResponseEntity.ok(userDTO);
    }

    @PostMapping("/test")
    public String test() {
        return "Test successful!";
    }
}
