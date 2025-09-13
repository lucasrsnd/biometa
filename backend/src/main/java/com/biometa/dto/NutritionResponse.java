package com.biometa.dto;

public class NutritionResponse {
    private double calories;
    private double protein;
    private double carbs;
    private double fat;
    
    // Construtores
    public NutritionResponse() {}
    
    public NutritionResponse(double calories, double protein, double carbs, double fat) {
        this.calories = calories;
        this.protein = protein;
        this.carbs = carbs;
        this.fat = fat;
    }
    
    // Getters e Setters
    public double getCalories() { return calories; }
    public void setCalories(double calories) { this.calories = calories; }
    
    public double getProtein() { return protein; }
    public void setProtein(double protein) { this.protein = protein; }
    
    public double getCarbs() { return carbs; }
    public void setCarbs(double carbs) { this.carbs = carbs; }
    
    public double getFat() { return fat; }
    public void setFat(double fat) { this.fat = fat; }
}