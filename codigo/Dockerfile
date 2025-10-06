# Imagem base com Java 17
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Instala Maven no container
RUN apk add --no-cache maven bash git

# Copia apenas o pom.xml primeiro (melhor para cache)
COPY pom.xml .

# Copia a pasta src
COPY src ./src

# Build do projeto usando Maven já instalado
RUN mvn clean package -DskipTests

# Expõe a porta do Spring Boot
EXPOSE 8080

# Comando para rodar a aplicação
CMD ["java", "-jar", "target/biometa-1.0.0.jar"]
