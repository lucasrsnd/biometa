document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados do usuário para a navbar
    loadUserData();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Carregar fichas salvas
    loadSavedWorkouts();
    
    // Inicializar cronômetro
    resetTimer();
});

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
        alert(`Tempo alvo definido para ${customTime} minutos.`);
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
    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    
    // Verificar se já existe uma ficha com este ID (para atualização)
    const index = workouts.findIndex(w => w.id === workout.id);
    
    if (index !== -1) {
        workouts[index] = workout;
    } else {
        workouts.push(workout);
    }
    
    localStorage.setItem('workouts', JSON.stringify(workouts));
}

// Carregar fichas salvas
function loadSavedWorkouts() {
    const workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    
    if (workouts.length > 0) {
        document.getElementById('noWorkoutsState').style.display = 'none';
        workouts.forEach(workout => renderWorkout(workout));
        
        // Selecionar a primeira ficha por padrão
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
    const workouts = JSON.parse(localStorage.getItem('workouts')) || [];
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
        exerciseElement.className = `exercise-item ${exercise.completed ? 'exercise-completed' : ''}`;
        exerciseElement.dataset.id = exercise.id;
        
        exerciseElement.innerHTML = `
            <div class="exercise-info">
                <div class="exercise-name">${exercise.name}</div>
                <div class="exercise-details">${exercise.sets} séries × ${exercise.reps} reps × ${exercise.weight} kg</div>
            </div>
            <div class="exercise-actions">
                <div class="completed-toggle" onclick="toggleExerciseCompletion(${exercise.id})">
                    <div class="completed-checkbox ${exercise.completed ? 'checked' : ''}">
                        ${exercise.completed ? '✓' : ''}
                    </div>
                    <span>Concluído</span>
                </div>
                <input type="number" class="completed-weight" placeholder="Carga" 
                       value="${exercise.completedWeight || ''}" 
                       onchange="updateCompletedWeight(${exercise.id}, this.value)"
                       ${exercise.completed ? '' : 'disabled'}>
                <div class="delete-exercise" onclick="deleteExercise(${exercise.id})">
                    <i class="fas fa-trash"></i>
                </div>
            </div>
        `;
        
        exercisesList.appendChild(exerciseElement);
    });
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
        completed: false,
        completedWeight: null
    };
    
    // Adicionar exercício à ficha selecionada
    const workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    const workoutIndex = workouts.findIndex(w => w.id === selectedWorkoutId);
    
    if (workoutIndex !== -1) {
        workouts[workoutIndex].exercises.push(exercise);
        localStorage.setItem('workouts', JSON.stringify(workouts));
        
        // Atualizar visualização
        renderExercises(workouts[workoutIndex].exercises);
        renderWorkout(workouts[workoutIndex]); // Atualizar contador de exercícios
        
        // Esconder formulário
        hideExerciseForm();
    }
}

// Alternar conclusão do exercício
function toggleExerciseCompletion(exerciseId) {
    const workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    const workoutIndex = workouts.findIndex(w => w.id === selectedWorkoutId);
    
    if (workoutIndex !== -1) {
        const exerciseIndex = workouts[workoutIndex].exercises.findIndex(ex => ex.id === exerciseId);
        
        if (exerciseIndex !== -1) {
            workouts[workoutIndex].exercises[exerciseIndex].completed = 
                !workouts[workoutIndex].exercises[exerciseIndex].completed;
            
            // Se estiver marcando como não concluído, limpar o peso usado
            if (!workouts[workoutIndex].exercises[exerciseIndex].completed) {
                workouts[workoutIndex].exercises[exerciseIndex].completedWeight = null;
            }
            
            localStorage.setItem('workouts', JSON.stringify(workouts));
            
            // Atualizar visualização
            renderExercises(workouts[workoutIndex].exercises);
        }
    }
}

// Atualizar peso usado no exercício
function updateCompletedWeight(exerciseId, weight) {
    const workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    const workoutIndex = workouts.findIndex(w => w.id === selectedWorkoutId);
    
    if (workoutIndex !== -1) {
        const exerciseIndex = workouts[workoutIndex].exercises.findIndex(ex => ex.id === exerciseId);
        
        if (exerciseIndex !== -1) {
            workouts[workoutIndex].exercises[exerciseIndex].completedWeight = parseFloat(weight) || null;
            localStorage.setItem('workouts', JSON.stringify(workouts));
        }
    }
}

// Excluir exercício
function deleteExercise(exerciseId) {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) {
        return;
    }
    
    const workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    const workoutIndex = workouts.findIndex(w => w.id === selectedWorkoutId);
    
    if (workoutIndex !== -1) {
        workouts[workoutIndex].exercises = workouts[workoutIndex].exercises.filter(ex => ex.id !== exerciseId);
        localStorage.setItem('workouts', JSON.stringify(workouts));
        
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
    
    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];
    workouts = workouts.filter(w => w.id !== workoutId);
    localStorage.setItem('workouts', JSON.stringify(workouts));
    
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