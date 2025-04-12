package org.example.socialplatform.service;

import jakarta.transaction.Transactional;
import org.example.socialplatform.dto.*;
import org.example.socialplatform.entity.Post;
import org.example.socialplatform.entity.User;
import org.example.socialplatform.repository.PostRepository;
import org.example.socialplatform.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PostService {
    private static final Logger LOGGER = LoggerFactory.getLogger(PostService.class);
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Cacheable(value = "posts", key = "'allPosts'")
    public List<PostDTO> getAllPosts() {
        LOGGER.info("Fetching all posts from database");
        List<Post> posts = postRepository.findAll();
        return posts.stream().map(PostBuilder::toPostDTO).collect(Collectors.toList());
    }

    @Cacheable(value = "posts", key = "'userPosts:' + #user")
    public List<PostDTO> getPostsByUserId(UUID user) {
        LOGGER.info("Fetching posts for user with ID: {}", user);
        List<Post> posts = postRepository.findByUserId(user);
        return posts.stream().map(PostBuilder::toPostDTO).collect(Collectors.toList());
    }

    @Cacheable(value = "posts", key = "#id.toString()", unless = "#result == null")
    public PostDTO getPostById(UUID id) {
        LOGGER.info("Fetching post by ID: {}", id);
        Optional<Post> postOptional = postRepository.findById(id);
        if(postOptional.isEmpty()) {
            LOGGER.error("Post with id {} not found", id);
            throw new RuntimeException("Post with id " + id + " not found");
        }
        return PostBuilder.toPostDTO(postOptional.get());
    }

    @Transactional
    @CacheEvict(value = "posts", allEntries = true)
    public UUID insert(PostRequestDTO postDTO) {
        Post post = PostBuilder.toPost(postDTO);
        Optional<User> user = userRepository.findById(postDTO.getUserId());
        if(user.isPresent()){
            post.setUser(user.get());
        } else {
            LOGGER.error("User with id {} not found", postDTO.getUserId());
            throw new RuntimeException("User with id " + postDTO.getUserId() + " not found");
        }
        post = postRepository.save(post);
        LOGGER.debug("Post with id {} was inserted in db", post.getId());
        return post.getId();
    }

    @Transactional
    @Caching(
            put = {
                    @CachePut(value = "posts", key = "#id.toString()")
            },
            evict = {
                    @CacheEvict(value = "posts", key = "'allPosts'")
            }
    )
    public PostDTO update(UUID id, PostDTO postDTO) {
        Optional<Post> postOptional = postRepository.findById(id);
        if(postOptional.isEmpty()) {
            LOGGER.error("Post with id {} not found", id);
            throw new RuntimeException("Post with id " + id + " not found");
        }

        // Get the original user ID before update for cache eviction
        UUID originalUserId = postOptional.get().getUser() != null ?
                postOptional.get().getUser().getId() : null;

        Post post = PostBuilder.toPost(postDTO);
        post.setId(id);

        // If user changed, manually evict related caches
        if (originalUserId != null) {
            evictUserPosts(originalUserId);
        }

        // Save the post
        post = postRepository.save(post);

        // Get updated user ID and evict if needed
        UUID updatedUserId = post.getUser() != null ? post.getUser().getId() : null;
        if (updatedUserId != null && !updatedUserId.equals(originalUserId)) {
            evictUserPosts(updatedUserId);
        }

        return PostBuilder.toPostDTO(post);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "posts", key = "#id.toString()"),
            @CacheEvict(value = "posts", key = "'allPosts'")
    })
    public void delete(UUID id) {
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

    @CacheEvict(value = "posts", key = "'userPosts:' + #user")
    public void evictUserPosts(UUID user) {
        // This method is just for cache eviction
        LOGGER.debug("Evicting posts for user with ID {} from cache", user);
    }
}