package org.example.socialplatform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.io.Serializable;
import java.util.Date;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "posts")
public class Post implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    private UUID id;

    @Column(name="image")
    private String image;

    @Column(name = "description", nullable = true)
    private String description;

    @Column(name = "date", nullable = false)
    private Date date;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name="noLikes", nullable = false)
    private int noLikes;

    @Column(name="visible", nullable = false)
    private boolean visible;
}
