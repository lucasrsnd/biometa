package com.biometa.dto;

import java.time.LocalDate;

public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private LocalDate birthDate;
    private String gender;
    private Double height;
    private Double weight;
    private String country;

    // Getters e Setters
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }
    
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    
    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }
    
    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
    
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
}