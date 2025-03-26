package org.example.socialplatform.dto;

import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.socialplatform.entity.User;

import java.util.Date;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PostDTO {
    private UUID id;
    private String image;
    private String description;
    private Date date;
    private User user;
    private int noLikes;
    private boolean visible;
}
