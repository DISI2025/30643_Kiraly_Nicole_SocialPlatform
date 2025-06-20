package org.example.socialplatform.controller;

import jakarta.transaction.Transactional;
import org.example.socialplatform.config.JwtUtil;
import org.example.socialplatform.dto.UserBuilder;
import org.example.socialplatform.dto.UserDTO;
import org.example.socialplatform.entity.User;
import org.example.socialplatform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@CrossOrigin
@RequestMapping(value = "/user")
public class UserController {
    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Autowired
    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @Transactional
    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
        userService.insert(userDTO);
        return new ResponseEntity<>(userDTO, HttpStatus.CREATED);
    }

    @Transactional
    @GetMapping(value = "/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable("id") UUID userId) {
        UserDTO userDTO = userService.getUserById(userId);
        return new ResponseEntity<>(userDTO, HttpStatus.OK);
    }

    @Transactional
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

    @Transactional
    @GetMapping("/friends")
    public ResponseEntity<List<UserDTO>> getFriendsOfLoggedUser(@RequestHeader("Authorization") String authorizationHeader) {
        String jwtToken = authorizationHeader.substring(7);  // Strip "Bearer "
        String email = jwtUtil.extractEmail(jwtToken);

        UserDTO user = userService.findByEmail(email);

        List<UserDTO> friends = userService.getFriendsOfUser(user.getId());
        return new ResponseEntity<>(friends, HttpStatus.OK);
    }


    @Transactional
    @PostMapping("/add-friend/{friendId}")
    public ResponseEntity<String> addFriend(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID friendId) {
        String jwt = authorizationHeader.substring(7);
        String email = jwtUtil.extractEmail(jwt);
        UserDTO user = userService.findByEmail(email);
        userService.addFriend(user.getId(), friendId);
        return ResponseEntity.ok("Friend added.");
    }

    @Transactional
    @DeleteMapping("/remove-friend/{friendId}")
    public ResponseEntity<String> removeFriend(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID friendId) {
        String jwt = authorizationHeader.substring(7);
        String email = jwtUtil.extractEmail(jwt);
        UserDTO user = userService.findByEmail(email);
        userService.removeFriend(user.getId(), friendId);
        return ResponseEntity.ok("Friend removed.");
    }

    @Transactional
    @PostMapping("/request-friend/{receiverId}")
    public ResponseEntity<String> requestFriend(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID receiverId) {
        String jwt = authorizationHeader.substring(7);
        String email = jwtUtil.extractEmail(jwt);
        UserDTO sender = userService.findByEmail(email);

        userService.sendFriendRequest(sender.getId(), receiverId);
        return ResponseEntity.ok("Friend request sent.");
    }

    @Transactional
    @PostMapping("/accept-friend/{senderId}")
    public ResponseEntity<String> acceptFriendRequest(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID senderId) {
        String jwt = authorizationHeader.substring(7);
        String email = jwtUtil.extractEmail(jwt);
        UserDTO receiver = userService.findByEmail(email);

        userService.acceptFriendRequest(receiver.getId(), senderId);
        return ResponseEntity.ok("Friend request accepted.");
    }

    @Transactional
    @DeleteMapping("/reject-friend/{senderId}")
    public ResponseEntity<String> rejectFriendRequest(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID senderId) {
        String jwt = authorizationHeader.substring(7);
        String email = jwtUtil.extractEmail(jwt);
        UserDTO receiver = userService.findByEmail(email);

        userService.rejectFriendRequest(receiver.getId(), senderId);
        return ResponseEntity.ok("Friend request rejected.");
    }
    @Transactional
    @GetMapping("/pending-requests")
    public ResponseEntity<List<UserDTO>> getPendingFriendRequests(
            @RequestHeader("Authorization") String authorizationHeader) {
        String jwt = authorizationHeader.substring(7);
        String email = jwtUtil.extractEmail(jwt);
        UserDTO user = userService.findByEmail(email);
        List<UserDTO> requests = userService.getPendingFriendRequests(user.getId());

        return new ResponseEntity<>(requests, HttpStatus.OK);
    }

    @GetMapping("/{userId}/friend-suggestions")
    public ResponseEntity<List<UserDTO>> getFriendSuggestions(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "10") int limit) {
        List<UserDTO> suggestions = userService.getFriendSuggestions(userId, limit);
        return ResponseEntity.ok(suggestions);
    }

}
