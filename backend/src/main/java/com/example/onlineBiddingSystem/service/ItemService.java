package com.example.onlineBiddingSystem.service;

import com.example.onlineBiddingSystem.model.Bid;
import com.example.onlineBiddingSystem.model.Item;
import com.example.onlineBiddingSystem.model.User;
import com.example.onlineBiddingSystem.repo.ItemRepository;
import com.example.onlineBiddingSystem.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ItemService {
    @Autowired
    private ItemRepository repo;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public Item addItem(Item item) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        // --- TEMPORARY DEBUGGING ---
        System.out.println("Attempting to find user by email from token: '" + username + "'");
        // --- END TEMPORARY DEBUGGING ---

        User seller = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException(
                        "Authenticated user not found in database. Username from token: " + username));
        item.setSeller(seller);

        item.setCurrentPrice(item.getStartingPrice());
        return repo.save(item);
    }

    public List<Item> getAllItems() {
        // Check for ended auctions before returning items
        checkEndedAuctions();
        return repo.findAll();
    }

    public Item updateProduct(int id, Item item) {
        Item existing = repo.findById(id).orElseThrow(() -> new RuntimeException("Item not found"));
        existing.setName(item.getName());
        existing.setDescription(item.getDescription());
        existing.setStartingPrice(item.getStartingPrice());
        existing.setBiddingEndTime(item.getBiddingEndTime());
        // existing.setImageUrl(updatedItem.getImageUrl());
        return repo.save(existing);
    }

    public Item getItemById(int id) {
        // Check for ended auctions before returning item
        checkEndedAuctions();
        return repo.findById(id).orElse(null);
    }

    public void deleteItem(int id) {
        repo.deleteById(id);
    }

    /**
     * Check for ended auctions and update their status
     * This method is called when items are loaded
     */
    private void checkEndedAuctions() {
        List<Item> activeItems = repo.findAll().stream()
                .filter(item -> !item.getAuctionEnded() && item.getBiddingEndTime() != null)
                .filter(item -> item.getBiddingEndTime().isBefore(LocalDateTime.now()))
                .collect(Collectors.toList());

        for (Item item : activeItems) {
            // Mark auction as ended
            item.setAuctionEnded(true);
            repo.save(item);

            // Get the highest bid from the item's bids
            List<Bid> bids = item.getBids();
            if (!bids.isEmpty()) {
                Bid highestBid = bids.stream()
                        .max(Comparator.comparing(Bid::getAmount))
                        .orElse(null);

                if (highestBid != null) {
                    // Notify the winner
                    String winnerMessage = String.format(
                            "Congratulations! You won the auction for '%s' with a bid of ₹%.2f",
                            item.getName(),
                            highestBid.getAmount());
                    notificationService.createNotification(
                            highestBid.getBidder(),
                            winnerMessage,
                            String.format("#/item/%d", item.getId()));

                    // Notify the seller
                    String sellerMessage = String.format(
                            "Your auction for '%s' has ended. The winning bid was ₹%.2f",
                            item.getName(),
                            highestBid.getAmount());
                    notificationService.createNotification(
                            item.getSeller(),
                            sellerMessage,
                            String.format("#/item/%d", item.getId()));

                    // Notify all other bidders
                    List<User> allBidders = bids.stream()
                            .map(Bid::getBidder)
                            .distinct()
                            .filter(bidder -> bidder.getId() != highestBid.getBidder().getId())
                            .collect(Collectors.toList());

                    String otherBidderMessage = String.format(
                            "The auction for '%s' has ended. The winning bid was ₹%.2f.",
                            item.getName(), highestBid.getAmount());

                    for (User bidder : allBidders) {
                        notificationService.createNotification(
                                bidder,
                                otherBidderMessage,
                                String.format("#/item/%d", item.getId()));
                    }
                } else {
                    // Notify the seller if there were no bids
                    String noBidsMessage = String.format(
                            "Your auction for '%s' ended with no bids.",
                            item.getName());
                    notificationService.createNotification(
                            item.getSeller(),
                            noBidsMessage,
                            String.format("#/item/%d", item.getId()));
                }
            }
        }
    }
}
