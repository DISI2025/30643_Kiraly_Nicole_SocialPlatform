package org.example.socialplatform.service;

import jakarta.transaction.Transactional;
import org.example.socialplatform.dto.*;
import org.example.socialplatform.entity.Post;
import org.example.socialplatform.entity.Post;
import org.example.socialplatform.entity.User;
import org.example.socialplatform.repository.PostRepository;
import org.example.socialplatform.repository.PostRepository;
import org.example.socialplatform.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.parameters.P;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PostService {
    public static final Logger LOGGER = LoggerFactory.getLogger(PostService.class);
    private final PostRepository postRepository;
    private final UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserRepository userRepository;

    public PostService(PostRepository postRepository, UserService userService) {
        this.postRepository = postRepository;
        this.userService = userService;
    }

    @Cacheable(value = "posts")
    public List<PostDTO> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        return posts.stream().map(PostBuilder::toPostDTO).collect(Collectors.toList());
    }

    @Cacheable(value = "posts", key = "#id")
    public PostDTO getPostById(UUID id) {
        Optional<Post> postOptional = postRepository.findById(id);
        if(!postOptional.isPresent()) {
            LOGGER.error("Post with id {} not found", id);
            throw new RuntimeException("Post with id " + id + " not found");
        }
        return PostBuilder.toPostDTO(postOptional.get());

    }

    @Transactional
    public UUID insert(PostRequestDTO postDTO) {
        Post post = PostBuilder.toPost(postDTO);
        Optional<User> user = userRepository.findById(postDTO.getUserId());
        if(user.isPresent()){
            post.setUser(user.get());
        }
        post = postRepository.save(post);
        LOGGER.debug("Post with id {} was inserted in db", post.getId());
        return post.getId();
    }

    @CachePut(value = "posts", key = "#id")
    @Transactional
    public UUID update(UUID id, PostDTO postDTO) {
        Optional<Post> postOptional = postRepository.findById(id);
        if(postOptional.isEmpty()) {
            LOGGER.error("Post with id {} not found", id);
            throw new RuntimeException("Post with id " + id + " not found");
        }
        Post post = PostBuilder.toPost(postDTO);
        post.setId(id);
        post = postRepository.save(post);
        return post.getId();
    }

    @CacheEvict(value = "posts", key = "#id")
    @Transactional
    public void delete(UUID id) {
        Optional<Post> postOptional = postRepository.findById(id);
        if(postOptional.isEmpty()) {
            LOGGER.error("Post with id {} not found", id);
            throw new RuntimeException("Post with id " + id + " not found");
        }
        postRepository.delete(postOptional.get());
    }
}
