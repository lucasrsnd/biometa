````markdown
# BioMeta

**BioMeta** é uma aplicação web completa voltada para saúde, treinos e bem-estar! Ela foi criada para ajudar usuários a organizarem treinos, controlarem refeições, acompanharem a hidratação e manterem hábitos saudáveis, tudo em um só lugar.  

---

## 🔹 Funcionalidades

- **Autenticação segura** com registro e login via JWT;  
- **Dashboard completo** com visão geral de treinos, dieta e hidratação;  
- **Gestão de treinos** com fichas personalizadas e acompanhamento de progresso;  
- **Controle nutricional** com cálculo de calorias e metas diárias;  
- **Sistema de hidratação** com desafios gamificados e meta automática baseada no peso;  
- **Planejamento diário** com calendário, quadro Kanban e notas rápidas;  
- **Perfil do usuário** com cálculo automático de IMC e sincronização em tempo real.  

---

## 🛠 Tecnologias Utilizadas

**Frontend**:  
- HTML5, CSS3, JavaScript (ES6+);  
- Efeitos visuais com Particles.js;  
- Ícones com Font Awesome;  
- Layout responsivo usando CSS Grid e Flexbox.  

**Backend**:  
- Java com Spring Boot;  
- Spring Security + JWT para autenticação;  
- Spring Data JPA para persistência;  
- BCrypt para criptografia de senhas.  

**Banco de Dados & Hospedagem**:  
- Supabase (PostgreSQL);  
- Frontend: Vercel;  
- Fullstack: Netlify;  
- Backend: Render.  

---

## 🌐 Acessar o Projeto

- **Somente Frontend (Vercel)**: [Clique aqui](https://biometa.vercel.app)  
- **Fullstack (Render)**: [Clique aqui](https://biogoal.netlify.app/) *(pode apresentar cold start no primeiro acesso)*  

---

## 🚀 Como Rodar Localmente

1. Clone este repositório:  
```bash
git clone https://github.com/seu-usuario/BioMeta.git
````

2. Entre na pasta do backend e configure o banco de dados no `application.properties` ou `application.yml`.
3. Execute a aplicação Spring Boot:

```bash
./mvnw spring-boot:run
```

4. Para o frontend, abra o arquivo `index.html` no navegador ou rode um servidor local de sua preferência.

> Certifique-se de que o backend esteja rodando para funcionalidades completas (login, cadastro, dashboard, etc).

---

## 📌 Contato

Para dúvidas, sugestões ou feedback, entre em contato comigo!

---

**BioMeta** — Sua rotina saudável em um só lugar! 💪🍎💧

