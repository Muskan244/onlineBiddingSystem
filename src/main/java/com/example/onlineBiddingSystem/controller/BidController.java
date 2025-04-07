package com.example.onlineBiddingSystem.controller;

import com.example.onlineBiddingSystem.model.Bid;
import com.example.onlineBiddingSystem.service.BidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bids")
public class BidController {
    
    @Autowired
    private BidService bidService;
    
    /**
     * Place a bid on an item
     * @param bidRequest Contains itemId, userId, and amount
     * @return The created bid or error message
     */
    @PostMapping("/place")
    public ResponseEntity<?> placeBid(@RequestBody BidRequest bidRequest) {
        try {
            Bid bid = bidService.placeBid(
                bidRequest.getItemId(), 
                bidRequest.getUserId(), 
                bidRequest.getAmount()
            );
            return ResponseEntity.ok(bid);
        } catch (IllegalStateException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "An unexpected error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get all bids for an item
     * @param itemId The ID of the item
     * @return List of bids for the item
     */
    @GetMapping("/item/{itemId}")
    public ResponseEntity<?> getBidsByItemId(@PathVariable("itemId") int itemId) {
        try {
            List<Bid> bids = bidService.getBidsByItemId(itemId);
            return ResponseEntity.ok(bids);
        } catch (IllegalStateException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "An unexpected error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get all bids by a user
     * @param userId The ID of the user
     * @return List of bids made by the user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getBidsByUserId(@PathVariable("userId") int userId) {
        try {
            List<Bid> bids = bidService.getBidsByUserId(userId);
            return ResponseEntity.ok(bids);
        } catch (IllegalStateException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "An unexpected error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get a bid by its ID
     * @param bidId The ID of the bid
     * @return The bid with the given ID
     */
    @GetMapping("/{bidId}")
    public ResponseEntity<?> getBidById(@PathVariable("bidId") int bidId) {
        Bid bid = bidService.getBidById(bidId);
        if (bid == null) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Bid not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        return ResponseEntity.ok(bid);
    }
    
    /**
     * Request class for placing bids
     */
    public static class BidRequest {
        private int itemId;
        private int userId;
        private Double amount;
        
        public BidRequest() {}
        
        public BidRequest(int itemId, int userId, Double amount) {
            this.itemId = itemId;
            this.userId = userId;
            this.amount = amount;
        }
        
        public int getItemId() {
            return itemId;
        }
        
        public void setItemId(int itemId) {
            this.itemId = itemId;
        }
        
        public int getUserId() {
            return userId;
        }
        
        public void setUserId(int userId) {
            this.userId = userId;
        }
        
        public Double getAmount() {
            return amount;
        }
        
        public void setAmount(Double amount) {
            this.amount = amount;
        }
    }
}