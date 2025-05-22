package org.example.socialplatform.dto;

import org.example.socialplatform.entity.Message;

public class MessageBuilder {
    public static MessageDTO toMessageDTO(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .content(message.getContent())
                .sender(message.getSender())
                .receiver(message.getReceiver())
                .timestamp(message.getTimestamp())
                .seen(message.isSeen())
                .build();
    }

    public static Message toEntity(MessageDTO messageDTO){
        return Message.builder()
                .id(messageDTO.getId())
                .content(messageDTO.getContent())
                .sender(messageDTO.getSender())
                .receiver(messageDTO.getReceiver())
                .timestamp(messageDTO.getTimestamp())
                .seen(messageDTO.isSeen())
                .build();
    }
}
