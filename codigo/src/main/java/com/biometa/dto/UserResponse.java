package com.biometa.dto;

import java.time.LocalDate;

public class UserResponse {
    private String firstName;
    private String lastName;
    private String email;
    private LocalDate birthDate;
    private Integer age;
    private String gender;
    private Double height;
    private Double weight;
    private String country;
    
    // NOVO CAMPO ADICIONADO
    private String objective;

    public UserResponse(String firstName, String lastName, String email) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }

    public UserResponse(String firstName, String lastName, String email, 
                       LocalDate birthDate, Integer age, String gender, 
                       Double height, Double weight, String country, String objective) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.birthDate = birthDate;
        this.age = age;
        this.gender = gender;
        this.height = height;
        this.weight = weight;
        this.country = country;
        this.objective = objective;
    }

    // Getters e Setters
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }
    
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    
    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }
    
    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
    
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    
    // NOVO GETTER E SETTER
    public String getObjective() { return objective; }
    public void setObjective(String objective) { this.objective = objective; }
}