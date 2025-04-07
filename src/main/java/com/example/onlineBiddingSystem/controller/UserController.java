package com.example.onlineBiddingSystem.controller;

import com.example.onlineBiddingSystem.model.User;
import com.example.onlineBiddingSystem.service.RegistrationRequest;
import com.example.onlineBiddingSystem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService service;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegistrationRequest request) {
        Map<String, String> message = service.register(request);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestParam String email, @RequestParam String password) {
        try {
            User user = service.loginUser(email, password);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<User> getProfile(@PathVariable("id") int id) {
        try {
            User user = service.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<User> updateProfile(@PathVariable("id") int id, @RequestBody User updatedUser) {
        try {
            User user = service.updateUser(id, updatedUser);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
