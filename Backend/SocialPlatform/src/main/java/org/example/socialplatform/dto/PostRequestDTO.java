package org.example.socialplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.socialplatform.entity.User;

import java.util.Date;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class PostRequestDTO {
    private UUID id;
    private String image;
    private String description;
    private Date date;
    private UUID userId;
    private int noLikes;
    private boolean visible;
}
