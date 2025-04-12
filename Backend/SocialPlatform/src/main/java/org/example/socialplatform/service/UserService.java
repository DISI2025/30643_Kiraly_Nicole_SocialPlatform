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
}