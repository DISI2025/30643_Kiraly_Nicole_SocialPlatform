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
    public static final Logger LOGGER = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Cacheable(value = "users")
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(UserBuilder::toUserDTO).toList();
    }

    @Cacheable(value = "users", key = "#id")
    public UserDTO getUserById(UUID id) {
        Optional<User> userOptional = userRepository.findById(id);
        if(!userOptional.isPresent()) {
            LOGGER.error("User with id {} not found", id);
            throw new RuntimeException("User with id " + id + " not found");
        }
        return UserBuilder.toUserDTO(userOptional.get());

    }

    @Transactional
    public UUID insert(UserDTO userDTO) {
        User user = UserBuilder.toUser(userDTO);
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user = userRepository.save(user);
        LOGGER.debug("User with id {} was inserted in db", user.getId());
        return user.getId();
    }

    @CachePut(value = "users", key = "#id")
    @Transactional
    public UUID update(UUID id, UserDTO userDTO) {
        Optional<User> userOptional = userRepository.findById(id);
        if(!userOptional.isPresent()) {
            LOGGER.error("User with id {} not found", id);
            throw new RuntimeException("User with id " + id + " not found");
        }
        User user = UserBuilder.toUser(userDTO);
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setId(id);
        user = userRepository.save(user);
        return user.getId();
    }

    @CacheEvict(value = "users", key = "#id")
    @Transactional
    public void delete(UUID id) {
        Optional<User> userOptional = userRepository.findById(id);
        if(!userOptional.isPresent()) {
            LOGGER.error("User with id {} not found", id);
            throw new RuntimeException("User with id " + id + " not found");
        }
        userRepository.delete(userOptional.get());
    }
}
