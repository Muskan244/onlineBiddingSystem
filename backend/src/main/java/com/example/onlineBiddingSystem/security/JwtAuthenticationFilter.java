package com.example.onlineBiddingSystem.security;

import com.example.onlineBiddingSystem.model.User;
import com.example.onlineBiddingSystem.service.UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;

        // Debug logging
        System.out.println("[JWT Filter] Authorization header: " + authHeader);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            System.out.println("[JWT Filter] JWT token: " + jwt);
            try {
                username = jwtUtil.extractUsername(jwt);
                System.out.println("[JWT Filter] Extracted username: " + username);
            } catch (Exception e) {
                System.out.println("[JWT Filter] Failed to extract username: " + e.getMessage());
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println("[JWT Filter] Username found: " + username + ". Loading user details.");
            try {
                UserDetails userDetails = userService.loadUserByUsername(username);
                System.out.println("[JWT Filter] UserDetails loaded: " + userDetails.getUsername() + ", Enabled: "
                        + userDetails.isEnabled() + ", Locked: " + !userDetails.isAccountNonLocked());

                if (jwtUtil.validateToken(jwt, userDetails)) {
                    System.out.println("[JWT Filter] Token is valid. Setting authentication context.");
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("[JWT Filter] Authentication context set successfully.");
                } else {
                    System.out.println("[JWT Filter] Token validation failed.");
                }
            } catch (Exception e) {
                System.out.println("[JWT Filter] Exception while processing token: " + e.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }
}