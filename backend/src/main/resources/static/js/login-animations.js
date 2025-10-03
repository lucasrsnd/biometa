// Variáveis globais
let isPasswordVisible = false;

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar partículas
    initParticles();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Inicializar animações
    initAnimations();
    
    // Verificar se há credenciais salvas
    checkSavedCredentials();
});

// Inicializar partículas no background
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 50,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: "#6c63ff"
                },
                shape: {
                    type: "circle",
                    stroke: {
                        width: 0,
                        color: "#000000"
                    }
                },
                opacity: {
                    value: 0.3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#6c63ff",
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: true,
                        mode: "grab"
                    },
                    onclick: {
                        enable: true,
                        mode: "push"
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.5
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
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
    
    // Botões de login social (apenas demonstração)
    document.querySelectorAll('.btn-social').forEach(btn => {
        btn.addEventListener('click', function() {
            showMessage('Funcionalidade em desenvolvimento!', 'error');
        });
    });
    
    // Lembrar de mim
    document.getElementById('rememberMe').addEventListener('change', function() {
        if (this.checked) {
            showMessage('Credenciais serão lembradas neste dispositivo', 'success', 3000);
        }
    });
}

// Inicializar animações
function initAnimations() {
    animateFloatingElements();
    animateStats();
}

// Animar elementos flutuantes
function animateFloatingElements() {
    const elements = document.querySelectorAll('.floating-element');
    
    elements.forEach((element, index) => {
        const delay = index * 0.5;
        element.style.animationDelay = `${delay}s`;
    });
}

// Animar estatísticas
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const finalValue = parseInt(stat.textContent);
        let currentValue = 0;
        const duration = 2000;
        const increment = finalValue / (duration / 16);
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                stat.textContent = stat.textContent; // Mantém o valor original
                clearInterval(timer);
            } else {
                stat.textContent = Math.floor(currentValue);
            }
        }, 16);
    });
}

// Alternar visibilidade da senha
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('togglePassword').querySelector('i');
    
    isPasswordVisible = !isPasswordVisible;
    
    if (isPasswordVisible) {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
    
    // Feedback visual
    passwordInput.focus();
}

// Validar email em tempo real
function validateEmail() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    
    emailInput.classList.remove('valid', 'invalid');
    
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
            emailInput.classList.add('valid');
            return true;
        } else {
            emailInput.classList.add('invalid');
            return false;
        }
    }
    
    return false;
}

// Validar senha em tempo real
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
        document.getElementById('password').focus();
    }
}

// Manipular login
function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const submitBtn = document.querySelector('#loginForm .btn');
    const originalText = submitBtn.innerHTML;
    
    // Validação básica
    if (!validateEmail() || !validatePassword()) {
        showMessage('Por favor, preencha todos os campos corretamente.', 'error');
        return;
    }
    
    // Simular loading
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    submitBtn.disabled = true;
    
    // Salvar credenciais se "Lembrar de mim" estiver marcado
    if (rememberMe) {
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('rememberMe', 'true');
    } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('rememberMe');
    }
    
    // Simular requisição de login
    setTimeout(() => {
        // Aqui você integraria com seu backend de autenticação
        // Por enquanto, vamos simular um login bem-sucedido
        
        showMessage('Login realizado com sucesso! Redirecionando...', 'success');
        
        // Simular redirecionamento para o dashboard
        setTimeout(() => {
            // Em um cenário real, você redirecionaria após autenticação bem-sucedida
            // window.location.href = 'dashboard.html';
            
            // Para demonstração, vamos resetar o formulário
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Mostrar mensagem de demonstração
            showMessage('Em um cenário real, você seria redirecionado para o dashboard.', 'success', 5000);
            
        }, 2000);
        
    }, 2000);
}

// Mostrar mensagens
function showMessage(message, type = 'error', duration = 5000) {
    const errorElement = document.getElementById('errorMessage');
    const successElement = document.getElementById('successMessage');
    
    // Esconder todas as mensagens primeiro
    errorElement.classList.add('message-hidden');
    successElement.classList.add('message-hidden');
    
    // Mostrar mensagem apropriada
    if (type === 'error') {
        errorElement.textContent = message;
        errorElement.classList.remove('message-hidden');
    } else {
        successElement.textContent = message;
        successElement.classList.remove('message-hidden');
    }
    
    // Scroll para a mensagem
    const messageElement = type === 'error' ? errorElement : successElement;
    messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Auto-esconder após o tempo especificado
    if (duration > 0) {
        setTimeout(() => {
            messageElement.classList.add('message-hidden');
        }, duration);
    }
}

// Efeito de digitação no placeholder (opcional)
function initTypingEffect() {
    const emailInput = document.getElementById('email');
    const placeholders = [
        'seu@email.com',
        'exemplo@provedor.com',
        'nome.sobrenome@email.com'
    ];
    let currentIndex = 0;
    let currentText = '';
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
        const fullText = placeholders[currentIndex];
        
        if (isDeleting) {
            currentText = fullText.substring(0, currentText.length - 1);
        } else {
            currentText = fullText.substring(0, currentText.length + 1);
        }
        
        emailInput.placeholder = currentText;
        
        let typeSpeed = typingSpeed;
        
        if (isDeleting) {
            typeSpeed /= 2;
        }
        
        if (!isDeleting && currentText === fullText) {
            typeSpeed = 2000; // Pausa no final
            isDeleting = true;
        } else if (isDeleting && currentText === '') {
            isDeleting = false;
            currentIndex = (currentIndex + 1) % placeholders.length;
            typeSpeed = 500; // Pausa antes de começar novo texto
        }
        
        setTimeout(type, typeSpeed);
    }
    
    // Iniciar efeito apenas se o input estiver vazio
    if (!emailInput.value) {
        setTimeout(type, 1000);
    }
}

// Inicializar efeito de digitação quando a página carregar
setTimeout(initTypingEffect, 2000);