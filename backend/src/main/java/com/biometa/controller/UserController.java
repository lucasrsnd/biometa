package com.biometa.controller;

import com.biometa.dto.UserResponse;
import com.biometa.model.User;
import com.biometa.repository.UserRepository;
import com.biometa.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.Period;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserController {
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Optional<User> userOptional = userRepository.findByEmail(userDetails.getUsername());
        
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOptional.get();
        
        // Calcular idade a partir da data de nascimento
        Integer age = null;
        if (user.getBirthDate() != null) {
            age = Period.between(user.getBirthDate(), LocalDate.now()).getYears();
        }
        
        UserResponse userResponse = new UserResponse(
                user.getFirstName(), 
                user.getLastName(), 
                user.getEmail(),
                user.getBirthDate(),
                age,
                user.getGender(),
                user.getHeight(),
                user.getWeight(),
                user.getCountry()
        );
        
        return ResponseEntity.ok(userResponse);
    }
}