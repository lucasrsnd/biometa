package com.biometa.controller;

import java.time.LocalDate;
import java.time.Period;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.biometa.dto.UpdateUserRequest;
import com.biometa.dto.UserResponse;
import com.biometa.model.User;
import com.biometa.repository.UserRepository;
import com.biometa.security.CustomUserDetails;

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
                user.getCountry(),
                user.getObjective()  // NOVO CAMPO ADICIONADO
        );
        
        return ResponseEntity.ok(userResponse);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@RequestBody UpdateUserRequest updateRequest, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Optional<User> userOptional = userRepository.findByEmail(userDetails.getUsername());
        
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOptional.get();

        if (updateRequest.getFirstName() != null) {
            user.setFirstName(updateRequest.getFirstName());
        }
        if (updateRequest.getLastName() != null) {
            user.setLastName(updateRequest.getLastName());
        }
        if (updateRequest.getBirthDate() != null) {
            user.setBirthDate(updateRequest.getBirthDate());
        }
        if (updateRequest.getGender() != null) {
            user.setGender(updateRequest.getGender());
        }
        if (updateRequest.getHeight() != null) {
            user.setHeight(updateRequest.getHeight());
        }
        if (updateRequest.getWeight() != null) {
            user.setWeight(updateRequest.getWeight());
        }
        if (updateRequest.getCountry() != null) {
            user.setCountry(updateRequest.getCountry());
        }
        // NOVA LINHA ADICIONADA - ATUALIZAR OBJETIVO
        if (updateRequest.getObjective() != null) {
            user.setObjective(updateRequest.getObjective());
        }
        
        User updatedUser = userRepository.save(user);

        Integer age = null;
        if (updatedUser.getBirthDate() != null) {
            age = Period.between(updatedUser.getBirthDate(), LocalDate.now()).getYears();
        }
        
        UserResponse userResponse = new UserResponse(
                updatedUser.getFirstName(), 
                updatedUser.getLastName(), 
                updatedUser.getEmail(),
                updatedUser.getBirthDate(),
                age,
                updatedUser.getGender(),
                updatedUser.getHeight(),
                updatedUser.getWeight(),
                updatedUser.getCountry(),
                updatedUser.getObjective()  // NOVO CAMPO ADICIONADO
        );
        
        return ResponseEntity.ok(userResponse);
    }
}