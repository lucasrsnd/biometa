package com.biometa.dto;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private String firstName;
    private String lastName;
    private String email;
    private Long id; // Novo campo para o ID do usuário

    public AuthResponse(String token, String firstName, String lastName, String email, Long id) {
        this.token = token;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.id = id;
    }

    // Getters e Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
}