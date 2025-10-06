// Funções para autenticação
document.addEventListener("DOMContentLoaded", function () {
  // Verificar se estamos na página de registro
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
    setupPasswordValidation();
    setupFormNavigation();
  }

  // Verificar se estamos na página de login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
});

// Configurar validação de senha em tempo real
function setupPasswordValidation() {
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const submitBtn = document.getElementById("submitBtn");

  if (passwordInput) {
    passwordInput.addEventListener("input", validatePassword);
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener(
      "input",
      validatePasswordConfirmation
    );
  }
}

// Configurar navegação do formulário
function setupFormNavigation() {
  document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', function() {
      const nextSection = parseInt(this.dataset.next);
      showSection(nextSection);
    });
  });
  
  document.querySelectorAll('.btn-prev').forEach(btn => {
    btn.addEventListener('click', function() {
      const prevSection = parseInt(this.dataset.prev);
      showSection(prevSection);
    });
  });
}

// Mostrar seção específica
function showSection(sectionNumber) {
  // Esconder todas as seções
  document.querySelectorAll('.form-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Mostrar seção atual
  const targetSection = document.getElementById(`section-${sectionNumber}`);
  if (targetSection) {
    targetSection.classList.add('active');
    updateProgressVisual(sectionNumber);
  }
}

// Atualizar barra de progresso visual
function updateProgressVisual(sectionNumber) {
  const progressFill = document.getElementById('progressFill');
  const totalSections = 3;
  const progress = (sectionNumber / totalSections) * 100;
  
  if (progressFill) {
    progressFill.style.width = `${progress}%`;
  }
  
  // Atualizar steps visuais
  document.querySelectorAll('.progress-step').forEach((step, index) => {
    const stepNumber = index + 1;
    step.classList.remove('active', 'completed');
    
    if (stepNumber === sectionNumber) {
      step.classList.add('active');
    } else if (stepNumber < sectionNumber) {
      step.classList.add('completed');
    }
  });
}

// Validar força da senha
// Validar força da senha
function validatePassword() {
  const password = document.getElementById("password").value;
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%&*]/.test(password),
  };

  // Atualizar indicadores visuais
  updateRequirement("req-length", requirements.length);
  updateRequirement("req-uppercase", requirements.uppercase);
  updateRequirement("req-lowercase", requirements.lowercase);
  updateRequirement("req-number", requirements.number);
  updateRequirement("req-special", requirements.special);

  // Atualizar barra de força
  updateStrengthBar(requirements);

  // Validar confirmação de senha também
  validatePasswordConfirmation();

  // Habilitar/desabilitar botão de submit
  updateSubmitButton(requirements);
}

// Atualizar indicador de requisito individual
function updateRequirement(elementId, isValid) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const icon = element.querySelector("i");
  if (!icon) return;

  if (isValid) {
    element.classList.remove("invalid");
    element.classList.add("valid");
    icon.className = "fas fa-check";
  } else {
    element.classList.remove("valid");
    element.classList.add("invalid");
    icon.className = "fas fa-times";
  }
}

// Atualizar barra de força da senha
// Atualizar barra de força da senha
function updateStrengthBar(requirements) {
  const strengthBar = document.getElementById("strengthBar");
  if (!strengthBar) {
    console.warn("Elemento strengthBar não encontrado");
    return;
  }
  
  const validRequirements = Object.values(requirements).filter(Boolean).length;

  // Resetar classes
  strengthBar.className = "strength-bar";
  
  // Remover classes anteriores
  strengthBar.classList.remove("strength-weak", "strength-medium", "strength-strong");
  
  // Adicionar classe baseada na força
  if (validRequirements <= 2) {
    strengthBar.classList.add("strength-weak");
  } else if (validRequirements <= 4) {
    strengthBar.classList.add("strength-medium");
  } else {
    strengthBar.classList.add("strength-strong");
  }
  
  // Atualizar também a barra de preenchimento visual
  updateStrengthFill(validRequirements);
}

// Atualizar preenchimento visual da barra de força
function updateStrengthFill(validRequirements) {
  const strengthFill = document.getElementById("strengthFill");
  if (!strengthFill) return;
  
  const totalRequirements = 5; // length, uppercase, lowercase, number, special
  const percentage = (validRequirements / totalRequirements) * 100;
  
  strengthFill.style.width = `${percentage}%`;
  
  // Cor baseada na força
  if (validRequirements <= 2) {
    strengthFill.style.background = '#e74c3c'; // Vermelho
  } else if (validRequirements <= 4) {
    strengthFill.style.background = '#f39c12'; // Laranja
  } else {
    strengthFill.style.background = '#2ecc71'; // Verde
  }
}

// Validar confirmação de senha
function validatePasswordConfirmation() {
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const errorElement = document.getElementById("confirmPasswordError");
  const confirmInput = document.getElementById("confirmPassword");

  if (!errorElement || !confirmInput) return false;

  if (confirmPassword && password !== confirmPassword) {
    errorElement.style.display = "block";
    confirmInput.classList.add("invalid");
    confirmInput.classList.remove("valid");
    return false;
  } else {
    errorElement.style.display = "none";
    if (confirmPassword) {
      confirmInput.classList.remove("invalid");
      confirmInput.classList.add("valid");
    } else {
      confirmInput.classList.remove("invalid", "valid");
    }
    return true;
  }
}

// Atualizar botão de submit
function updateSubmitButton(requirements) {
  const submitBtn = document.getElementById("submitBtn");
  if (!submitBtn) return;

  const allValid =
    Object.values(requirements).every(Boolean) &&
    validatePasswordConfirmation();

  if (allValid) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}

// Validar senha antes do envio
function validatePasswordBeforeSubmit() {
  const password = document.getElementById("password").value;
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%&*]/.test(password),
  };

  const allValid = Object.values(requirements).every(Boolean);
  const confirmationValid = validatePasswordConfirmation();

  return allValid && confirmationValid;
}

// Obter mensagens de erro detalhadas da senha
function getPasswordErrors(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push("A senha deve ter pelo menos 8 caracteres");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("A senha deve ter pelo menos uma letra maiúscula (A–Z)");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("A senha deve ter pelo menos uma letra minúscula (a–z)");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("A senha deve ter pelo menos um número (0–9)");
  }
  if (!/[!@#$%&*]/.test(password)) {
    errors.push("A senha deve ter pelo menos um caractere especial (!@#$%&*)");
  }

  return errors;
}

async function handleRegister(e) {
  e.preventDefault();
  console.log("Iniciando cadastro...");

  // Validar senha antes de enviar
  if (!validatePasswordBeforeSubmit()) {
    showMessage("Por favor, corrija os erros na senha antes de continuar.", "error");
    return;
  }

  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const gender = document.getElementById("gender").value;
  const birthDate = document.getElementById("birthDate").value;
  const country = document.getElementById("country").value;
  const height = document.getElementById("height").value;
  const weight = document.getElementById("weight").value;
  const objective = document.getElementById("objective").value; // NOVO CAMPO

  // Validação adicional para altura
  if (height) {
    const heightValue = parseFloat(height);
    if (heightValue < 0.5 || heightValue > 2.5) {
      showMessage("Altura deve estar entre 0.5m e 2.5m", "error");
      return;
    }
  }

  const userData = {
    firstName,
    lastName,
    email,
    password,
    gender,
    birthDate,
    country,
    height: height ? parseFloat(height) : null,
    weight: weight ? parseFloat(weight) : null,
    objective: objective || null // NOVO CAMPO ADICIONADO
  };

  try {
    console.log("Enviando dados para cadastro...", userData);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    console.log("Resposta do servidor:", response.status);

    if (response.ok) {
      console.log("Cadastro realizado com sucesso!");
      showMessage("Cadastro realizado com sucesso! Redirecionando para login...", "success");

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } else {
      const error = await response.text();
      console.log("Erro no cadastro:", error);
      showMessage(error, "error");
    }
  } catch (error) {
    console.log("Erro de conexão:", error);
    showMessage("Erro de conexão. Tente novamente.", "error");
  }
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showMessage("Por favor, preencha todos os campos.", "error");
    return;
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();

      // Salvar token e dados do usuário incluindo o ID
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        })
      );

      window.location.href = "dashboard.html";
    } else {
      const errorText = await response.text();

      if (response.status === 401) {
        showMessage("E-mail ou senha incorretos. Verifique suas credenciais.", "error");
      } else if (response.status === 400) {
        showMessage("Dados inválidos. Verifique as informações fornecidas.", "error");
      } else {
        showMessage(errorText || "Erro ao fazer login. Tente novamente.", "error");
      }
    }
  } catch (error) {
    showMessage("Erro de conexão. Verifique sua internet e tente novamente.", "error");
  }
}

// Função para mostrar mensagens
function showMessage(message, type = 'error') {
  const errorElement = document.getElementById('errorMessage');
  const successElement = document.getElementById('successMessage');

  // Esconder ambas as mensagens primeiro
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.add('message-hidden');
  }
  if (successElement) {
    successElement.textContent = '';
    successElement.classList.add('message-hidden');
  }

  const targetElement = type === 'error' ? errorElement : successElement;
  
  if (targetElement) {
    targetElement.textContent = message;
    targetElement.classList.remove('message-hidden');
    
    // Para mensagens de sucesso, manter visível
    // Para mensagens de erro, auto-esconder após 5 segundos
    if (type === 'error') {
      setTimeout(() => {
        targetElement.classList.add('message-hidden');
      }, 5000);
    }
  }
}