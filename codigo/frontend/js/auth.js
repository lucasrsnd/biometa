document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
    setupPasswordValidation();
    setupFormNavigation();
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginWithRetry); // MUDANÇA AQUI
  }

  // VERIFICAÇÃO DE AUTENTICAÇÃO ADICIONADA
  checkAuthenticationStatus();
});

// CONFIGURAÇÕES GLOBAIS ADICIONADAS
const BACKEND_URL = 'https://biometa.onrender.com';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// FUNÇÃO DE AQUECIMENTO DO BACKEND ADICIONADA
async function warmUpBackend() {
  try {
    await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    console.log('✅ Backend aquecido e pronto');
  } catch (error) {
    console.log('⚠️ Backend em cold start, primeiras tentativas podem falhar');
  }
}

// SISTEMA DE VERIFICAÇÃO DE AUTENTICAÇÃO ADICIONADO
function checkAuthenticationStatus() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const currentPage = window.location.pathname.split('/').pop();

  console.log("=== VERIFICAÇÃO DE AUTENTICAÇÃO ===");
  console.log("Página atual:", currentPage);
  console.log("Token presente:", !!token);
  console.log("User presente:", !!user);

  // Se está na página inicial mas já está logado, redirecionar para dashboard
  if ((currentPage === 'index.html' || currentPage === '' || currentPage === '/') && token && user) {
    console.log("✅ Usuário já logado, redirecionando para dashboard...");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);
    return;
  }

  // Se está em página protegida mas não está logado, redirecionar para login
  const protectedPages = ['dashboard.html', 'treinos.html', 'dieta.html', 'hidratacao.html', 'perfil.html', 'planejamento.html'];
  if (protectedPages.includes(currentPage) && (!token || !user)) {
    console.log("❌ Usuário não logado, redirecionando para login...");
    window.location.href = "login.html";
    return;
  }

  // Se está na página de login mas já está logado, redirecionar para dashboard
  if (currentPage === 'login.html' && token && user) {
    console.log("✅ Usuário já logado na página de login, redirecionando...");
    window.location.href = "dashboard.html";
    return;
  }
}

// NOVA FUNÇÃO DE LOGIN COM RETRY (SUBSTITUI handleLogin)
async function handleLoginWithRetry(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showMessage("Por favor, preencha todos os campos.", "error");
    return;
  }

  // Aquecer o backend antes de tentar login
  await warmUpBackend();

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  
  // Estado de loading
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
  submitBtn.disabled = true;

  try {
    let success = false;
    
    // Tentar até 3 vezes com delay crescente
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      console.log(`🔧 Tentativa de login ${attempt}/${MAX_RETRIES}`);
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({ email, password }),
          signal: AbortSignal.timeout(15000) // 15 segundos de timeout
        });

        console.log(`📡 Resposta da tentativa ${attempt}:`, response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Login bem-sucedido! Dados:", data);
          
          // Validar dados recebidos
          if (!data.token || !data.id) {
            throw new Error("Dados incompletos recebidos do servidor");
          }

          // Limpar cache anterior
          clearUserCache();

          // Salvar dados de autenticação
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify({
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
          }));

          console.log("=== DADOS SALVOS NO LOCALSTORAGE ===");
          console.log("Token salvo:", data.token ? "SIM" : "NÃO");
          console.log("User ID:", data.id);
          console.log("Redirecionando para dashboard...");

          success = true;
          
          // Redirecionar com pequeno delay para garantir que dados foram salvos
          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 500);
          
          break;
        } else {
          const errorText = await response.text();
          console.error(`❌ Erro HTTP ${response.status}:`, errorText);
          
          if (response.status === 401) {
            throw new Error("E-mail ou senha incorretos");
          } else {
            throw new Error(`Erro do servidor: ${response.status} - ${errorText}`);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Tentativa ${attempt} falhou:`, error.message);
        
        if (attempt === MAX_RETRIES) {
          // Última tentativa, lançar erro final
          if (error.name === 'AbortError') {
            throw new Error("Tempo de conexão excedido. O servidor pode estar iniciando. Tente novamente em alguns segundos.");
          } else if (error.message.includes("Failed to fetch")) {
            throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
          } else {
            throw error;
          }
        }
        
        // Aguardar antes da próxima tentativa (2, 4, 6 segundos)
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Tentativa ${attempt + 1}/${MAX_RETRIES}...`;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }
    }
    
    if (!success) {
      throw new Error('Não foi possível conectar após várias tentativas');
    }
  } catch (error) {
    console.error('❌ Erro final no login:', error);
    showMessage(error.message, "error");
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// FUNÇÃO handleRegister ATUALIZADA COM RETRY
async function handleRegister(e) {
  e.preventDefault();
  console.log("Iniciando cadastro...");

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
  const objective = document.getElementById("objective").value;

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
    objective: objective || null,
  };

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
  submitBtn.disabled = true;

  try {
    let success = false;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`📤 Tentativa de cadastro ${attempt}/${MAX_RETRIES}`);
        
        const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
          signal: AbortSignal.timeout(15000)
        });

        console.log("Resposta do cadastro:", response.status);

        if (response.ok) {
          console.log("✅ Cadastro realizado com sucesso!");
          showMessage(
            "Cadastro realizado com sucesso! Redirecionando para login...",
            "success"
          );

          setTimeout(() => {
            window.location.href = "login.html";
          }, 2000);
          
          success = true;
          break;
        } else {
          const error = await response.text();
          console.log("Erro no cadastro:", error);
          throw new Error(error);
        }
      } catch (error) {
        console.warn(`Tentativa ${attempt} falhou:`, error.message);
        
        if (attempt === MAX_RETRIES) throw error;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }
    }
    
    if (!success) {
      throw new Error('Não foi possível completar o cadastro após várias tentativas');
    }
  } catch (error) {
    console.log("Erro de conexão:", error);
    showMessage(error.message, "error");
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// FUNÇÃO clearUserCache CORRIGIDA
function clearUserCache() {
  console.log("🧹 Limpando cache do usuário anterior...");

  const allKeys = Object.keys(localStorage);
  const preserveKeys = ["token", "user"];

  allKeys.forEach((key) => {
    if (!preserveKeys.includes(key)) {
      localStorage.removeItem(key);
      console.log("Removido:", key);
    }
  });

  console.log("✅ Limpeza completa!");
}

// FUNÇÃO checkAuthAndRedirect ADICIONADA (para outras páginas)
function checkAuthAndRedirect() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const currentPage = window.location.pathname.split('/').pop();

  console.log("=== VERIFICAÇÃO DE ACESSO ===");
  console.log("Página:", currentPage);
  console.log("Token:", !!token);
  console.log("User:", !!user);

  // Lista de páginas que requerem autenticação
  const protectedPages = ['dashboard.html', 'treinos.html', 'dieta.html', 'hidratacao.html', 'perfil.html', 'planejamento.html'];
  
  // Se está em página protegida e não está autenticado
  if (protectedPages.includes(currentPage)) {
    if (!token || !user) {
      console.log("❌ Acesso negado, redirecionando para login...");
      window.location.href = "login.html";
      return false;
    }
    console.log("✅ Acesso permitido");
    return true;
  }

  // Se está na página de login mas já está autenticado
  if (currentPage === 'login.html' && token && user) {
    console.log("✅ Usuário já autenticado, redirecionando para dashboard...");
    window.location.href = "dashboard.html";
    return false;
  }

  // Se está na página inicial mas já está autenticado
  if ((currentPage === 'index.html' || currentPage === '' || currentPage === '/') && token && user) {
    console.log("✅ Usuário autenticado na página inicial, redirecionando...");
    window.location.href = "dashboard.html";
    return false;
  }

  return true;
}

// ========== FUNÇÕES EXISTENTES (MANTIDAS) ==========

window.getCurrentUserId = function () {
  const user = JSON.parse(localStorage.getItem("user"));
  return user ? user.id : null;
};

window.getUserKey = function (key) {
  const userId = getCurrentUserId();
  return userId ? `${key}_${userId}` : key;
};

console.log("=== CONFIGURAÇÃO GLOBAL ===");
console.log("User ID:", getCurrentUserId());
console.log("Workouts key:", getUserKey("workouts"));

function setupFormNavigation() {
  document.querySelectorAll(".btn-next").forEach((btn) => {
    btn.addEventListener("click", function () {
      const nextSection = parseInt(this.dataset.next);
      showSection(nextSection);
    });
  });

  document.querySelectorAll(".btn-prev").forEach((btn) => {
    btn.addEventListener("click", function () {
      const prevSection = parseInt(this.dataset.prev);
      showSection(prevSection);
    });
  });
}

function showSection(sectionNumber) {
  document.querySelectorAll(".form-section").forEach((section) => {
    section.classList.remove("active");
  });

  const targetSection = document.getElementById(`section-${sectionNumber}`);
  if (targetSection) {
    targetSection.classList.add("active");
    updateProgressVisual(sectionNumber);
  }
}

function updateProgressVisual(sectionNumber) {
  const progressFill = document.getElementById("progressFill");
  const totalSections = 3;
  const progress = (sectionNumber / totalSections) * 100;

  if (progressFill) {
    progressFill.style.width = `${progress}%`;
  }

  document.querySelectorAll(".progress-step").forEach((step, index) => {
    const stepNumber = index + 1;
    step.classList.remove("active", "completed");

    if (stepNumber === sectionNumber) {
      step.classList.add("active");
    } else if (stepNumber < sectionNumber) {
      step.classList.add("completed");
    }
  });
}

function setupPasswordValidation() {
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const submitBtn = document.getElementById("submitBtn");

  if (passwordInput) {
    passwordInput.addEventListener("input", validatePassword);
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", validatePasswordConfirmation);
  }
}

function validatePassword() {
  const password = document.getElementById("password").value;
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%&*]/.test(password),
  };

  updateRequirement("req-length", requirements.length);
  updateRequirement("req-uppercase", requirements.uppercase);
  updateRequirement("req-lowercase", requirements.lowercase);
  updateRequirement("req-number", requirements.number);
  updateRequirement("req-special", requirements.special);

  updateStrengthBar(requirements);

  validatePasswordConfirmation();

  updateSubmitButton(requirements);
}

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

function updateStrengthBar(requirements) {
  const strengthBar = document.getElementById("strengthBar");
  if (!strengthBar) {
    console.warn("Elemento strengthBar não encontrado");
    return;
  }

  const validRequirements = Object.values(requirements).filter(Boolean).length;

  strengthBar.className = "strength-bar";

  strengthBar.classList.remove("strength-weak", "strength-medium", "strength-strong");

  if (validRequirements <= 2) {
    strengthBar.classList.add("strength-weak");
  } else if (validRequirements <= 4) {
    strengthBar.classList.add("strength-medium");
  } else {
    strengthBar.classList.add("strength-strong");
  }

  updateStrengthFill(validRequirements);
}

function updateStrengthFill(validRequirements) {
  const strengthFill = document.getElementById("strengthFill");
  if (!strengthFill) return;

  const totalRequirements = 5;
  const percentage = (validRequirements / totalRequirements) * 100;

  strengthFill.style.width = `${percentage}%`;

  if (validRequirements <= 2) {
    strengthFill.style.background = "#e74c3c";
  } else if (validRequirements <= 4) {
    strengthFill.style.background = "#f39c12";
  } else {
    strengthFill.style.background = "#2ecc71";
  }
}

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

function updateSubmitButton(requirements) {
  const submitBtn = document.getElementById("submitBtn");
  if (!submitBtn) return;

  const allValid = Object.values(requirements).every(Boolean) && validatePasswordConfirmation();

  if (allValid) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}

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

function showMessage(message, type = "error") {
  const errorElement = document.getElementById("errorMessage");
  const successElement = document.getElementById("successMessage");

  if (errorElement) {
    errorElement.textContent = "";
    errorElement.classList.add("message-hidden");
  }
  if (successElement) {
    successElement.textContent = "";
    successElement.classList.add("message-hidden");
  }

  const targetElement = type === "error" ? errorElement : successElement;

  if (targetElement) {
    targetElement.textContent = message;
    targetElement.classList.remove("message-hidden");

    if (type === "error") {
      setTimeout(() => {
        targetElement.classList.add("message-hidden");
      }, 5000);
    }
  }
}

// FUNÇÃO ORIGINAL handleLogin (MANTIDA COMO BACKUP, MAS NÃO USADA)
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showMessage("Por favor, preencha todos os campos.", "error");
    return;
  }

  try {
    const response = await fetch("https://biometa.onrender.com/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();

      clearUserCache();

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
        showMessage(
          "E-mail ou senha incorretos. Verifique suas credenciais.",
          "error"
        );
      } else if (response.status === 400) {
        showMessage(
          "Dados inválidos. Verifique as informações fornecidas.",
          "error"
        );
      } else {
        showMessage(
          errorText || "Erro ao fazer login. Tente novamente.",
          "error"
        );
      }
    }
  } catch (error) {
    showMessage(
      "Erro de conexão. Verifique sua internet e tente novamente.",
      "error"
    );
  }
}