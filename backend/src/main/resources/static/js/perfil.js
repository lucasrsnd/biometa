document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário está autenticado
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Carregar dados do usuário da API
    loadUserData();
    
    // Configurar eventos
    setupEventListeners();
});

// Carregar dados do usuário da API
async function loadUserData() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/user/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const userData = await response.json();
            
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
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        } else {
            console.error('Erro ao carregar dados do usuário:', response.status);
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
    const userData = JSON.parse(localStorage.getItem('user')) || {
        firstName: 'Usuário',
        lastName: 'BioMeta',
        email: 'usuario@biometa.com'
    };
    
    populateForm(userData);
    updateNavbar(userData);
}

// Preencher formulário com dados do usuário
function populateForm(userData) {
    document.getElementById('firstName').value = userData.firstName || '';
    document.getElementById('lastName').value = userData.lastName || '';
    document.getElementById('email').value = userData.email || '';
    
    // Formatando a data para o input type="date" (YYYY-MM-DD)
    if (userData.birthDate) {
        const birthDate = new Date(userData.birthDate);
        const formattedDate = birthDate.toISOString().split('T')[0];
        document.getElementById('birthDate').value = formattedDate;
    } else {
        document.getElementById('birthDate').value = '';
    }
    
    // Idade (se veio do backend) ou calcular se temos data de nascimento
    if (userData.age) {
        document.getElementById('age').value = `${userData.age} anos`;
    } else if (userData.birthDate) {
        const age = calculateAgeFromDate(userData.birthDate);
        document.getElementById('age').value = `${age} anos`;
    } else {
        document.getElementById('age').value = '';
    }
    
    document.getElementById('gender').value = userData.gender || '';
    document.getElementById('height').value = userData.height || '';
    document.getElementById('weight').value = userData.weight || '';
    document.getElementById('country').value = userData.country || '';
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
    
    // Campos que afetam o IMC
    document.getElementById('height').addEventListener('input', calculateIMC);
    document.getElementById('weight').addEventListener('input', calculateIMC);
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
    } else {
        // Entra no modo edição
        inputs.forEach(input => input.disabled = false);
        document.getElementById('email').disabled = true; // Email não pode ser editado
        document.getElementById('age').disabled = true; // Idade é calculada automaticamente
        document.getElementById('editToggleBtn').innerHTML = '<i class="fas fa-times"></i> Cancelar';
        document.getElementById('formActions').style.display = 'flex';
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
        country: document.getElementById('country').value
    };
    
    try {
        // Em uma implementação real, enviaria para a API
        // Por enquanto, vamos apenas atualizar o localStorage PRESERVANDO O ID
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        const updatedUser = { 
            ...currentUser, 
            ...userData,
            // GARANTIR QUE O ID NÃO SEJA PERDIDO
            id: currentUser.id
        };
        
        // Recalcular idade
        if (userData.birthDate) {
            updatedUser.age = calculateAgeFromDate(userData.birthDate);
        }
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Recalcular IMC
        calculateIMC();
        
        // Atualizar navbar
        updateNavbar(updatedUser);
        
        // Sair do modo edição
        toggleEditMode();
        
        // Feedback para o usuário
        alert('Perfil atualizado com sucesso! (Alterações salvas localmente)');
        
    } catch (error) {
        console.error('Erro ao salvar perfil:', error);
        alert('Erro ao salvar perfil. Tente novamente.');
    }
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
            recommendation = 'O IMC pode não refletir a realidade de pessoas com muita massa muscular. Considere também medir percentual de gordura corporal.';
            scaleWidth = 25;
            scaleColor = '#3498db';
        } else if (imc < 25) {
            classification = 'Peso normal';
            category = 'peso normal';
            recommendation = 'O IMC pode não refletir a realidade de pessoas com muita massa muscular. Considere também medir percentual de gordura corporal.';
            scaleWidth = 50;
            scaleColor = '#2ecc71';
        } else if (imc < 30) {
            classification = 'Sobrepeso';
            category = 'sobrepeso';
            recommendation = 'O IMC pode não refletir a realidade de pessoas com muita massa muscular. Considere também medir percentual de gordura corporal.';
            scaleWidth = 75;
            scaleColor = '#f39c12';
        } else if (imc < 35) {
            classification = 'Obesidade Grau I';
            category = 'obesidade grau I';
            recommendation = 'O IMC pode não refletir a realidade de pessoas com muita massa muscular. Considere também medir percentual de gordura corporal.';
            scaleWidth = 87;
            scaleColor = '#e74c3c';
        } else if (imc < 40) {
            classification = 'Obesidade Grau II';
            category = 'obesidade grau II';
            recommendation = 'O IMC pode não refletir a realidade de pessoas com muita massa muscular. Considere também medir percentual de gordura corporal.';
            scaleWidth = 94;
            scaleColor = '#c0392b';
        } else {
            classification = 'Obesidade Grau III';
            category = 'obesidade grau III';
            recommendation = 'O IMC pode não refletir a realidade de pessoas com muita massa muscular. Considere também medir percentual de gordura corporal.';
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
        document.getElementById('imcRecommendation').textContent = 'preencher altura e peso';
        
        const scaleFill = document.getElementById('scaleFill');
        scaleFill.style.width = `0%`;
        scaleFill.style.backgroundColor = '#777';
    }
}