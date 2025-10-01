// Funções para autenticação
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        setupPasswordValidation();
    }

    // Verificar se estamos na página de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// Configurar validação de senha em tempo real
function setupPasswordValidation() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn = document.getElementById('submitBtn');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePassword);
    }
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordConfirmation);
    }
}

// Validar força da senha
function validatePassword() {
    const password = document.getElementById('password').value;
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%&*]/.test(password)
    };
    
    // Atualizar indicadores visuais
    updateRequirement('req-length', requirements.length);
    updateRequirement('req-uppercase', requirements.uppercase);
    updateRequirement('req-lowercase', requirements.lowercase);
    updateRequirement('req-number', requirements.number);
    updateRequirement('req-special', requirements.special);
    
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
    const icon = element.querySelector('i');
    
    if (isValid) {
        element.classList.remove('invalid');
        element.classList.add('valid');
        icon.className = 'fas fa-check';
    } else {
        element.classList.remove('valid');
        element.classList.add('invalid');
        icon.className = 'fas fa-times';
    }
}

// Atualizar barra de força da senha
function updateStrengthBar(requirements) {
    const strengthBar = document.getElementById('strengthBar');
    const validRequirements = Object.values(requirements).filter(Boolean).length;
    
    strengthBar.className = 'strength-bar';
    
    if (validRequirements <= 2) {
        strengthBar.classList.add('strength-weak');
    } else if (validRequirements <= 4) {
        strengthBar.classList.add('strength-medium');
    } else {
        strengthBar.classList.add('strength-strong');
    }
}

// Validar confirmação de senha
function validatePasswordConfirmation() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorElement = document.getElementById('confirmPasswordError');
    const confirmInput = document.getElementById('confirmPassword');
    
    if (confirmPassword && password !== confirmPassword) {
        errorElement.style.display = 'block';
        confirmInput.classList.add('invalid');
        confirmInput.classList.remove('valid');
        return false;
    } else {
        errorElement.style.display = 'none';
        if (confirmPassword) {
            confirmInput.classList.remove('invalid');
            confirmInput.classList.add('valid');
        } else {
            confirmInput.classList.remove('invalid', 'valid');
        }
        return true;
    }
}

// Atualizar botão de submit
function updateSubmitButton(requirements) {
    const submitBtn = document.getElementById('submitBtn');
    const allValid = Object.values(requirements).every(Boolean) && validatePasswordConfirmation();
    
    if (allValid) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
}

// Validar senha antes do envio
function validatePasswordBeforeSubmit() {
    const password = document.getElementById('password').value;
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%&*]/.test(password)
    };
    
    const allValid = Object.values(requirements).every(Boolean);
    const confirmationValid = validatePasswordConfirmation();
    
    return allValid && confirmationValid;
}

// Obter mensagens de erro detalhadas da senha
function getPasswordErrors(password) {
    const errors = [];
    
    if (password.length < 8) {
        errors.push('A senha deve ter pelo menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('A senha deve ter pelo menos uma letra maiúscula (A–Z)');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('A senha deve ter pelo menos uma letra minúscula (a–z)');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('A senha deve ter pelo menos um número (0–9)');
    }
    if (!/[!@#$%&*]/.test(password)) {
        errors.push('A senha deve ter pelo menos um caractere especial (!@#$%&*)');
    }
    
    return errors;
}

async function handleRegister(e) {
    e.preventDefault();
    
    // Validar senha antes de enviar
    if (!validatePasswordBeforeSubmit()) {
        document.getElementById('errorMessage').textContent = 'Por favor, corrija os erros na senha antes de continuar.';
        return;
    }
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const gender = document.getElementById('gender').value;
    const birthDate = document.getElementById('birthDate').value;
    const country = document.getElementById('country').value;
    const height = document.getElementById('height').value;
    const weight = document.getElementById('weight').value;

    // Validação adicional para altura
    if (height) {
        const heightValue = parseFloat(height);
        if (heightValue < 0.5 || heightValue > 2.5) {
            document.getElementById('errorMessage').textContent = 'Altura deve estar entre 0.5m e 2.5m';
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
        weight: weight ? parseFloat(weight) : null
    };

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            document.getElementById('successMessage').textContent = 'Cadastro realizado com sucesso! Redirecionando para login...';
            document.getElementById('errorMessage').textContent = '';
            
            // Redirecionar para login após 2 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            const error = await response.text();
            document.getElementById('errorMessage').textContent = error;
            document.getElementById('successMessage').textContent = '';
        }
    } catch (error) {
        document.getElementById('errorMessage').textContent = 'Erro de conexão. Tente novamente.';
        document.getElementById('successMessage').textContent = '';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        document.getElementById('errorMessage').textContent = 'Por favor, preencha todos os campos.';
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            
            // Salvar token e dados do usuário incluindo o ID
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                id: data.id, // GARANTIR QUE O ID SEJA SALVO
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email
            }));
            
            window.location.href = 'dashboard.html';
        } else {
            const errorText = await response.text();
            
            if (response.status === 401) {
                document.getElementById('errorMessage').textContent = 'E-mail ou senha incorretos. Verifique suas credenciais.';
            } else if (response.status === 400) {
                document.getElementById('errorMessage').textContent = 'Dados inválidos. Verifique as informações fornecidas.';
            } else {
                document.getElementById('errorMessage').textContent = errorText || 'Erro ao fazer login. Tente novamente.';
            }
        }
    } catch (error) {
        document.getElementById('errorMessage').textContent = 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
}