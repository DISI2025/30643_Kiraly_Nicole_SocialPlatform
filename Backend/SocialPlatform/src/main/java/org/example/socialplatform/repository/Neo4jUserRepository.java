// Neo4j Repository
package org.example.socialplatform.repository;

import org.example.socialplatform.entity.Neo4jUser;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface Neo4jUserRepository extends Neo4jRepository<Neo4jUser, String> {

    Optional<Neo4jUser> findByUserId(String userId);

    @Query("MATCH (a:User {userId: $userId1})-[r:FRIENDS_WITH]-(b:User {userId: $userId2}) DELETE r")
    void removeFriendshipBetween(String userId1, String userId2);


    // Find mutual friends (friends of friends who are not already friends)
    @Query("MATCH (user:User {userId: $userId})-[:FRIENDS_WITH]-(friend)-[:FRIENDS_WITH]-(suggested) " +
            "WHERE user <> suggested AND NOT (user)-[:FRIENDS_WITH]-(suggested) " +
            "RETURN suggested, COUNT(*) as mutualCount " +
            "ORDER BY mutualCount DESC " +
            "LIMIT $limit")
    List<Neo4jUser> findFriendSuggestions(@Param("userId") String userId, @Param("limit") int limit);

    // Find mutual friends count for a specific suggestion
    @Query("MATCH (user:User {userId: $userId})-[:FRIENDS_WITH]-(friend)-[:FRIENDS_WITH]-(suggested:User {userId: $suggestedUserId}) " +
            "WHERE user <> suggested " +
            "RETURN COUNT(DISTINCT friend) as mutualCount")
    Integer getMutualFriendsCount(@Param("userId") String userId, @Param("suggestedUserId") String suggestedUserId);

    // Get all friends of a user
    @Query("MATCH (user:User {userId: $userId})-[:FRIENDS_WITH]-(friend) " +
            "RETURN friend")
    List<Neo4jUser> findFriendsByUserId(@Param("userId") String userId);

    // Check if friendship exists
    @Query("MATCH (user1:User {userId: $userId1})-[:FRIENDS_WITH]-(user2:User {userId: $userId2}) " +
            "RETURN COUNT(*) > 0")
    Boolean areFriends(@Param("userId1") String userId1, @Param("userId2") String userId2);

    // Advanced suggestion with common interests (if you add interests later)
    @Query("MATCH (user:User {userId: $userId})-[:FRIENDS_WITH]-(friend)-[:FRIENDS_WITH]-(suggested) " +
            "WHERE user <> suggested AND NOT (user)-[:FRIENDS_WITH]-(suggested) " +
            "WITH suggested, COUNT(DISTINCT friend) as mutualCount " +
            "ORDER BY mutualCount DESC " +
            "RETURN suggested " +
            "LIMIT $limit")
    List<Neo4jUser> findAdvancedFriendSuggestions(@Param("userId") String userId, @Param("limit") int limit);

    // Delete all relationships for a user (for cleanup)
    @Query("MATCH (user:User {userId: $userId})-[r]-() DELETE r")
    void deleteAllRelationshipsForUser(@Param("userId") String userId);
}