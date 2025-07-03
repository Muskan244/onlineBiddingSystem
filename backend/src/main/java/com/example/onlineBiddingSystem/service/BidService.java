package com.example.onlineBiddingSystem.service;

import com.example.onlineBiddingSystem.model.Bid;
import com.example.onlineBiddingSystem.model.Item;
import com.example.onlineBiddingSystem.model.User;
import com.example.onlineBiddingSystem.repo.BidRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BidService {
    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private ItemService itemService;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;

    /**
     * Place a bid on an item
     * 
     * @param itemId The ID of the item to bid on
     * @param userId The ID of the user placing the bid
     * @param amount The bid amount
     * @return The created bid
     * @throws IllegalStateException if the bid is invalid
     */
    public Bid placeBid(int itemId, int userId, Double amount) {
        // Get the item and user
        Item item = itemService.getItemById(itemId);
        User user = userService.getUserById(userId);

        // Validate the item exists
        if (item == null) {
            throw new IllegalStateException("Item not found");
        }

        // Validate the user exists
        if (user == null) {
            throw new IllegalStateException("User not found");
        }

        // Check if bidding has ended
        if (item.getAuctionEnded()) {
            throw new IllegalStateException("Bidding has ended for this item");
        }
        if (item.getBiddingEndTime() != null && item.getBiddingEndTime().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Bidding has ended for this item");
        }

        // Check if the user is the seller
        if (item.getSeller().getId() == userId) {
            throw new IllegalStateException("You cannot bid on your own item");
        }

        // Check if the bid amount is valid
        if (amount <= 0) {
            throw new IllegalStateException("Bid amount must be greater than zero");
        }

        // Check if the bid amount is greater than the current price
        if (item.getCurrentPrice() != null && amount <= item.getCurrentPrice()) {
            throw new IllegalStateException("Bid amount must be greater than the current price");
        }

        // If current price is null, check against starting price
        if (item.getCurrentPrice() == null && amount < item.getStartingPrice()) {
            throw new IllegalStateException("Bid amount must be at least the starting price");
        }

        // Create the bid
        Bid bid = new Bid();
        bid.setAmount(amount);
        bid.setBidTime(LocalDateTime.now());
        bid.setBidder(user);
        bid.setItem(item);

        // Update the item's current price
        item.setCurrentPrice(amount);
        itemService.updateProduct(itemId, item);

        // find the previous highest bid
        List<Bid> existingBids = item.getBids();
        Bid previousHighest = existingBids.stream()
                .max(java.util.Comparator.comparing(Bid::getAmount))
                .orElse(null);

        if (previousHighest != null && previousHighest.getBidder().getId() != userId) {
            String outbidMessage = String.format(
                    "You have been outbid on '%s'. The new highest bid is  ₹%.2f.",
                    item.getName(), amount);
            notificationService.createNotification(
                    previousHighest.getBidder(),
                    outbidMessage,
                    String.format("#/item/%d", item.getId()));
        }

        // Save and return the bid
        Bid savedBid = bidRepository.save(bid);

        // notify the seller
        String sellerMessage = String.format("A new bid of ₹%.2f has been placed on your item '%s'.", amount,
                item.getName());
        notificationService.createNotification(item.getSeller(), sellerMessage,
                String.format("#/item/%d", item.getId()));
        return savedBid;
    }

    /**
     * Get all bids for an item
     * 
     * @param itemId The ID of the item
     * @return List of bids for the item
     */
    public List<Bid> getBidsByItemId(int itemId) {
        Item item = itemService.getItemById(itemId);
        if (item == null) {
            throw new IllegalStateException("Item not found");
        }
        return item.getBids();
    }

    /**
     * Get all bids by a user
     * 
     * @param userId The ID of the user
     * @return List of bids made by the user
     */
    public List<Bid> getBidsByUserId(int userId) {
        User user = userService.getUserById(userId);
        if (user == null) {
            throw new IllegalStateException("User not found");
        }
        return user.getBids();
    }

    /**
     * Get a bid by its ID
     * 
     * @param bidId The ID of the bid
     * @return The bid with the given ID
     */
    public Bid getBidById(int bidId) {
        return bidRepository.findById(bidId).orElse(null);
    }
}