package com.biometa.controller;

import com.biometa.dto.UserResponse;
import com.biometa.security.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserResponse userResponse = new UserResponse(
                userDetails.getFirstName(), 
                userDetails.getLastName(), 
                userDetails.getUsername());
        return ResponseEntity.ok(userResponse);
    }
}