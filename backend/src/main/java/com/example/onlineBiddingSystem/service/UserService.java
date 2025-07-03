package com.example.onlineBiddingSystem.service;

import com.example.onlineBiddingSystem.model.PasswordResetToken;
import com.example.onlineBiddingSystem.model.User;
import com.example.onlineBiddingSystem.repo.PasswordResetTokenRepository;
import com.example.onlineBiddingSystem.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class UserService implements UserDetailsService {
    private final static String USER_NOT_FOUND_MSG = "user with email %s not found";

    @Autowired
    private PasswordResetTokenRepository passwordTokenRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private UserRepository repo;

    @Autowired
    private EmailValidator emailValidator;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    public UserService() {
    }

    public Map<String, String> register(RegistrationRequest request) {
        boolean isValidEmail = emailValidator.test(request.getEmail());
        if (!isValidEmail) {
            throw new IllegalStateException("email not valid");
        }
        String message = signUpUser(
                new User(request.getName(), request.getUsername(), request.getEmail(), request.getPassword()));
        return Collections.singletonMap("message", message);
    }

    public List<User> getAllUsers() {
        return repo.findAll();
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return repo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(String.format(USER_NOT_FOUND_MSG, email)));
    }

    public User getUserById(int id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    public String signUpUser(User user) {
        boolean userExists = repo
                .findByEmail(user.getEmail())
                .isPresent();

        if (userExists) {
            throw new IllegalStateException("email already taken");
        }

        // Encode password before saving
        String encodedPassword = bCryptPasswordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        repo.save(user);
        return "User registered successfully";
    }

    public User loginUser(String email, String password) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(String.format(USER_NOT_FOUND_MSG, email)));

        if (!bCryptPasswordEncoder.matches(password, user.getPassword())) {
            throw new IllegalStateException("Invalid password");
        }

        return user;
    }

    public User updateUser(int id, User updatedUser) {
        User existingUser = repo.findById(id)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        existingUser.setName(updatedUser.getName());
        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setEmail(updatedUser.getEmail());

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(bCryptPasswordEncoder.encode(updatedUser.getPassword()));
        }

        return repo.save(existingUser);
    }

    public void deleteUser(int id) {
        if (!repo.existsById(id)) {
            throw new IllegalStateException("User not found");
        }
        repo.deleteById(id);
    }

    public void createPasswordResetTokenForUser(String email) {
        User user = findUserByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Delete any existing tokens for this user
        PasswordResetToken existingToken = passwordTokenRepository.findByUser(user);
        if (existingToken != null) {
            passwordTokenRepository.delete(existingToken);
        }

        String token = UUID.randomUUID().toString();
        PasswordResetToken myToken = new PasswordResetToken(token, user);
        passwordTokenRepository.save(myToken);

        // Send email
        String resetUrl = "http://localhost:8080/reset-password?token=" + token;
        String message = "To reset your password, click the link: " + resetUrl;
        sendEmail(user.getEmail(), "Password Reset request", message);
    }

    private User findUserByEmail(String email) {
        return repo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(String.format(USER_NOT_FOUND_MSG, email)));
    }

    public void validatePasswordResetToken(String token) {
        PasswordResetToken passToken = passwordTokenRepository.findByToken(token);
        if (passToken == null) {
            throw new RuntimeException("Invalid Token");
        }

        if (passToken.isExpired()) {
            passwordTokenRepository.delete(passToken);
            throw new RuntimeException("Token expired");
        }
    }

    public void changeUserPassword(String token, String newPassword) {
        PasswordResetToken passToken = passwordTokenRepository.findByToken(token);
        if (passToken == null) {
            throw new RuntimeException("Invalid Token");
        }

        User user = passToken.getUser();
        user.setPassword(bCryptPasswordEncoder.encode(newPassword));
        repo.save(user);
        passwordTokenRepository.delete(passToken);
    }

    private void sendEmail(String to, String subject, String content) {
        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(to);
        email.setSubject(subject);
        email.setText(content);
        mailSender.send(email);
    }
}
