package com.example.onlineBiddingSystem.repo;

import com.example.onlineBiddingSystem.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BidRepository extends JpaRepository<Bid, Integer> {
    
}
