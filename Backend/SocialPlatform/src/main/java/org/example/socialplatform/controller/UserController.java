package org.example.socialplatform.controller;

import jakarta.transaction.Transactional;
import org.example.socialplatform.dto.UserDTO;
import org.example.socialplatform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin
@RequestMapping(value = "/user")
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @Transactional
    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
        UUID userId = userService.insert(userDTO);
        return new ResponseEntity<>(userDTO, HttpStatus.CREATED);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable("id") UUID userId) {
        UserDTO userDTO = userService.getUserById(userId);
        return new ResponseEntity<>(userDTO, HttpStatus.OK);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable("id") UUID userId, @RequestBody UserDTO userDTO) {
        UserDTO user = userService.update(userId, userDTO);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @Transactional
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<UUID> deleteUser(@PathVariable("id") UUID userId) {
        userService.delete(userId);
        return new ResponseEntity<>(userId, HttpStatus.OK);
    }
}
