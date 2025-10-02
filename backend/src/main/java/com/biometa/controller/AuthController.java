package com.biometa.controller;

import com.biometa.dto.AuthRequest;
import com.biometa.dto.AuthResponse;
import com.biometa.dto.RegisterRequest;
import com.biometa.model.User;
import com.biometa.security.CustomUserDetails;
import com.biometa.security.JwtUtil;
import com.biometa.service.UserService;
import jakarta.validation.Valid;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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
        String password = registerRequest.getPassword();
        List<String> passwordErrors = validatePassword(password);

        if (!passwordErrors.isEmpty()) {
            String errorMessage = "Senha fraca: " + String.join(", ", passwordErrors);
            return ResponseEntity.badRequest().body(errorMessage);
        }

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

        User savedUser = userService.createUser(user);

        return ResponseEntity.status(HttpStatus.CREATED).body("Usuário registrado com sucesso!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequest authRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String jwt = jwtUtil.generateToken(userDetails);

            Optional<User> user = userService.findByEmail(userDetails.getUsername());
            
            if (user.isPresent()) {
                AuthResponse authResponse = new AuthResponse(
                    jwt, 
                    userDetails.getFirstName(), 
                    userDetails.getLastName(), 
                    userDetails.getUsername(),
                    user.get().getId()
                );
                return ResponseEntity.ok(authResponse);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não encontrado");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("E-mail ou senha incorretos");
        }
    }

    private List<String> validatePassword(String password) {
        List<String> errors = new ArrayList<>();

        if (password.length() < 8) {
            errors.add("mínimo 8 caracteres");
        }
        if (!password.matches(".*[A-Z].*")) {
            errors.add("pelo menos uma letra maiúscula");
        }
        if (!password.matches(".*[a-z].*")) {
            errors.add("pelo menos uma letra minúscula");
        }
        if (!password.matches(".*[0-9].*")) {
            errors.add("pelo menos um número");
        }
        if (!password.matches(".*[!@#$%&*].*")) {
            errors.add("pelo menos um caractere especial (!@#$%&*)");
        }

        return errors;
    }
}