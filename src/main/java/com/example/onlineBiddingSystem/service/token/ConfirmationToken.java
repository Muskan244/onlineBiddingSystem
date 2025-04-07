package com.example.onlineBiddingSystem.service.token;

import com.example.onlineBiddingSystem.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConfirmationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // for auto generation of id
    private Long id;

    @Column(nullable = false)
    private String token;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private LocalDateTime confirmedAt;

    @ManyToOne
    @JoinColumn(nullable = false, name = "user_id")
    private User user;
}
