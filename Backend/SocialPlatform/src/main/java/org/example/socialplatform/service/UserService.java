package org.example.socialplatform.service;

import jakarta.transaction.Transactional;
import org.example.socialplatform.dto.UserBuilder;
import org.example.socialplatform.dto.UserDTO;
import org.example.socialplatform.entity.User;
import org.example.socialplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {
    private static final Logger LOGGER = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Cacheable(value = "users", key = "'allUsers'")
    public List<UserDTO> getAllUsers() {
        LOGGER.info("Fetching all users from database");
        List<User> users = userRepository.findAll();
        return users.stream().map(UserBuilder::toUserDTO).collect(Collectors.toList());
    }

    @Cacheable(value = "users", key = "#email", unless = "#result == null")
    public UserDTO findByEmail(String email) {
        LOGGER.info("Fetching user by email: {}", email);
        Optional<User> userOptional = userRepository.findByEmail(email);
        return userOptional.map(UserBuilder::toUserDTO)
                .orElseThrow(() -> {
                    LOGGER.error("User with email {} not found", email);
                    return new RuntimeException("User with email " + email + " not found");
                });
    }

    @Cacheable(value = "users", key = "#id.toString()", unless = "#result == null")
    public UserDTO getUserById(UUID id) {
        LOGGER.info("Fetching user by id: {}", id);
        Optional<User> userOptional = userRepository.findById(id);
        if(userOptional.isEmpty()) {
            LOGGER.error("User with id {} not found", id);
            throw new RuntimeException("User with id " + id + " not found");
        }
        return UserBuilder.toUserDTO(userOptional.get());
    }

    @Transactional
    @CacheEvict(value = "users", key = "'allUsers'")
    public UUID insert(UserDTO userDTO) {
        User user = UserBuilder.toUser(userDTO);
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user = userRepository.save(user);
        LOGGER.debug("User with id {} was inserted in db", user.getId());
        return user.getId();
    }

    @Transactional
    @Caching(
        put = {
            @CachePut(value = "users", key = "#id.toString()")
        },
        evict = {
            @CacheEvict(value = "users", key = "'allUsers'"),
            @CacheEvict(value = "users", key = "#result.email", condition = "#result != null")
        }
    )
    public UserDTO update(UUID id, UserDTO userDTO) {
        Optional<User> userOptional = userRepository.findById(id);
        if(userOptional.isEmpty()) {
            LOGGER.error("User with id {} not found", id);
            throw new RuntimeException("User with id " + id + " not found");
        }
        User user = UserBuilder.toUser(userDTO);
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setId(id);
        user = userRepository.save(user);
        return UserBuilder.toUserDTO(user);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "users", key = "#id.toString()"),
        @CacheEvict(value = "users", key = "'allUsers'")
    })
    public void delete(UUID id) {
        Optional<User> userOptional = userRepository.findById(id);
        if(userOptional.isEmpty()) {
            LOGGER.error("User with id {} not found", id);
            throw new RuntimeException("User with id " + id + " not found");
        }
        // Cache by email also needs to be evicted
        String email = userOptional.get().getEmail();
        if (email != null) {
            evictUserByEmail(email);
        }
        userRepository.delete(userOptional.get());
    }

    @CacheEvict(value = "users", key = "#email")
    public void evictUserByEmail(String email) {
        // This method is just for cache eviction
        LOGGER.debug("Evicting user with email {} from cache", email);
    }

    @Cacheable(value = "userFriends", key = "#userId.toString()")
    public List<UserDTO> getFriendsOfUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User with id " + userId + " not found"));

        return user.getFriends().stream()
                .map(UserBuilder::toUserDTO)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "userFriends", key = "#userId.toString()")
    public void evictFriendsCache(UUID userId) {
        LOGGER.debug("Evicted cached friends list for user {}", userId);
    }

    @Transactional
    @CacheEvict(value = "userFriends", key = "#userId.toString()")
    public void addFriend(UUID userId, UUID friendId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        User friend = userRepository.findById(friendId).orElseThrow(() -> new RuntimeException("Friend not found"));

        if (!user.getFriends().contains(friend)) {
            user.getFriends().add(friend);
            friend.getFriends().add(user);
            userRepository.save(user);
            userRepository.save(friend);
        }
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "userFriends", key = "#userId.toString()"),
            @CacheEvict(value = "userFriends", key = "#friendId.toString()")
    })
    public void removeFriend(UUID userId, UUID friendId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        User friend = userRepository.findById(friendId).orElseThrow(() -> new RuntimeException("Friend not found"));

        if (user.getFriends().contains(friend)) {
            user.getFriends().remove(friend);
            friend.getFriends().remove(user);

            userRepository.save(user);
            userRepository.save(friend);
        }
    }


    @CacheEvict(value = "users", key = "#receiverId.toString()")
    @Transactional
    public void sendFriendRequest(UUID senderId, UUID receiverId) {
        if (senderId.equals(receiverId)) {
            throw new RuntimeException("Cannot send a friend request to yourself.");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        boolean alreadyRequested = receiver.getFriendRequests().contains(sender);
        boolean alreadyFriends = receiver.getFriends().contains(sender);

        if (!alreadyRequested && !alreadyFriends) {
            receiver.getFriendRequests().add(sender);
            userRepository.save(receiver);
        }
    }



    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "userFriends", key = "#receiverId.toString()"),
            @CacheEvict(value = "userFriends", key = "#senderId.toString()")
    })
    public void acceptFriendRequest(UUID receiverId, UUID senderId) {
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        if (receiver.getFriendRequests().contains(sender)) {
            receiver.getFriendRequests().remove(sender);
            receiver.getFriends().add(sender);
            sender.getFriends().add(receiver);

            userRepository.save(receiver);
            userRepository.save(sender);
        } else {
            throw new RuntimeException("No friend request from this user.");
        }
    }


    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "userFriends", key = "#receiverId.toString()"),
            @CacheEvict(value = "userFriends", key = "#senderId.toString()")
    })
    public void rejectFriendRequest(UUID receiverId, UUID senderId) {
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        receiver.getFriendRequests().remove(sender);
        userRepository.save(receiver);
    }


    @Transactional
    public List<UserDTO> getPendingFriendRequests(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getFriendRequests().stream()
                .map(UserBuilder::toUserDTO)
                .collect(Collectors.toList());
    }





}