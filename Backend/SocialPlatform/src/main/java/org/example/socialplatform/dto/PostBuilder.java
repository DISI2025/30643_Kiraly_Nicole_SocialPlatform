package org.example.socialplatform.dto;

import org.example.socialplatform.entity.Post;

public class PostBuilder {
    private PostBuilder(){

    }
    public static PostDTO toPostDTO(Post post){
        return new PostDTO(post.getId(),
                post.getImage(),
                post.getDescription(),
                post.getDate(),
                post.getUser(),
                post.getNoLikes(),
                post.isVisible());
    }

    public static PostRequestDTO toPostRequestDTO(Post post){
        return new PostRequestDTO(post.getId(),
                post.getImage(),
                post.getDescription(),
                post.getDate(),
                post.getUser().getId(),
                post.getNoLikes(),
                post.isVisible());
    }

    public static Post toPost(PostDTO postDTO){
        return new Post(postDTO.getId(),
                postDTO.getImage(),
                postDTO.getDescription(),
                postDTO.getDate(),
                postDTO.getUser(),
                postDTO.getNoLikes(),
                postDTO.isVisible());
    }

    public static Post toPost(PostRequestDTO postDTO){
        return new Post(postDTO.getId(),
                postDTO.getImage(),
                postDTO.getDescription(),
                postDTO.getDate(),
                null,
                postDTO.getNoLikes(),
                postDTO.isVisible());
    }
}
