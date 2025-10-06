# Imagem base com Java 17
FROM eclipse-temurin:17-jdk-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas o pom.xml primeiro (para usar cache do Docker)
COPY pom.xml .

# Copia o Maven Wrapper e dá permissão de execução
COPY mvnw .
RUN chmod +x mvnw

# Copia a pasta src completa
COPY src ./src

# Copia outros arquivos necessários (opcional)
COPY . .

# Compila o projeto e gera o jar
RUN ./mvnw clean package -DskipTests

# Expõe a porta que o Spring Boot usa
EXPOSE 8080

# Comando para rodar a aplicação
CMD ["java", "-jar", "target/biometa-1.0.0.jar"]
