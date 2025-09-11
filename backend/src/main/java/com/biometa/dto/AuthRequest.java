package com.biometa.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthRequest {
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    // Getters e Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}