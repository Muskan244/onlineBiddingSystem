package com.example.onlineBiddingSystem.controller;

import com.example.onlineBiddingSystem.model.Item;
import com.example.onlineBiddingSystem.service.ItemService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api")
public class ItemController {
    @Autowired
    private ItemService service;

    @GetMapping("/items")
    public List<Item> getAllItems() {
        return service.getAllItems();
    }

    @GetMapping("/csrf-token")
    public CsrfToken getCsrfToken(HttpServletRequest request) {
        return (CsrfToken) request.getAttribute("_csrf");
    }

    @PostMapping("/item")
    public ResponseEntity<?> addItem(@RequestBody Item item) {
        // System.out.println(item);
        try {
            Item item1 = service.addItem(item);
            return new ResponseEntity<>(item1, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/item/{id}")
    public ResponseEntity<String> updateItem(@PathVariable int id, @RequestBody Item item) {
        Item item1 = null;
        item1 = service.updateProduct(id, item);
        if (item1 != null) {
            return new ResponseEntity<>("updated", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("failed to update", HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/item/{id}")
    public ResponseEntity<String> deleteItem(@PathVariable int id) {
        Item item = service.getItemById(id);
        if (item != null) {
            service.deleteItem(id);
            return new ResponseEntity<>("deleted", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("item not found", HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/item/{id}")
    public ResponseEntity<Item> getItemById(@PathVariable("id") int id) {
        Item item = service.getItemById(id);
        if (item != null) {
            return new ResponseEntity<>(item, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/test-auth")
    public ResponseEntity<String> testAuth() {
        return ResponseEntity
                .ok("Authenticated as: " + SecurityContextHolder.getContext().getAuthentication().getName());
    }
}
