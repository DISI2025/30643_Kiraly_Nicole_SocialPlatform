package org.example.socialplatform.controller;

import org.example.socialplatform.dto.MessageDTO;
import org.example.socialplatform.entity.Message;
import org.example.socialplatform.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping(value = "/chat")
public class MessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public MessageController(MessageService messageService, SimpMessagingTemplate messagingTemplate) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    // Endpoint pentru marcare mesaj ca "seen"
    @MessageMapping("/mark-seen")
    public void markMessageAsSeen(Map<String, String> seenInfo) {
        System.out.print("Notificare de seen pentru  ");
        System.out.println(seenInfo.get("receiver"));
        System.out.println(seenInfo.get("seenMessageId"));
        String seenMessageId = seenInfo.get("seenMessageId");
        String receiver = seenInfo.get("receiver");
        // Apelează service-ul pentru a marca mesajul ca "seen"
        messageService.markMessageAsSeen(Long.valueOf(seenMessageId), receiver);


        // Trimite notificarea către expeditor că mesajul a fost văzut
        //messagingTemplate.convertAndSendToUser(messageDTO.getSender(), "/queue/seen", messageDTO.getId());
    }

    // Endpoint pentru trimiterea unui mesaj one-to-one
    @MessageMapping("/send-message")
    public void sendMessageToUser(MessageDTO messageDTO) {
        messageService.sendMessageToUser(messageDTO);
    }

    @MessageMapping("/send-typing")
    public void sendMessageToUser(@Payload Map<String, String> typingInfo) {
        String typingPerson = typingInfo.get("typingPerson");
        String receiver = typingInfo.get("receiver");
        boolean isTyping = Boolean.parseBoolean(typingInfo.get("isTyping")); // Adăugăm logica pentru a verifica dacă utilizatorul scrie

        System.out.println(typingPerson);
        System.out.println(receiver);
        System.out.println("Is typing: " + isTyping);
        messageService.sendTyping(typingPerson, receiver, isTyping);
    }




    // Endpoint pentru trimiterea unui mesaj de broadcast către o listă de utilizatori
    @MessageMapping("/send-broadcast")
    public void sendBroadcastMessage(MessageDTO messageDTO) {
        messageService.sendBroadcastMessage(messageDTO);
    }

    @GetMapping("/messages/{senderName}/{reciverName}")
    public ResponseEntity<List<Message>> findChatMessages(@PathVariable String senderName,
                                                          @PathVariable String reciverName) {
        return ResponseEntity
                .ok(messageService.findChatMessages(senderName, reciverName));
    }

    @GetMapping("/messages/chatroom")
    public ResponseEntity<List<Message>> findChatroomMessages() {
        return ResponseEntity
                .ok(messageService.findChatRoomMessages());
    }
}

