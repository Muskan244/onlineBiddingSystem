package com.example.onlineBiddingSystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // for auto generation of id
    private int id;

    private String name;
    private String username;
    private String email;

    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;
    private Boolean locked = false;  // Default to false
    private Boolean enabled = true;  // Default to true

    @OneToMany(mappedBy = "seller", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Item> items;

    @OneToMany(mappedBy = "bidder", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Bid> bids;

    // a new constructor for registration
    public User(String name, String username, String email, String password) {
        this.name = name;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = UserRole.valueOf("USER");
        this.locked = false;
        this.enabled = false;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        UserRole userRole = Optional.ofNullable(role).orElse(UserRole.BIDDER);
        return List.of(new SimpleGrantedAuthority("ROLE_" + userRole.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !Boolean.TRUE.equals(locked);  // Prevent NullPointerException
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(enabled);  // Prevent NullPointerException
    }
}
