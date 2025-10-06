// Variáveis globais
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
        window.location.href = "login.html";
        return;
    }

    console.log(`=== CARREGANDO DADOS DO USUÁRIO ${user.id} ===`);

    // Carregar dados do usuário primeiro
    loadUserData();
    
    // Inicializar navbar
    initNavbar();
    
    // Inicializar efeitos de partículas
    initParticles();
    
    // Configurar observador de interseção para animações ao rolar
    setupIntersectionObserver();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Carregar fichas salvas
    loadSavedWorkouts();
    
    // Inicializar cronômetro
    resetTimer();
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

function loadSavedMeals() {
    const meals = JSON.parse(localStorage.getItem(getUserKey('meals'))) || [];
    
    // ✅ VERIFICAR SE SÃO DADOS VÁLIDOS (não dados de outro usuário)
    const isValidData = meals.every(meal => 
        meal && typeof meal === 'object' && meal.id && meal.name
    );
    
    if (meals.length > 0 && isValidData) {
        document.getElementById('noMealsState').style.display = 'none';
        meals.forEach(meal => renderMeal(meal));
        
        if (!selectedMealId && meals.length > 0) {
            selectMeal(meals[0].id);
        }
    } else {
        // ✅ SE DADOS INVÁLIDOS, LIMPAR E INICIALIZAR VAZIO
        console.log('Dados de refeições inválidos detectados, limpando...');
        localStorage.setItem(getUserKey('meals'), JSON.stringify([]));
        document.getElementById('noMealsState').style.display = 'block';
    }
}

// Configurar observador de interseção para animações ao rolar
function setupIntersectionObserver() {
    const sections = document.querySelectorAll('.workout-section, .side-section');
    
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

// Carregar dados do usuário para a navbar
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('user')) || {
        firstName: 'Usuário',
        lastName: 'BioMeta'
    };
    
    const initials = (userData.firstName?.charAt(0) || 'U') + (userData.lastName?.charAt(0) || 'B');
    document.getElementById('navbarAvatar').textContent = initials;
    document.getElementById('navbarName').textContent = `${userData.firstName || 'Usuário'} ${userData.lastName || 'BioMeta'}`;
}

// ========== FUNÇÕES DE USUÁRIO ========== //

// Obter ID do usuário atual
function getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.id : null;
}

// Obter chave específica do usuário
function getUserKey(key) {
    const userId = getCurrentUserId();
    return userId ? `${key}_${userId}` : key;
}

// Configurar event listeners
function setupEventListeners() {
    // Formulário de ficha
    document.getElementById('workoutForm').addEventListener('submit', createWorkout);
    
    // Botão para adicionar exercício
    document.getElementById('addExerciseBtn').addEventListener('click', showExerciseForm);
    
    // Formulário de exercício
    document.getElementById('exerciseForm').addEventListener('submit', addExercise);
    document.getElementById('cancelExerciseBtn').addEventListener('click', hideExerciseForm);
    
    // Controles do cronômetro
    document.getElementById('startTimer').addEventListener('click', startTimer);
    document.getElementById('pauseTimer').addEventListener('click', pauseTimer);
    document.getElementById('resetTimer').addEventListener('click', resetTimer);
    document.getElementById('setTimeBtn').addEventListener('click', setCustomTime);
}

// Variáveis globais
let selectedWorkoutId = null;
let timerInterval = null;
let timerSeconds = 0;
let targetTime = 3600; // 60 minutos em segundos (padrão)
let isTimerRunning = false;

// ========== CRONÔMETRO ========== //

// Iniciar cronômetro
function startTimer() {
    if (isTimerRunning) return;
    
    isTimerRunning = true;
    document.getElementById('startTimer').disabled = true;
    document.getElementById('pauseTimer').disabled = false;
    
    timerInterval = setInterval(() => {
        timerSeconds++;
        updateTimerDisplay();
        updateProgressBar();
    }, 1000);
}

// Pausar cronômetro
function pauseTimer() {
    if (!isTimerRunning) return;
    
    clearInterval(timerInterval);
    isTimerRunning = false;
    document.getElementById('startTimer').disabled = false;
    document.getElementById('pauseTimer').disabled = true;
}

// Resetar cronômetro
function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timerSeconds = 0;
    
    document.getElementById('startTimer').disabled = false;
    document.getElementById('pauseTimer').disabled = true;
    
    updateTimerDisplay();
    updateProgressBar();
}

// Definir tempo personalizado
function setCustomTime() {
    const customTime = parseInt(document.getElementById('customTime').value);
    
    if (customTime && customTime > 0) {
        targetTime = customTime * 60; // Converter minutos para segundos
        updateProgressBar();
        
        // Feedback visual
        const setBtn = document.getElementById('setTimeBtn');
        const originalText = setBtn.innerHTML;
        setBtn.innerHTML = '<i class="fas fa-check"></i> Definido!';
        setBtn.style.background = 'linear-gradient(135deg, #27ae60, #229954)';
        
        setTimeout(() => {
            setBtn.innerHTML = originalText;
            setBtn.style.background = '';
        }, 2000);
    } else {
        alert('Por favor, informe um tempo válido em minutos.');
    }
}

// Atualizar display do cronômetro
function updateTimerDisplay() {
    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor((timerSeconds % 3600) / 60);
    const seconds = timerSeconds % 60;
    
    document.getElementById('timerDisplay').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Atualizar barra de progresso
function updateProgressBar() {
    const progress = targetTime > 0 ? Math.min((timerSeconds / targetTime) * 100, 100) : 0;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `${Math.round(progress)}% do tempo alvo`;
}

// ========== SISTEMA DE FICHAS ========== //

// Criar nova ficha
function createWorkout(e) {
    e.preventDefault();
    
    const name = document.getElementById('workoutName').value.trim();
    
    if (!name) {
        alert('Por favor, informe um nome para a ficha.');
        return;
    }
    
    const workout = {
        id: Date.now(),
        name,
        exercises: [],
        createdAt: new Date().toISOString()
    };
    
    saveWorkout(workout);
    renderWorkout(workout);
    
    // Limpar formulário
    document.getElementById('workoutName').value = '';
    
    // Selecionar automaticamente a nova ficha
    selectWorkout(workout.id);
}

// Salvar ficha no localStorage
function saveWorkout(workout) {
    let workouts = JSON.parse(localStorage.getItem(getUserKey('workouts'))) || [];
    
    const index = workouts.findIndex(w => w.id === workout.id);
    
    if (index !== -1) {
        workouts[index] = workout;
    } else {
        workouts.push(workout);
    }
    
    localStorage.setItem(getUserKey('workouts'), JSON.stringify(workouts));
}

// Carregar fichas salvas
function loadSavedWorkouts() {
    const workouts = JSON.parse(localStorage.getItem(getUserKey('workouts'))) || [];
    
    if (workouts.length > 0) {
        document.getElementById('noWorkoutsState').style.display = 'none';
        workouts.forEach(workout => renderWorkout(workout));
        
        if (!selectedWorkoutId) {
            selectWorkout(workouts[0].id);
        }
    }
}

// Renderizar ficha na lista
function renderWorkout(workout) {
    const workoutsList = document.getElementById('workoutsList');
    
    // Esconder empty state se for a primeira ficha
    if (document.getElementById('noWorkoutsState').style.display !== 'none') {
        document.getElementById('noWorkoutsState').style.display = 'none';
    }
    
    // Verificar se a ficha já está renderizada
    const existingItem = document.querySelector(`.workout-item[data-id="${workout.id}"]`);
    
    if (existingItem) {
        // Atualizar ficha existente
        existingItem.querySelector('.workout-item-name').textContent = workout.name;
        existingItem.querySelector('.workout-item-exercises').textContent = 
            `${workout.exercises.length} exercício${workout.exercises.length !== 1 ? 's' : ''}`;
    } else {
        // Criar novo item de ficha
        const workoutElement = document.createElement('div');
        workoutElement.className = `workout-item ${workout.id === selectedWorkoutId ? 'active' : ''}`;
        workoutElement.dataset.id = workout.id;
        
        workoutElement.innerHTML = `
            <div>
                <div class="workout-item-name">${workout.name}</div>
                <div class="workout-item-exercises">${workout.exercises.length} exercício${workout.exercises.length !== 1 ? 's' : ''}</div>
            </div>
            <div class="workout-item-actions">
                <div class="delete-workout" onclick="deleteWorkout(${workout.id})">
                    <i class="fas fa-trash"></i>
                </div>
            </div>
        `;
        
        workoutElement.addEventListener('click', () => selectWorkout(workout.id));
        workoutsList.appendChild(workoutElement);
    }
}

// Selecionar ficha
function selectWorkout(workoutId) {
    const workouts = JSON.parse(localStorage.getItem(getUserKey('workouts'))) || [];
    const workout = workouts.find(w => w.id === workoutId);
    
    if (!workout) return;
    
    // Atualizar seleção visual
    document.querySelectorAll('.workout-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const selectedItem = document.querySelector(`.workout-item[data-id="${workoutId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
    
    // Atualizar variável global
    selectedWorkoutId = workoutId;
    
    // Mostrar ficha selecionada
    document.getElementById('selectedWorkoutName').textContent = workout.name;
    document.getElementById('selectedWorkoutCard').style.display = 'block';
    document.getElementById('noWorkoutSelectedCard').style.display = 'none';
    
    // Renderizar exercícios da ficha
    renderExercises(workout.exercises);
    
    // Esconder formulário de exercício se estiver visível
    hideExerciseForm();
}

// Renderizar exercícios
function renderExercises(exercises) {
    const exercisesList = document.getElementById('exercisesList');
    exercisesList.innerHTML = '';
    
    if (exercises.length === 0) {
        exercisesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-dumbbell"></i>
                <p>Nenhum exercício nesta ficha.</p>
                <p>Clique em "Add Exercício" para começar!</p>
            </div>
        `;
        return;
    }
    
    exercises.forEach(exercise => {
        const exerciseElement = document.createElement('div');
        exerciseElement.className = 'exercise-item';
        exerciseElement.dataset.id = exercise.id;
        
        exerciseElement.innerHTML = `
            <div class="exercise-info">
                <div class="exercise-name">${exercise.name}</div>
                <div class="exercise-details">${exercise.sets} séries × ${exercise.reps} reps (${exercise.weight} kg)</div>
            </div>
            <div class="exercise-performance">
                <div class="performance-inputs">
                    <div class="performance-input">
                        <label for="weight-${exercise.id}">Carga (kg)</label>
                        <input type="number" 
                               id="weight-${exercise.id}" 
                               class="completed-weight" 
                               placeholder="0" 
                               value="${exercise.completedWeight || ''}" 
                               step="0.5"
                               min="0"
                               onchange="updateExercisePerformance(${exercise.id}, 'weight', this.value)">
                    </div>
                    <div class="performance-input">
                        <label for="reps-${exercise.id}">Reps Realizadas</label>
                        <input type="number" 
                               id="reps-${exercise.id}" 
                               class="completed-reps" 
                               placeholder="0" 
                               value="${exercise.completedReps || ''}" 
                               min="0"
                               max="100"
                               onchange="updateExercisePerformance(${exercise.id}, 'reps', this.value)">
                    </div>
                </div>
                <div class="exercise-actions">
                    <div class="delete-exercise" onclick="deleteExercise(${exercise.id})" title="Excluir exercício">
                        <i class="fas fa-trash"></i>
                    </div>
                </div>
            </div>
        `;
        
        exercisesList.appendChild(exerciseElement);
    });
}

function updateExercisePerformance(exerciseId, type, value) {
    const workouts = JSON.parse(localStorage.getItem(getUserKey('workouts'))) || [];
    const workoutIndex = workouts.findIndex(w => w.id === selectedWorkoutId);
    
    if (workoutIndex !== -1) {
        const exerciseIndex = workouts[workoutIndex].exercises.findIndex(ex => ex.id === exerciseId);
        
        if (exerciseIndex !== -1) {
            if (type === 'weight') {
                workouts[workoutIndex].exercises[exerciseIndex].completedWeight = value ? parseFloat(value) : null;
            } else if (type === 'reps') {
                workouts[workoutIndex].exercises[exerciseIndex].completedReps = value ? parseInt(value) : null;
            }
            
            // SALVAR A DATA DE CONCLUSÃO quando ambos peso e reps são preenchidos
            if (workouts[workoutIndex].exercises[exerciseIndex].completedWeight !== null && 
                workouts[workoutIndex].exercises[exerciseIndex].completedReps !== null) {
                workouts[workoutIndex].exercises[exerciseIndex].completedDate = new Date().toISOString();
            } else {
                workouts[workoutIndex].exercises[exerciseIndex].completedDate = null;
            }
            
            localStorage.setItem(getUserKey('workouts'), JSON.stringify(workouts));
        }
    }
}

// Mostrar formulário de exercício
function showExerciseForm() {
    document.getElementById('exerciseFormContainer').style.display = 'block';
    document.getElementById('addExerciseBtn').style.display = 'none';
}

// Esconder formulário de exercício
function hideExerciseForm() {
    document.getElementById('exerciseFormContainer').style.display = 'none';
    document.getElementById('addExerciseBtn').style.display = 'block';
    document.getElementById('exerciseForm').reset();
    document.getElementById('exerciseSets').value = 3;
    document.getElementById('exerciseReps').value = 12;
    document.getElementById('exerciseWeight').value = 20;
}

// Adicionar exercício à ficha
function addExercise(e) {
    e.preventDefault();
    
    if (!selectedWorkoutId) {
        alert('Por favor, selecione uma ficha primeiro.');
        return;
    }
    
    const name = document.getElementById('exerciseName').value.trim();
    const sets = document.getElementById('exerciseSets').value;
    const reps = document.getElementById('exerciseReps').value;
    const weight = document.getElementById('exerciseWeight').value;
    
    if (!name) {
        alert('Por favor, informe o nome do exercício.');
        return;
    }
    
    const exercise = {
        id: Date.now(),
        name,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: parseFloat(weight),
        completedWeight: null,
        completedReps: null
    };
    
    // Adicionar exercício à ficha selecionada
    const workouts = JSON.parse(localStorage.getItem(getUserKey('workouts'))) || [];
    const workoutIndex = workouts.findIndex(w => w.id === selectedWorkoutId);
    
    if (workoutIndex !== -1) {
        workouts[workoutIndex].exercises.push(exercise);
        localStorage.setItem(getUserKey('workouts'), JSON.stringify(workouts));
        
        // Atualizar visualização
        renderExercises(workouts[workoutIndex].exercises);
        renderWorkout(workouts[workoutIndex]); // Atualizar contador de exercícios
        
        // Esconder formulário
        hideExerciseForm();
    }
}

// Excluir exercício
function deleteExercise(exerciseId) {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) {
        return;
    }
    
    const workouts = JSON.parse(localStorage.getItem(getUserKey('workouts'))) || [];
    const workoutIndex = workouts.findIndex(w => w.id === selectedWorkoutId);
    
    if (workoutIndex !== -1) {
        workouts[workoutIndex].exercises = workouts[workoutIndex].exercises.filter(ex => ex.id !== exerciseId);
        localStorage.setItem(getUserKey('workouts'), JSON.stringify(workouts));
        
        // Atualizar visualização
        renderExercises(workouts[workoutIndex].exercises);
        renderWorkout(workouts[workoutIndex]); // Atualizar contador de exercícios
    }
}

// Excluir ficha
function deleteWorkout(workoutId) {
    if (!confirm('Tem certeza que deseja excluir esta ficha? Todos os exercícios serão perdidos.')) {
        return;
    }
    
    let workouts = JSON.parse(localStorage.getItem(getUserKey('workouts'))) || [];
    workouts = workouts.filter(w => w.id !== workoutId);
    localStorage.setItem(getUserKey('workouts'), JSON.stringify(workouts));
    
    // Remover da visualização
    const workoutElement = document.querySelector(`.workout-item[data-id="${workoutId}"]`);
    if (workoutElement) {
        workoutElement.remove();
    }
    
    // Se era a ficha selecionada, limpar seleção
    if (selectedWorkoutId === workoutId) {
        selectedWorkoutId = null;
        document.getElementById('selectedWorkoutCard').style.display = 'none';
        document.getElementById('noWorkoutSelectedCard').style.display = 'block';
    }
    
    // Mostrar empty state se não houver mais fichas
    if (workouts.length === 0) {
        document.getElementById('noWorkoutsState').style.display = 'block';
    }
}