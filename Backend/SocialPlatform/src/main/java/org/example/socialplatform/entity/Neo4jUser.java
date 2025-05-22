// Neo4j User Node Entity
package org.example.socialplatform.entity;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Node("User")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Neo4jUser {

    @Id
    private String userId; // We'll use UUID.toString() from PostgreSQL

    private String firstName;
    private String lastName;
    private String email;

    @Relationship(type = "FRIENDS_WITH", direction = Relationship.Direction.OUTGOING)
    private Set<Neo4jUser> friends = new HashSet<>();

    public Neo4jUser(UUID userId, String firstName, String lastName, String email) {
        this.userId = userId.toString();
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }

    public UUID getUserIdAsUUID() {
        return UUID.fromString(userId);
    }
}