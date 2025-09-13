package com.biometa.controller;

import com.biometa.dto.NutritionRequest;
import com.biometa.dto.NutritionResponse;
import com.biometa.service.NutritionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/nutrition")
public class NutritionController {
    
    @Autowired
    private NutritionService nutritionService;
    
    @PostMapping("/calculate")
    public ResponseEntity<NutritionResponse> calculateNutrition(@Valid @RequestBody NutritionRequest request) {
        try {
            NutritionResponse response = nutritionService.calculateNutrition(request.getDescription());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}