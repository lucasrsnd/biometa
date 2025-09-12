document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados do usuário
    loadUserData();
    
    // Configurar eventos
    setupEventListeners();
    
    // Calcular IMC inicial
    calculateIMC();
});

// Carregar dados do usuário
function loadUserData() {
    // Em uma implementação real, buscaria os dados da API
    const userData = JSON.parse(localStorage.getItem('user')) || {
        firstName: 'João',
        lastName: 'Carlos',
        email: 'joao@email.com',
        birthDate: '1992-05-15',
        gender: 'Masculino',
        height: 175,
        weight: 78.5,
        objective: 'manter',
        country: 'Brasil'
    };
    
    // Preencher formulário com dados do usuário
    document.getElementById('firstName').value = userData.firstName;
    document.getElementById('lastName').value = userData.lastName;
    document.getElementById('email').value = userData.email;
    document.getElementById('birthDate').value = userData.birthDate;
    document.getElementById('gender').value = userData.gender;
    document.getElementById('height').value = userData.height;
    document.getElementById('weight').value = userData.weight;
    document.getElementById('objective').value = userData.objective;
    document.getElementById('country').value = userData.country;
    
    // Calcular e exibir idade
    calculateAge(userData.birthDate);
    
    // Atualizar navbar
    updateNavbar(userData);
}

// Calcular idade a partir da data de nascimento
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    document.getElementById('age').value = `${age} anos`;
    return age;
}

// Atualizar navbar com informações do usuário
function updateNavbar(userData) {
    const initials = userData.firstName.charAt(0) + userData.lastName.charAt(0);
    document.getElementById('navbarAvatar').textContent = initials;
    document.getElementById('navbarName').textContent = `${userData.firstName} ${userData.lastName}`;
}

// Configurar event listeners
function setupEventListeners() {
    // Botão de editar perfil
    document.getElementById('editToggleBtn').addEventListener('click', toggleEditMode);
    
    // Botão de cancelar edição
    document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);
    
    // Formulário de perfil
    document.getElementById('profileForm').addEventListener('submit', saveProfile);
    
    // Upload de imagem
    document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
    
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
function saveProfile(e) {
    e.preventDefault();
    
    // Coletar dados do formulário
    const userData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        birthDate: document.getElementById('birthDate').value,
        gender: document.getElementById('gender').value,
        height: parseFloat(document.getElementById('height').value),
        weight: parseFloat(document.getElementById('weight').value),
        objective: document.getElementById('objective').value,
        country: document.getElementById('country').value
    };
    
    // Em uma implementação real, enviaria para a API
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Recalcular idade e IMC
    calculateAge(userData.birthDate);
    calculateIMC();
    
    // Atualizar navbar
    updateNavbar(userData);
    
    // Sair do modo edição
    toggleEditMode();
    
    // Feedback para o usuário
    alert('Perfil atualizado com sucesso!');
}

// Manipular upload de imagem
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('profileImage').src = event.target.result;
            
            // Em uma implementação real, enviaria a imagem para o servidor
            console.log('Imagem carregada:', file.name);
        };
        reader.readAsDataURL(file);
    }
}

// Calcular IMC
function calculateIMC() {
    const height = parseFloat(document.getElementById('height').value) / 100; // converter cm para m
    const weight = parseFloat(document.getElementById('weight').value);
    
    if (height && weight) {
        const imc = weight / (height * height);
        const imcRounded = imc.toFixed(1);
        
        document.getElementById('imcValue').textContent = imcRounded;
        
        // Classificar IMC
        let classification = '';
        let category = '';
        let recommendation = '';
        let scaleWidth = 0;
        let scaleColor = '';
        
        if (imc < 18.5) {
            classification = 'Abaixo do peso';
            category = 'abaixo do peso';
            recommendation = 'ganhar massa muscular';
            scaleWidth = 25;
            scaleColor = '#3498db'; // Azul
        } else if (imc < 25) {
            classification = 'Peso normal';
            category = 'peso normal';
            recommendation = 'manter hábitos saudáveis';
            scaleWidth = 50;
            scaleColor = '#2ecc71'; // Verde
        } else if (imc < 30) {
            classification = 'Sobrepeso';
            category = 'sobrepeso';
            recommendation = 'perder alguns quilos';
            scaleWidth = 75;
            scaleColor = '#f39c12'; // Laranja
        } else {
            classification = 'Obesidade';
            category = 'obesidade';
            recommendation = 'consultar um especialista';
            scaleWidth = 100;
            scaleColor = '#e74c3c'; // Vermelho
        }
        
        document.getElementById('imcClassification').textContent = classification;
        document.getElementById('imcClassification').style.backgroundColor = scaleColor;
        document.getElementById('imcCategory').textContent = category;
        document.getElementById('imcRecommendation').textContent = recommendation;
        
        // Atualizar barra de escala
        const scaleFill = document.getElementById('scaleFill');
        scaleFill.style.width = `${scaleWidth}%`;
        scaleFill.style.backgroundColor = scaleColor;
    }
}