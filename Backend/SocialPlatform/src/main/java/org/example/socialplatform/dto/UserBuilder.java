package org.example.socialplatform.dto;

import org.example.socialplatform.entity.User;

public class UserBuilder {
    private UserBuilder(){

    }
    public static UserDTO toUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPassword(user.getPassword());
        dto.setRole(user.getRole());
        dto.setImage(user.getImage());

        if (user.getFriends() != null) {
            dto.setFriends(user.getFriends().stream()
                    .map(friend -> {
                        UserDTO f = new UserDTO();
                        f.setId(friend.getId());
                        f.setFirstName(friend.getFirstName());
                        f.setLastName(friend.getLastName());
                        f.setImage(friend.getImage());
                        return f;
                    }).toList());
        }

        return dto;
    }

    public static User toUser(UserDTO userDTO) {
        User user = new User();
        user.setId(userDTO.getId());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
        user.setPassword(userDTO.getPassword());
        user.setRole(userDTO.getRole());
        user.setImage(userDTO.getImage());
        return user;
    }
}
