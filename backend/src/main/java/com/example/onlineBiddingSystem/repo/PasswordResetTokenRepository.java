package com.example.onlineBiddingSystem.repo;

import com.example.onlineBiddingSystem.model.PasswordResetToken;
import com.example.onlineBiddingSystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    PasswordResetToken findByToken(String token);

    PasswordResetToken findByUser(User user);
}
