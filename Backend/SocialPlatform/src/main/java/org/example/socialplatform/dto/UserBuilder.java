package org.example.socialplatform.dto;

import org.example.socialplatform.entity.User;

public class UserBuilder {
    private UserBuilder(){

    }
    public static UserDTO toUserDTO(User user){
        return new UserDTO(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getPassword(), user.getRole(), user.getImage());
    }

    public static User toUser(UserDTO userDTO){
        return new User(userDTO.getId(), userDTO.getFirstName(), userDTO.getLastName(), userDTO.getEmail(), userDTO.getPassword(), userDTO.getRole(), userDTO.getImage());
    }
}
