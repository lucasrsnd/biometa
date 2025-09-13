package com.biometa.service;

import com.biometa.dto.NutritionResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class NutritionService {

    private static final Logger logger = LoggerFactory.getLogger(NutritionService.class);

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${openai.api.url}")
    private String openaiApiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public NutritionService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public NutritionResponse calculateNutrition(String description) {
        // Verificar se a chave da API está configurada
        if (openaiApiKey == null || openaiApiKey.isEmpty() || openaiApiKey.equals("your-openai-api-key-here")) {
            logger.warn("OpenAI API key não configurada. Usando dados simulados.");
            return simulateNutritionCalculation(description);
        }

        try {
            // Prompt enviado para a IA
            String prompt = String.format(
                "Forneça as calorias, proteínas, carboidratos e gorduras de \"%s\". " +
                "Responda SOMENTE com um JSON no formato: " +
                "{\"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number}. " +
                "Use valores aproximados e se não souber algum valor, use 0.",
                description
            );

            // Corpo da requisição
            String requestBody = String.format(
                "{\"model\": \"gpt-3.5-turbo\", \"messages\": [{\"role\": \"user\", \"content\": \"%s\"}], \"max_tokens\": 150}",
                prompt.replace("\"", "\\\"")
            );

            logger.debug("Enviando requisição para OpenAI: {}", description);

            // Cabeçalhos HTTP
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey.trim());

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            // Chamada para a API da OpenAI
            ResponseEntity<String> response = restTemplate.exchange(
                openaiApiUrl,
                HttpMethod.POST,
                entity,
                String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                logger.error("Erro na resposta da OpenAI: {}", response.getStatusCode());
                return simulateNutritionCalculation(description);
            }

            // Extrair resposta
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode choices = root.path("choices");
            
            if (choices.isEmpty()) {
                logger.error("Resposta da OpenAI sem choices");
                return simulateNutritionCalculation(description);
            }

            String content = choices.get(0).path("message").path("content").asText().trim();
            logger.debug("Resposta da OpenAI: {}", content);

            // Limpar a resposta - remover markdown code blocks se existirem
            content = content.replace("```json", "").replace("```", "").trim();

            // Transformar o JSON retornado em NutritionResponse
            try {
                return objectMapper.readValue(content, NutritionResponse.class);
            } catch (Exception e) {
                logger.error("Erro ao parsear JSON da OpenAI: {}", content, e);
                return simulateNutritionCalculation(description);
            }

        } catch (Exception e) {
            logger.error("Erro ao calcular informações nutricionais para: {}", description, e);
            return simulateNutritionCalculation(description);
        }
    }

    // Método de simulação para desenvolvimento
    private NutritionResponse simulateNutritionCalculation(String description) {
        logger.info("Usando dados simulados para: {}", description);
        
        // Simulação baseada em descrições comuns
        description = description.toLowerCase();
        
        if (description.contains("biscoito") || description.contains("bolacha") || description.contains("maizena")) {
            return new NutritionResponse(80, 1.5, 12.0, 3.5);
        } else if (description.contains("arroz")) {
            return new NutritionResponse(130, 2.7, 28.0, 0.3);
        } else if (description.contains("feijão")) {
            return new NutritionResponse(115, 7.5, 20.0, 0.5);
        } else if (description.contains("frango")) {
            return new NutritionResponse(165, 31.0, 0.0, 3.6);
        } else if (description.contains("carne")) {
            return new NutritionResponse(250, 26.0, 0.0, 15.0);
        } else if (description.contains("ovo")) {
            return new NutritionResponse(78, 6.3, 0.6, 5.3);
        } else if (description.contains("leite")) {
            return new NutritionResponse(61, 3.2, 4.8, 3.3);
        } else if (description.contains("pão")) {
            return new NutritionResponse(79, 3.1, 13.0, 1.1);
        } else if (description.contains("macarrão") || description.contains("massa")) {
            return new NutritionResponse(131, 4.5, 25.0, 1.1);
        } else if (description.contains("banana")) {
            return new NutritionResponse(89, 1.1, 22.8, 0.3);
        } else if (description.contains("maçã")) {
            return new NutritionResponse(52, 0.3, 14.0, 0.2);
        } else if (description.contains("laranja")) {
            return new NutritionResponse(43, 0.9, 11.0, 0.1);
        } else if (description.contains("queijo")) {
            return new NutritionResponse(110, 7.0, 1.0, 9.0);
        } else if (description.contains("peixe")) {
            return new NutritionResponse(120, 22.0, 0.0, 3.0);
        } else if (description.contains("batata")) {
            return new NutritionResponse(77, 2.0, 17.0, 0.1);
        } else {
            // Valores padrão para alimentos não reconhecidos (baseado em alimento médio)
            return new NutritionResponse(150, 5.0, 20.0, 6.0);
        }
    }
}