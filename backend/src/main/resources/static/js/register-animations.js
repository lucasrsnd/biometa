// Variáveis globais
let currentSection = 1;
const totalSections = 3;

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar partículas
    initParticles();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Inicializar validação de senha
    initPasswordValidation();
    
    // Mostrar primeira seção
    showSection(1);
});

// Inicializar partículas no background
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 60,
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
    // Botões de navegação
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', function() {
            const nextSection = parseInt(this.dataset.next);
            if (validateCurrentSection()) {
                showSection(nextSection);
            }
        });
    });
    
    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', function() {
            const prevSection = parseInt(this.dataset.prev);
            showSection(prevSection);
        });
    });
    
    // Validação em tempo real
    document.getElementById('confirmPassword').addEventListener('input', validatePasswordMatch);
    
    // Submissão do formulário
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmission();
    });
    
    // Validação de campos obrigatórios
    document.querySelectorAll('input[required], select[required]').forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', updateSubmitButton);
    });
}

// Mostrar seção específica
function showSection(sectionNumber) {
    // Esconder todas as seções
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar seção atual
    document.getElementById(`section-${sectionNumber}`).classList.add('active');
    
    // Atualizar progresso
    updateProgress(sectionNumber);
    
    // Atualizar variável global
    currentSection = sectionNumber;
    
    // Animar entrada da seção
    animateSectionEnter(sectionNumber);
}

// Atualizar barra de progresso
function updateProgress(sectionNumber) {
    const progressFill = document.getElementById('progressFill');
    const progress = (sectionNumber / totalSections) * 100;
    
    progressFill.style.width = `${progress}%`;
    
    // Atualizar steps
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

// Animar entrada da seção
function animateSectionEnter(sectionNumber) {
    const section = document.getElementById(`section-${sectionNumber}`);
    
    // Reset animation
    section.style.animation = 'none';
    setTimeout(() => {
        section.style.animation = 'fadeIn 0.5s ease-out';
    }, 10);
}

// Validar seção atual
function validateCurrentSection() {
    const currentSectionEl = document.getElementById(`section-${currentSection}`);
    const inputs = currentSectionEl.querySelectorAll('input[required], select[required]');
    
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showSectionError('Por favor, preencha todos os campos obrigatórios corretamente.');
    }
    
    return isValid;
}

// Validar campo individual
function validateField(eventOrElement) {
    const field = eventOrElement.target || eventOrElement;
    const value = field.value.trim();
    
    // Remover estilos anteriores
    field.classList.remove('valid', 'invalid');
    
    if (field.hasAttribute('required') && !value) {
        field.classList.add('invalid');
        return false;
    }
    
    // Validações específicas por tipo
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            field.classList.add('invalid');
            return false;
        }
    }
    
    if (field.id === 'password' && value) {
        if (!validatePasswordStrength(value)) {
            field.classList.add('invalid');
            return false;
        }
    }
    
    field.classList.add('valid');
    return true;
}

// Inicializar validação de senha
function initPasswordValidation() {
    const passwordInput = document.getElementById('password');
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        validatePasswordStrength(password);
        validatePasswordMatch();
        updateSubmitButton();
    });
}

// Validar força da senha
function validatePasswordStrength(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%&*]/.test(password)
    };
    
    let strength = 0;
    let fulfilled = 0;
    
    // Atualizar requisitos visuais
    Object.keys(requirements).forEach(req => {
        const element = document.getElementById(`req-${req}`);
        if (requirements[req]) {
            element.classList.add('valid');
            element.classList.remove('invalid');
            element.innerHTML = '<i class="fas fa-check"></i> ' + element.textContent.replace(/^.*?\) /, '');
            fulfilled++;
        } else {
            element.classList.add('invalid');
            element.classList.remove('valid');
            element.innerHTML = '<i class="fas fa-times"></i> ' + element.textContent.replace(/^.*?\) /, '');
        }
    });
    
    // Calcular força
    strength = Math.floor((fulfilled / Object.keys(requirements).length) * 100);
    updatePasswordStrength(strength);
    
    return fulfilled === Object.keys(requirements).length;
}

// Atualizar indicador de força da senha
function updatePasswordStrength(strength) {
    const strengthFill = document.getElementById('strengthFill');
    
    strengthFill.style.width = `${strength}%`;
    
    if (strength < 40) {
        strengthFill.style.background = '#e74c3c'; // Vermelho
    } else if (strength < 80) {
        strengthFill.style.background = '#f39c12'; // Laranja
    } else {
        strengthFill.style.background = '#2ecc71'; // Verde
    }
}

// Validar confirmação de senha
function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorElement = document.getElementById('confirmPasswordError');
    
    if (confirmPassword && password !== confirmPassword) {
        errorElement.style.display = 'flex';
        document.getElementById('confirmPassword').classList.add('invalid');
        return false;
    } else {
        errorElement.style.display = 'none';
        document.getElementById('confirmPassword').classList.remove('invalid');
        if (confirmPassword) {
            document.getElementById('confirmPassword').classList.add('valid');
        }
        return true;
    }
}

// Atualizar botão de envio
function updateSubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    
    // Verificar se todas as seções estão válidas
    let allValid = true;
    
    for (let i = 1; i <= totalSections; i++) {
        const section = document.getElementById(`section-${i}`);
        const inputs = section.querySelectorAll('input[required], select[required]');
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                allValid = false;
            }
        });
    }
    
    // Verificar senhas
    if (!validatePasswordMatch()) {
        allValid = false;
    }
    
    submitBtn.disabled = !allValid;
}

// Mostrar erro na seção
function showSectionError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.classList.remove('message-hidden');
    
    // Scroll para o erro
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Auto-esconder após 5 segundos
    setTimeout(() => {
        errorElement.classList.add('message-hidden');
    }, 5000);
}

// Mostrar sucesso
function showSuccess(message) {
    const successElement = document.getElementById('successMessage');
    successElement.textContent = message;
    successElement.classList.remove('message-hidden');
    
    // Scroll para o sucesso
    successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Manipular submissão do formulário (para demonstração)
function handleFormSubmission() {
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    // Simular loading
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando conta...';
    submitBtn.disabled = true;
    
    // Simular requisição
    setTimeout(() => {
        // Aqui você integraria com seu backend de autenticação
        showSuccess('Conta criada com sucesso! Redirecionando...');
        
        // Simular redirecionamento
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
    }, 2000);
}

// Animações dos elementos flutuantes
function animateFloatingElements() {
    const elements = document.querySelectorAll('.floating-element');
    
    elements.forEach((element, index) => {
        const delay = index * 0.5;
        element.style.animationDelay = `${delay}s`;
    });
}

// Inicializar animações dos elementos flutuantes
animateFloatingElements();