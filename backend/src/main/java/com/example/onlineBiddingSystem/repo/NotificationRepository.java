package com.example.onlineBiddingSystem.repo;

import com.example.onlineBiddingSystem.model.Notification;
import com.example.onlineBiddingSystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByTimestampDesc(User user);

    List<Notification> findByUserAndReadFalse(User user);
}