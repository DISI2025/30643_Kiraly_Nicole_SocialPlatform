package org.example.socialplatform.service;

import jakarta.transaction.Transactional;
import org.example.socialplatform.dto.UserBuilder;
import org.example.socialplatform.dto.UserDTO;
import org.example.socialplatform.entity.Neo4jUser;
import org.example.socialplatform.entity.Post;
import org.example.socialplatform.entity.User;
import org.example.socialplatform.repository.PostRepository;
import org.example.socialplatform.repository.UserRepository;
import org.example.socialplatform.repository.Neo4jUserRepository;
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
    private final Neo4jUserRepository neo4jUserRepository;
    private final PostRepository postRepository;


    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, Neo4jUserRepository neo4jUserRepository, PostRepository postRepository) {
        this.userRepository = userRepository;
        this.neo4jUserRepository = neo4jUserRepository;
        this.postRepository = postRepository;
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
        if (userDTO == null || userDTO.getEmail() == null || userDTO.getPassword() == null) {
            throw new IllegalArgumentException("Invalid user data");
        }

        User user = UserBuilder.toUser(userDTO);
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        User postgresUser = userRepository.save(user);
        LOGGER.debug("User saved to PostgreSQL with ID: {}", postgresUser.getId());

        createOrUpdateUserInNeo4j(UserBuilder.toUserDTO(postgresUser));
        LOGGER.debug("User saved to Neo4j with ID: {}", postgresUser.getId());

        return postgresUser.getId();
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

        UserDTO updatedUserDTO = UserBuilder.toUserDTO(user);
        createOrUpdateUserInNeo4j(updatedUserDTO);

        return updatedUserDTO;
    }

    @CacheEvict(value = "posts", key = "'userPosts:' + #user")
    public void evictUserPosts(UUID user) {
        // This method is just for cache eviction
        LOGGER.debug("Evicting posts for user with ID {} from cache", user);
    }
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "posts", key = "#id.toString()"),
            @CacheEvict(value = "posts", key = "'allPosts'")
    })
    public void deleteUserPost(UUID id) {
        Optional<Post> postOptional = postRepository.findById(id);
        if(postOptional.isEmpty()) {
            LOGGER.error("Post with id {} not found", id);
            throw new RuntimeException("Post with id " + id + " not found");
        }

        // Get the user ID for cache eviction
        UUID userId = postOptional.get().getUser() != null ?
                postOptional.get().getUser().getId() : null;

        postRepository.delete(postOptional.get());

        // Evict user's posts cache if user ID is available
        if (userId != null) {
            evictUserPosts(userId);
        }
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

        User user = userOptional.get();
        String email = user.getEmail();

        if (email != null) {
            evictUserByEmail(email);
        }

        // Delete all user's posts
        List<Post> userPosts = postRepository.findByUserId(user.getId());
        for (Post post : userPosts) {
            deleteUserPost(post.getId());
        }

        // Clean up relationships using direct SQL
        cleanupUserRelationshipsDirectly(id);

        deleteUserFromNeo4j(id);
        userRepository.delete(user);

        LOGGER.info("Successfully deleted user with id: {}", id);
    }

    private void cleanupUserRelationshipsDirectly(UUID userId) {
        try {
            // Remove from user_friends table (both directions)
            int friendsDeleted = userRepository.deleteFriendRelationships(userId);
            LOGGER.info("Deleted {} friend relationships for user: {}", friendsDeleted, userId);

            // Remove from friend_requests table (both directions)
            int requestsDeleted = userRepository.deleteFriendRequestRelationships(userId);
            LOGGER.info("Deleted {} friend request relationships for user: {}", requestsDeleted, userId);

        } catch (Exception e) {
            LOGGER.error("Error cleaning up relationships for user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to cleanup user relationships", e);
        }
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
            addFriendshipToNeo4j(userId, friendId);
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
            neo4jUserRepository.removeFriendshipBetween(userId.toString(), friendId.toString());
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
            addFriendshipToNeo4j(receiverId, senderId);
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


// ========== NEO4J INTEGRATION METHODS ==========

    private void createOrUpdateUserInNeo4j(UserDTO userDTO) {
        try {
            String userId = userDTO.getId().toString();
            Neo4jUser neo4jUser = neo4jUserRepository.findByUserId(userId)
                    .map(existing -> {
                        existing.setFirstName(userDTO.getFirstName());
                        existing.setLastName(userDTO.getLastName());
                        existing.setEmail(userDTO.getEmail());
                        return existing;
                    })
                    .orElseGet(() -> new Neo4jUser(
                            userDTO.getId(),
                            userDTO.getFirstName(),
                            userDTO.getLastName(),
                            userDTO.getEmail()
                    ));

            neo4jUserRepository.save(neo4jUser);
            LOGGER.debug("User {} created/updated in Neo4j", userId);
        } catch (Exception e) {
            LOGGER.error("Error creating/updating user in Neo4j", e);
            throw new RuntimeException("Neo4j operation failed", e);
        }
    }

    private void addFriendshipToNeo4j(UUID userId1, UUID userId2) {
        try {
            String user1Id = userId1.toString();
            String user2Id = userId2.toString();

            ensureUserExistsInNeo4j(userId1);
            ensureUserExistsInNeo4j(userId2);

            Neo4jUser user1 = neo4jUserRepository.findByUserId(user1Id)
                    .orElseThrow(() -> new RuntimeException("User1 not found in Neo4j"));
            Neo4jUser user2 = neo4jUserRepository.findByUserId(user2Id)
                    .orElseThrow(() -> new RuntimeException("User2 not found in Neo4j"));

            user1.getFriends().add(user2);
            user2.getFriends().add(user1);
            neo4jUserRepository.save(user1);
            neo4jUserRepository.save(user2);

            LOGGER.info("Friendship added between {} and {} in Neo4j", user1Id, user2Id);
        } catch (Exception e) {
            LOGGER.error("Error adding friendship in Neo4j: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to add friendship in Neo4j", e);
        }
    }

    @Transactional
    public List<UserDTO> getFriendSuggestions(UUID userId, int limit) { //userdID e userID-ul userului conectat
        try {
            String userIdStr = userId.toString();
            List<Neo4jUser> suggestions = neo4jUserRepository.findFriendSuggestions(userIdStr, limit);
            return suggestions.stream()
                    .map(neo4jUser -> {
                        LOGGER.warn("USER UUID: {}", neo4jUser.getUserIdAsUUID());
                        try {
                            return getUserById(neo4jUser.getUserIdAsUUID());
                        } catch (Exception e) {
                            LOGGER.warn("Could not fetch user details for suggestion: {}", neo4jUser.getUserId());
                            return null;
                        }
                    })
                    .filter(userDTO -> userDTO != null)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            LOGGER.error("Error getting friend suggestions: {}", e.getMessage(), e);
            return List.of();
        }
    }

    public int getMutualFriendsCount(UUID userId1, UUID userId2) {
        try {
            Integer count = neo4jUserRepository.getMutualFriendsCount(
                    userId1.toString(), userId2.toString());
            return count != null ? count : 0;
        } catch (Exception e) {
            LOGGER.error("Error getting mutual friends count: {}", e.getMessage(), e);
            return 0;
        }
    }

    private void ensureUserExistsInNeo4j(UUID userId) {
        String userIdStr = userId.toString();
        if (neo4jUserRepository.findByUserId(userIdStr).isEmpty()) {
            try {
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isPresent()) {
                    UserDTO userDTO = UserBuilder.toUserDTO(userOpt.get());
                    createOrUpdateUserInNeo4j(userDTO);
                } else {
                    LOGGER.error("User {} not found in PostgreSQL", userId);
                }
            } catch (Exception e) {
                LOGGER.error("Could not ensure user exists in Neo4j: {}", e.getMessage(), e);
            }
        }
    }

    private void deleteUserFromNeo4j(UUID userId) {
        try {
            String userIdStr = userId.toString();
            neo4jUserRepository.deleteAllRelationshipsForUser(userIdStr);
            neo4jUserRepository.deleteById(userIdStr);
            LOGGER.info("User {} deleted from Neo4j", userIdStr);
        } catch (Exception e) {
            LOGGER.error("Error deleting user from Neo4j: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete user from Neo4j", e);
        }
    }


}