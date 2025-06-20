package org.example.socialplatform.controller;

import jakarta.transaction.Transactional;
import org.example.socialplatform.dto.PostDTO;
import org.example.socialplatform.dto.PostRequestDTO;
import org.example.socialplatform.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin
@RequestMapping(value = "/post")
public class PostController {
    private final PostService postService;

    @Autowired
    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts() {
        List<PostDTO> posts = postService.getAllPostsOrderedByDate();
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }

    @Transactional
    @PostMapping
    public ResponseEntity<UUID> createPost(@RequestBody PostRequestDTO postDTO) {
        UUID postId = postService.insert(postDTO);
        return new ResponseEntity<>(postId, HttpStatus.CREATED);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<PostDTO> getPostById(@PathVariable("id") UUID postId) {
        PostDTO postDTO = postService.getPostById(postId);
        return new ResponseEntity<>(postDTO, HttpStatus.OK);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<PostDTO> updatePost(@PathVariable("id") UUID postId, @RequestBody PostDTO postDTO) {
        PostDTO post = postService.update(postId, postDTO);
        System.out.println(post.getNoLikes());
        System.out.println(post.getDescription());
        return new ResponseEntity<>(post, HttpStatus.OK);
    }

    @PutMapping(value = "/block-post/{id}")
    public ResponseEntity<PostDTO> blockPost(@PathVariable("id") UUID postId) {
        PostDTO postDTO = postService.blockPost(postId);
        return new ResponseEntity<>(postDTO, HttpStatus.OK);
    }

    @PutMapping(value = "/like-post/{id}/{userId}")
    public ResponseEntity<PostDTO> likePost(@PathVariable("id") UUID postId, @PathVariable("userId") UUID userId) {
        PostDTO postDTO = postService.likePost(postId, userId);
        return new ResponseEntity<>(postDTO, HttpStatus.OK);
    }

    @Transactional
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<UUID> deletePost(@PathVariable("id") UUID postId) {
        postService.delete(postId);
        return new ResponseEntity<>(postId, HttpStatus.OK);
    }
}
