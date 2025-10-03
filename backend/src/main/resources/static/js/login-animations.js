// Variáveis globais
let isPasswordVisible = false;

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar partículas
    initParticles();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Verificar se há credenciais salvas
    checkSavedCredentials();
});

// Inicializar partículas no background
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 40, density: { enable: true, value_area: 800 } },
                color: { value: "#6c63ff" },
                shape: { type: "circle" },
                opacity: { value: 0.2, random: true },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 120,
                    color: "#6c63ff",
                    opacity: 0.1,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 0.8,
                    direction: "none",
                    random: true
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "grab" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                }
            },
            retina_detect: true
        });
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Toggle de visibilidade da senha
    document.getElementById('togglePassword').addEventListener('click', togglePasswordVisibility);
    
    // Submissão do formulário
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    // Validação em tempo real
    document.getElementById('email').addEventListener('input', validateEmail);
    document.getElementById('password').addEventListener('input', validatePassword);
    
    // Botões de login social
    document.querySelectorAll('.btn-social').forEach(btn => {
        btn.addEventListener('click', function() {
            showMessage('Login social em desenvolvimento!', 'error', 3000);
        });
    });
}

// Alternar visibilidade da senha
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('togglePassword').querySelector('i');
    
    isPasswordVisible = !isPasswordVisible;
    passwordInput.type = isPasswordVisible ? 'text' : 'password';
    toggleIcon.className = isPasswordVisible ? 'fas fa-eye-slash' : 'fas fa-eye';
    passwordInput.focus();
}

// Validar email
function validateEmail() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    emailInput.classList.remove('valid', 'invalid');
    
    if (email && emailRegex.test(email)) {
        emailInput.classList.add('valid');
        return true;
    } else if (email) {
        emailInput.classList.add('invalid');
        return false;
    }
    return false;
}

// Validar senha
function validatePassword() {
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value;
    
    passwordInput.classList.remove('valid', 'invalid');
    
    if (password && password.length >= 6) {
        passwordInput.classList.add('valid');
        return true;
    } else if (password) {
        passwordInput.classList.add('invalid');
        return false;
    }
    return false;
}

// Verificar credenciais salvas
function checkSavedCredentials() {
    const savedEmail = localStorage.getItem('savedEmail');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && rememberMe) {
        document.getElementById('email').value = savedEmail;
        document.getElementById('rememberMe').checked = true;
    }
}

// Manipular login
function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const submitBtn = document.querySelector('#loginForm .btn');
    const originalText = submitBtn.innerHTML;
    
    if (!validateEmail() || !validatePassword()) {
        showMessage('Preencha todos os campos corretamente.', 'error');
        return;
    }
    
    // Loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    submitBtn.disabled = true;
    
    // Salvar credenciais
    if (rememberMe) {
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('rememberMe', 'true');
    } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('rememberMe');
    }
    
    // Simular login
    setTimeout(() => {
        showMessage('Login realizado com sucesso!', 'success');
        
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            // window.location.href = 'dashboard.html'; // Descomente para redirecionar
        }, 2000);
    }, 1500);
}

// Mostrar mensagens
function showMessage(message, type = 'error', duration = 4000) {
    const errorElement = document.getElementById('errorMessage');
    const successElement = document.getElementById('successMessage');
    
    errorElement.classList.add('message-hidden');
    successElement.classList.add('message-hidden');
    
    const targetElement = type === 'error' ? errorElement : successElement;
    targetElement.textContent = message;
    targetElement.classList.remove('message-hidden');
    
    if (duration > 0) {
        setTimeout(() => {
            targetElement.classList.add('message-hidden');
        }, duration);
    }
}