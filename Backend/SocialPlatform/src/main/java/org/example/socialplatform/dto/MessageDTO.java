package org.example.socialplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class MessageDTO {
    private Long id;
    private String content;
    private String sender;
    private String receiver;
    private LocalDateTime timestamp;
    private boolean seen;
}