// Variáveis globais
let isEditing = false;

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    console.log('=== INICIANDO PERFIL ===');
    console.log('Token no localStorage:', token ? 'Presente' : 'Ausente');
    console.log('User no localStorage:', user);

    if (!token) {
        console.log('Token não encontrado, redirecionando para login...');
        window.location.href = 'login.html';
        return;
    }

    // Inicializar navbar
    initNavbar();
    
    // Inicializar efeitos de partículas
    initParticles();
    
    // Configurar observador de interseção para animações ao rolar
    setupIntersectionObserver();
    
    // Carregar dados do usuário
    loadUserData();
    
    // Configurar eventos
    setupEventListeners();
});

// Inicializar funcionalidades da navbar
function initNavbar() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.innerHTML = navLinks.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
    }
    
    // Fechar menu ao clicar em um link (em dispositivos móveis)
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                if (navLinks) navLinks.classList.remove('active');
                if (menuToggle) menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });
}

// Inicializar partículas no background
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
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
                    value: 0.5,
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

// Configurar observador de interseção para animações ao rolar
function setupIntersectionObserver() {
    const sections = document.querySelectorAll('.profile-section, .side-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animar cards individualmente com atrasos
                const cards = entry.target.querySelectorAll('.card');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.animation = `slideInUp 0.6s ease-out ${index * 0.1}s both`;
                    }, 100);
                });
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Carregar dados do usuário da API
async function loadUserData() {
    const token = localStorage.getItem('token');
    
    try {
        console.log('Carregando dados do usuário...');
        console.log('Token:', token);
        
        const response = await fetch('/api/user/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Resposta da API - Status:', response.status);
        console.log('Resposta da API - Headers:', response.headers);

        if (response.ok) {
            const userData = await response.json();
            console.log('Dados do usuário recebidos (COMPLETO):', userData);
            console.log('Campos específicos:');
            console.log('- firstName:', userData.firstName);
            console.log('- lastName:', userData.lastName);
            console.log('- email:', userData.email);
            console.log('- objective:', userData.objective);
            
            // Preencher formulário com dados do usuário
            populateForm(userData);
            
            // Calcular e exibir IMC
            calculateIMC();
            
            // Atualizar navbar
            updateNavbar(userData);
            
            // Salvar dados no localStorage para uso offline (PRESERVANDO O ID)
            const currentUser = JSON.parse(localStorage.getItem('user')) || {};
            const updatedUser = { ...currentUser, ...userData };
            // Garantir que o ID não seja perdido
            if (currentUser.id && !updatedUser.id) {
                updatedUser.id = currentUser.id;
            }
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
        } else if (response.status === 401) {
            // Token inválido ou expirado
            console.log('Token inválido, redirecionando para login...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        } else {
            console.error('Erro ao carregar dados do usuário. Status:', response.status);
            const errorText = await response.text();
            console.error('Erro detalhado:', errorText);
            // Tentar carregar dados do localStorage como fallback
            loadFromLocalStorage();
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        // Tentar carregar dados do localStorage como fallback
        loadFromLocalStorage();
    }
}

// Carregar dados do localStorage (fallback)
function loadFromLocalStorage() {
    console.log('Carregando dados do localStorage...');
    const userData = JSON.parse(localStorage.getItem('user')) || {
        firstName: 'Usuário',
        lastName: 'BioMeta',
        email: 'usuario@biometa.com'
    };
    
    populateForm(userData);
    updateNavbar(userData);
    calculateIMC();
}

function populateForm(userData) {
    console.log('Preenchendo formulário com dados:', userData);
    
    // Preencher campos básicos
    document.getElementById('firstName').value = userData.firstName || '';
    document.getElementById('lastName').value = userData.lastName || '';
    document.getElementById('email').value = userData.email || '';
    
    // Data de nascimento
    if (userData.birthDate) {
        const birthDate = new Date(userData.birthDate);
        const formattedDate = birthDate.toISOString().split('T')[0];
        document.getElementById('birthDate').value = formattedDate;
        console.log('Data de nascimento formatada:', formattedDate);
    } else {
        document.getElementById('birthDate').value = '';
    }
    
    // Idade
    if (userData.age) {
        document.getElementById('age').value = `${userData.age} anos`;
    } else if (userData.birthDate) {
        const age = calculateAgeFromDate(userData.birthDate);
        document.getElementById('age').value = `${age} anos`;
    } else {
        document.getElementById('age').value = '';
    }
    
    // Gênero
    const genderSelect = document.getElementById('gender');
    if (userData.gender) {
        genderSelect.value = userData.gender;
        console.log('Gênero definido:', userData.gender);
    } else {
        genderSelect.value = '';
    }
    
    // Altura e Peso
    document.getElementById('height').value = userData.height || '';
    document.getElementById('weight').value = userData.weight || '';
    
    // OBJETIVO - Campo importante que adicionamos
    const objectiveSelect = document.getElementById('objective');
    if (userData.objective) {
        objectiveSelect.value = userData.objective;
        console.log('Objetivo definido:', userData.objective, 'Valor no select:', objectiveSelect.value);
        
        // Verificar se o valor foi realmente definido
        if (objectiveSelect.value !== userData.objective) {
            console.warn('AVISO: O objetivo não foi encontrado nas opções do select!');
            console.log('Opções disponíveis no select:');
            Array.from(objectiveSelect.options).forEach(option => {
                console.log(`- ${option.value}: ${option.text} ${option.selected ? '(SELECIONADA)' : ''}`);
            });
        }
    } else {
        objectiveSelect.value = '';
        console.log('Objetivo não encontrado nos dados');
    }
    
    // País
    const countrySelect = document.getElementById('country');
    if (userData.country) {
        countrySelect.value = userData.country;
        console.log('País definido:', userData.country);
    } else {
        countrySelect.value = '';
    }
    
    console.log('Formulário preenchido com sucesso!');
}

// Calcular idade a partir da data de nascimento
function calculateAgeFromDate(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

// Atualizar navbar com informações do usuário
function updateNavbar(userData) {
    const initials = (userData.firstName?.charAt(0) || 'U') + (userData.lastName?.charAt(0) || 'B');
    document.getElementById('navbarAvatar').textContent = initials;
    document.getElementById('navbarName').textContent = `${userData.firstName || 'Usuário'} ${userData.lastName || 'BioMeta'}`;
}

// Configurar event listeners
function setupEventListeners() {
    // Botão de editar perfil
    document.getElementById('editToggleBtn').addEventListener('click', toggleEditMode);
    
    // Botão de cancelar edição
    document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);
    
    // Formulário de perfil
    document.getElementById('profileForm').addEventListener('submit', saveProfile);
    
    // Botão de logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Campos que afetam o IMC
    document.getElementById('height').addEventListener('input', calculateIMC);
    document.getElementById('weight').addEventListener('input', calculateIMC);
    
    // Atualizar idade quando a data de nascimento mudar
    document.getElementById('birthDate').addEventListener('change', updateAgeFromBirthDate);
}

// Atualizar idade automaticamente quando a data de nascimento mudar
function updateAgeFromBirthDate() {
    const birthDate = document.getElementById('birthDate').value;
    if (birthDate) {
        const age = calculateAgeFromDate(birthDate);
        document.getElementById('age').value = `${age} anos`;
    }
}

// Função para fazer logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        // Limpar todos os dados de autenticação do localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirecionar para a página de login
        window.location.href = 'login.html';
    }
}

// Alternar modo de edição
function toggleEditMode() {
    const inputs = document.querySelectorAll('#profileForm input, #profileForm select');
    const isEditing = !inputs[0].disabled;
    
    if (isEditing) {
        // Sai do modo edição
        inputs.forEach(input => input.disabled = true);
        document.getElementById('editToggleBtn').innerHTML = '<i class="fas fa-edit"></i> Editar';
        document.getElementById('formActions').style.display = 'none';
        document.body.classList.remove('edit-mode');
    } else {
        // Entra no modo edição
        inputs.forEach(input => input.disabled = false);
        document.getElementById('email').disabled = true; // Email não pode ser editado
        document.getElementById('age').disabled = true; // Idade é calculada automaticamente
        document.getElementById('editToggleBtn').innerHTML = '<i class="fas fa-times"></i> Cancelar';
        document.getElementById('formActions').style.display = 'flex';
        document.body.classList.add('edit-mode');
    }
}

// Cancelar edição
function cancelEdit() {
    // Recarrega os dados originais
    loadUserData();
    
    // Desativa o modo de edição
    const inputs = document.querySelectorAll('#profileForm input, #profileForm select');
    inputs.forEach(input => input.disabled = true);
    document.getElementById('editToggleBtn').innerHTML = '<i class="fas fa-edit"></i> Editar';
    document.getElementById('formActions').style.display = 'none';
    document.body.classList.remove('edit-mode');
}

// Salvar perfil
async function saveProfile(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    
    // Coletar dados do formulário
    const userData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        birthDate: document.getElementById('birthDate').value,
        gender: document.getElementById('gender').value,
        height: document.getElementById('height').value ? parseFloat(document.getElementById('height').value) : null,
        weight: document.getElementById('weight').value ? parseFloat(document.getElementById('weight').value) : null,
        objective: document.getElementById('objective').value,
        country: document.getElementById('country').value
    };
    
    try {
        console.log('Enviando dados para atualização:', userData);
        const response = await fetch('/api/user/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const updatedUserData = await response.json();
            console.log('Perfil atualizado com sucesso:', updatedUserData);
            
            // Atualizar localStorage com dados atualizados do backend
            const currentUser = JSON.parse(localStorage.getItem('user')) || {};
            const updatedUser = { 
                ...currentUser, 
                ...updatedUserData,
                id: currentUser.id // Preservar o ID
            };
            
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Recalcular IMC
            calculateIMC();
            
            // Atualizar navbar
            updateNavbar(updatedUser);
            
            // Sair do modo edição
            toggleEditMode();
            
            // Feedback visual
            showSuccessMessage('Perfil atualizado com sucesso!');
            
        } else {
            const errorText = await response.text();
            throw new Error(errorText || 'Erro ao atualizar perfil');
        }
        
    } catch (error) {
        console.error('Erro ao salvar perfil:', error);
        alert('Erro ao salvar perfil. Tente novamente.');
    }
}

// Mostrar mensagem de sucesso
function showSuccessMessage(message) {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--success);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        font-weight: 600;
        z-index: 1000;
        animation: fadeInOut 2s ease-in-out;
    `;
    feedback.textContent = message;
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        document.body.removeChild(feedback);
    }, 2000);
}

// Calcular IMC
function calculateIMC() {
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    
    const height = parseFloat(heightInput.value);
    const weight = parseFloat(weightInput.value);
    
    if (height && weight && height > 0 && weight > 0) {
        // Detectar automaticamente se a altura está em metros ou cm
        let heightInMeters = height;
        if (height > 10) {
            // Se for maior que 10, assume que está em centímetros
            heightInMeters = height / 100;
        }

        // Calcular IMC
        const imc = weight / (heightInMeters * heightInMeters);
        const imcRounded = imc.toFixed(1);
        
        document.getElementById('imcValue').textContent = imcRounded;
        
        // Classificação do IMC
        let classification = '';
        let category = '';
        let recommendation = '';
        let scaleWidth = 0;
        let scaleColor = '';
        
        if (imc < 18.5) {
            classification = 'Abaixo do peso';
            category = 'abaixo do peso';
            recommendation = 'Consulte um nutricionista para uma avaliação completa.';
            scaleWidth = 25;
            scaleColor = '#3498db';
        } else if (imc < 25) {
            classification = 'Peso normal';
            category = 'peso normal';
            recommendation = 'Parabéns! Mantenha hábitos saudáveis.';
            scaleWidth = 50;
            scaleColor = '#2ecc71';
        } else if (imc < 30) {
            classification = 'Sobrepeso';
            category = 'sobrepeso';
            recommendation = 'Considere ajustes na alimentação e prática de exercícios.';
            scaleWidth = 75;
            scaleColor = '#f39c12';
        } else if (imc < 35) {
            classification = 'Obesidade Grau I';
            category = 'obesidade grau I';
            recommendation = 'Recomenda-se acompanhamento profissional.';
            scaleWidth = 87;
            scaleColor = '#e74c3c';
        } else if (imc < 40) {
            classification = 'Obesidade Grau II';
            category = 'obesidade grau II';
            recommendation = 'Busque orientação médica especializada.';
            scaleWidth = 94;
            scaleColor = '#c0392b';
        } else {
            classification = 'Obesidade Grau III';
            category = 'obesidade grau III';
            recommendation = 'Acompanhamento médico é essencial.';
            scaleWidth = 100;
            scaleColor = '#922b21';
        }
        
        document.getElementById('imcClassification').textContent = classification;
        document.getElementById('imcClassification').style.backgroundColor = scaleColor;
        document.getElementById('imcCategory').textContent = category;
        document.getElementById('imcRecommendation').textContent = recommendation;
        
        const scaleFill = document.getElementById('scaleFill');
        scaleFill.style.width = `${scaleWidth}%`;
        scaleFill.style.backgroundColor = scaleColor;
    } else {
        // Dados insuficientes
        document.getElementById('imcValue').textContent = '0.0';
        document.getElementById('imcClassification').textContent = 'Dados insuficientes';
        document.getElementById('imcClassification').style.backgroundColor = '#777';
        document.getElementById('imcCategory').textContent = 'indefinida';
        document.getElementById('imcRecommendation').textContent = 'Preencha altura e peso para calcular';
        
        const scaleFill = document.getElementById('scaleFill');
        scaleFill.style.width = `0%`;
        scaleFill.style.backgroundColor = '#777';
    }
}

// Adicionar animação CSS para o feedback
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -40%); }
        20% { opacity: 1; transform: translate(-50%, -50%); }
        80% { opacity: 1; transform: translate(-50%, -50%); }
        100% { opacity: 0; transform: translate(-50%, -60%); }
    }
`;
document.head.appendChild(style);