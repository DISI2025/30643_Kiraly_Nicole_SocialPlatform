package org.example.socialplatform.repository;

import org.example.socialplatform.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m WHERE (m.sender = :sender AND m.receiver = :receiver) OR (m.sender = :receiver AND m.receiver = :sender) ORDER BY m.timestamp ASC")
    List<Message> findAllMessagesBetweenUsers(String sender, String receiver);

    @Query("SELECT m FROM Message m WHERE m.receiver = 'ALL' ORDER BY m.timestamp ASC")
    List<Message> findAllChatRoomMessages();
}