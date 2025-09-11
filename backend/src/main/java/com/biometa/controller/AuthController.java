package com.biometa.controller;

import com.biometa.dto.AuthRequest;
import com.biometa.dto.AuthResponse;
import com.biometa.dto.RegisterRequest;
import com.biometa.model.User;
import com.biometa.security.CustomUserDetails;
import com.biometa.security.JwtUtil;
import com.biometa.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userService.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Erro: Email já está em uso!");
        }

        User user = new User(registerRequest.getFirstName(), registerRequest.getLastName(), 
                            registerRequest.getEmail(), registerRequest.getPassword());
        user.setGender(registerRequest.getGender());
        user.setBirthDate(registerRequest.getBirthDate());
        user.setCountry(registerRequest.getCountry());
        user.setHeight(registerRequest.getHeight());
        user.setWeight(registerRequest.getWeight());

        userService.createUser(user);

        return ResponseEntity.status(HttpStatus.CREATED).body("Usuário registrado com sucesso!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String jwt = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(jwt, userDetails.getFirstName(), 
                userDetails.getLastName(), userDetails.getUsername()));
    }
}