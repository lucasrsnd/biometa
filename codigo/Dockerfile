# Imagem base com Java 17
FROM eclipse-temurin:17-jdk-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia todos os arquivos do projeto para dentro do container
COPY . .

# Compila o projeto e gera o jar
RUN ./mvnw clean package -DskipTests

# Expõe a porta que o Spring Boot usa
EXPOSE 8080

# Comando para rodar a aplicação
CMD ["java", "-jar", "target/biometa-1.0.0.jar"]
