package org.example.socialplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.antlr.v4.runtime.misc.NotNull;
import org.example.socialplatform.entity.ROLE;
import org.example.socialplatform.entity.User;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {

    private UUID id;
    @NotNull
    private String firstName;
    @NotNull
    private String lastName;
    @NotNull
    private String email;
    @NotNull
    private String password;
    @NotNull
    private ROLE role;
    @NotNull
    private String image;
    private List<UserDTO> friends;
    private List<UserDTO> friendRequests;


}
