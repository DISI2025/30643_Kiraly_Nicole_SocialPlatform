package org.example.socialplatform.repository;

import org.example.socialplatform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    @Modifying
    @Query(value = "DELETE FROM user_friends WHERE user_id = :userId OR friend_id = :userId", nativeQuery = true)
    int deleteFriendRelationships(@Param("userId") UUID userId);

    @Modifying
    @Query(value = "DELETE FROM friend_requests WHERE receiver_id = :userId OR sender_id = :userId", nativeQuery = true)
    int deleteFriendRequestRelationships(@Param("userId") UUID userId);

}
