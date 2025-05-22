package org.example.socialplatform.service;

import jakarta.persistence.EntityNotFoundException;
import org.example.socialplatform.dto.MessageBuilder;
import org.example.socialplatform.dto.MessageDTO;
import org.example.socialplatform.entity.Message;
import org.example.socialplatform.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public MessageService(MessageRepository messageRepository, SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // Trimiterea unui mesaj one-to-one
    public MessageDTO sendMessageToUser(MessageDTO messageDTO) {
        Message message = MessageBuilder.toEntity(messageDTO);
        message.setTimestamp(LocalDateTime.now());
        message.setSeen(false);

        Message savedMessage = messageRepository.save(message);
        System.out.println(MessageBuilder.toMessageDTO(savedMessage));
        messagingTemplate.convertAndSendToUser(savedMessage.getReceiver(), "/queue/messages", MessageBuilder.toMessageDTO(savedMessage));
        messagingTemplate.convertAndSendToUser(savedMessage.getSender(), "/queue/messages", MessageBuilder.toMessageDTO(savedMessage));
        String receiverPath = "/queue/messages/" + savedMessage.getReceiver();
        String senderPath = "/queue/messages/" + savedMessage.getSender();

        // Trimite mesajul către utilizatorul care va primi mesajul
        //messagingTemplate.convertAndSend(receiverPath, MessageBuilder.toMessageDTO(savedMessage));

        // Trimite și mesajul către expeditor
        //messagingTemplate.convertAndSend(senderPath, MessageBuilder.toMessageDTO(savedMessage));
        return MessageBuilder.toMessageDTO(savedMessage);
    }

    public List<Message> findChatMessages(String sender, String receiver) {
        return messageRepository.findAllMessagesBetweenUsers(sender, receiver);
    }

    //Typing
    public void sendTyping(String typingPerson, String receiver, boolean isTyping) {
        if (isTyping) {
            // Trimite mesajul de tip "isTyping"
            System.out.println("User " + typingPerson + " is typing...");
            messagingTemplate.convertAndSendToUser(receiver, "/queue/typing", typingPerson);
        } else {
            // Trimite mesajul de tip "stopTyping"
            System.out.println("User " + typingPerson + " stopped typing.");
            messagingTemplate.convertAndSendToUser(receiver, "/queue/stopTyping", typingPerson);
        }
    }

    // Metoda care va marca mesajul ca "seen"
    public void markMessageAsSeen(Long messageId, String receiver) {
        // Căutăm mesajul cu id-ul respectiv
        Optional<Message> optionalMessage = messageRepository.findById(messageId);

        if (optionalMessage.isPresent()) {
            Message message = optionalMessage.get();


            //  actualizăm statusul "seen" pentru destinatar
            if (message.getSender().equals(receiver)) {
                message.setSeen(true);
                messageRepository.save(message);

                // Trimitem notificarea către receiver că mesajul a fost văzut
                messagingTemplate.convertAndSendToUser(receiver, "/queue/seen", messageId);
                System.out.print("SEEN ");
                System.out.print(receiver);
                System.out.println(messageId);
            }

        } else {
            // Aruncăm excepție dacă mesajul nu este găsit
            throw new EntityNotFoundException("Message not found");
        }
    }

    //Accesarea istoricului pt chatroom adica broadcast
    public List<Message> findChatRoomMessages() {
        return messageRepository.findAllChatRoomMessages();
    }
    // Trimiterea unui mesaj de broadcast către o listă de utilizatori
    public MessageDTO sendBroadcastMessage(MessageDTO messageDTO) {
        System.out.println(messageDTO);
        Message message = MessageBuilder.toEntity(messageDTO);
        message.setReceiver("ALL"); //setam pe all astfel incat sa nu le incaurca cu restul
        message.setTimestamp(LocalDateTime.now());
        message.setSeen(false);

        // Salvează mesajul în baza de date
        Message savedMessage = messageRepository.save(message);
        System.out.println(message);
        // Trimite mesajul către fiecare utilizator din lista de utilizatori

        messagingTemplate.convertAndSend( "/topic/messages", MessageBuilder.toMessageDTO(savedMessage));
        return MessageBuilder.toMessageDTO(savedMessage);
        //messagingTemplate.convertAndSend( "/topic/messages", MessageBuilder.toMessageDTO(savedMessage));
    }
}