// Variáveis globais
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // Inicializar navbar
    initNavbar();
    
    // Inicializar efeitos de partículas
    initParticles();
    
    // Configurar observador de interseção para animações ao rolar
    setupIntersectionObserver();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Carregar refeições salvas
    loadSavedMeals();
    
    // Verificar se precisa resetar o resumo diário
    checkDailyReset();
    
    // Carregar resumo do dia
    loadDailySummary();
    
    // Carregar meta diária
    loadDailyGoal();
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
    const sections = document.querySelectorAll('.diet-section, .side-section');
    
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
    // Formulário de refeição
    document.getElementById('mealForm').addEventListener('submit', createMeal);
    
    // Botão para adicionar alimento
    document.getElementById('addFoodBtn').addEventListener('click', showFoodForm);
    
    // Formulário de alimento
    document.getElementById('foodForm').addEventListener('submit', addFood);
    document.getElementById('cancelFoodBtn').addEventListener('click', hideFoodForm);
}

// Variáveis globais
let selectedMealId = null;
let editingFoodId = null;

// ========== SISTEMA DE REFEIÇÕES ========== //

// Criar nova refeição
function createMeal(e) {
    e.preventDefault();
    
    const name = document.getElementById('mealName').value.trim();
    
    if (!name) {
        alert('Por favor, informe um nome para a refeição.');
        return;
    }
    
    const meal = {
        id: Date.now(),
        name,
        foods: [],
        createdAt: new Date().toISOString()
    };
    
    saveMeal(meal);
    renderMeal(meal);
    
    // Limpar formulário
    document.getElementById('mealName').value = '';
    
    // Selecionar automaticamente a nova refeição
    selectMeal(meal.id);
}

// Salvar refeição no localStorage
function saveMeal(meal) {
    let meals = JSON.parse(localStorage.getItem(getUserKey('meals'))) || [];
    
    const index = meals.findIndex(m => m.id === meal.id);
    
    if (index !== -1) {
        meals[index] = meal;
    } else {
        meals.push(meal);
    }
    
    localStorage.setItem(getUserKey('meals'), JSON.stringify(meals));
}

// Carregar refeições salvas
function loadSavedMeals() {
    const meals = JSON.parse(localStorage.getItem(getUserKey('meals'))) || [];
    
    if (meals.length > 0) {
        document.getElementById('noMealsState').style.display = 'none';
        meals.forEach(meal => renderMeal(meal));
        
        if (!selectedMealId && meals.length > 0) {
            selectMeal(meals[0].id);
        }
    }
}

// Renderizar refeição na lista (com calorias)
function renderMeal(meal) {
    const mealsList = document.getElementById('mealsList');
    
    // Esconder empty state se for a primeira refeição
    if (document.getElementById('noMealsState').style.display !== 'none') {
        document.getElementById('noMealsState').style.display = 'none';
    }
    
    // Calcular calorias totais da refeição
    const totalCalories = meal.foods.reduce((total, food) => {
        return total + (food.nutrition ? food.nutrition.calories : 0);
    }, 0);
    
    // Verificar se a refeição já está renderizada
    const existingItem = document.querySelector(`.meal-item[data-id="${meal.id}"]`);
    
    if (existingItem) {
        // Atualizar refeição existente
        existingItem.querySelector('.meal-item-name').textContent = meal.name;
        existingItem.querySelector('.meal-item-foods').textContent = 
            `${meal.foods.length} alimento${meal.foods.length !== 1 ? 's' : ''}`;
        existingItem.querySelector('.meal-calories').textContent = `${Math.round(totalCalories)} kcal`;
    } else {
        // Criar novo item de refeição
        const mealElement = document.createElement('div');
        mealElement.className = `meal-item ${meal.id === selectedMealId ? 'active' : ''}`;
        mealElement.dataset.id = meal.id;
        
        mealElement.innerHTML = `
            <div class="meal-item-with-calories">
                <div>
                    <div class="meal-item-name">${meal.name}</div>
                    <div class="meal-item-foods">${meal.foods.length} alimento${meal.foods.length !== 1 ? 's' : ''}</div>
                </div>
                <div class="meal-calories">${Math.round(totalCalories)} kcal</div>
            </div>
            <div class="meal-item-actions">
                <div class="delete-meal" onclick="deleteMeal(${meal.id})">
                    <i class="fas fa-trash"></i>
                </div>
            </div>
        `;
        
        mealElement.addEventListener('click', () => selectMeal(meal.id));
        mealsList.appendChild(mealElement);
    }
}

// Selecionar refeição
function selectMeal(mealId) {
    const meals = JSON.parse(localStorage.getItem(getUserKey('meals'))) || [];
    const meal = meals.find(m => m.id === mealId);
    
    if (!meal) return;
    
    // Atualizar seleção visual
    document.querySelectorAll('.meal-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const selectedItem = document.querySelector(`.meal-item[data-id="${mealId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
    
    // Atualizar variável global
    selectedMealId = mealId;
    
    // Mostrar refeição selecionada
    document.getElementById('selectedMealName').textContent = meal.name;
    document.getElementById('selectedMealCard').style.display = 'block';
    document.getElementById('noMealSelectedCard').style.display = 'none';
    
    // Renderizar alimentos da refeição
    renderFoods(meal.foods);
    
    // Esconder formulário de alimento se estiver visível
    hideFoodForm();
}

// Mostrar formulário de alimento
function showFoodForm() {
    document.getElementById('foodFormContainer').style.display = 'block';
    document.getElementById('addFoodBtn').style.display = 'none';
    editingFoodId = null;
    resetFoodForm();
}

// Esconder formulário de alimento
function hideFoodForm() {
    document.getElementById('foodFormContainer').style.display = 'none';
    document.getElementById('addFoodBtn').style.display = 'block';
    editingFoodId = null;
    resetFoodForm();
}

// Resetar formulário de alimento
function resetFoodForm() {
    document.getElementById('foodForm').reset();
    document.getElementById('foodCalories').value = 0;
    document.getElementById('foodProtein').value = 0;
    document.getElementById('foodCarbs').value = 0;
    document.getElementById('foodFat').value = 0;
}

// Preencher formulário para edição
function fillFoodForm(food) {
    document.getElementById('foodDescription').value = food.description;
    document.getElementById('foodCalories').value = food.nutrition ? food.nutrition.calories : 0;
    document.getElementById('foodProtein').value = food.nutrition ? food.nutrition.protein : 0;
    document.getElementById('foodCarbs').value = food.nutrition ? food.nutrition.carbs : 0;
    document.getElementById('foodFat').value = food.nutrition ? food.nutrition.fat : 0;
}

// Adicionar ou editar alimento
function addFood(e) {
    e.preventDefault();
    
    if (!selectedMealId) {
        alert('Por favor, selecione uma refeição primeiro.');
        return;
    }
    
    const description = document.getElementById('foodDescription').value.trim();
    const calories = parseFloat(document.getElementById('foodCalories').value) || 0;
    const protein = parseFloat(document.getElementById('foodProtein').value) || 0;
    const carbs = parseFloat(document.getElementById('foodCarbs').value) || 0;
    const fat = parseFloat(document.getElementById('foodFat').value) || 0;
    
    if (!description) {
        alert('Por favor, informe a descrição do alimento.');
        return;
    }
    
    const nutrition = {
        calories: calories,
        protein: protein,
        carbs: carbs,
        fat: fat
    };
    
    const meals = JSON.parse(localStorage.getItem(getUserKey('meals'))) || [];
    const mealIndex = meals.findIndex(m => m.id === selectedMealId);
    
    if (mealIndex === -1) return;
    
    if (editingFoodId) {
        // Editar alimento existente
        const foodIndex = meals[mealIndex].foods.findIndex(f => f.id === editingFoodId);
        if (foodIndex !== -1) {
            const oldFood = meals[mealIndex].foods[foodIndex];
            
            // Atualizar dados
            meals[mealIndex].foods[foodIndex].description = description;
            meals[mealIndex].foods[foodIndex].nutrition = nutrition;
            
            // Se estava concluído, atualizar o resumo
            if (oldFood.completed && oldFood.nutrition) {
                removeFromDailySummary(oldFood.nutrition);
                addToDailySummary(nutrition);
            }
            
            localStorage.setItem(getUserKey('meals'), JSON.stringify(meals));
            renderFoods(meals[mealIndex].foods);
            renderMeal(meals[mealIndex]);
        }
    } else {
        // Adicionar novo alimento
        const food = {
            id: Date.now(),
            description,
            nutrition: nutrition,
            completed: false,
            completedDate: null
        };
        
        meals[mealIndex].foods.push(food);
        localStorage.setItem(getUserKey('meals'), JSON.stringify(meals));
        renderFoods(meals[mealIndex].foods);
        renderMeal(meals[mealIndex]);
    }
    
    hideFoodForm();
}

// Renderizar alimentos
function renderFoods(foods) {
    const foodsList = document.getElementById('foodsList');
    foodsList.innerHTML = '';
    
    if (foods.length === 0) {
        foodsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils"></i>
                <p>Nenhum alimento nesta refeição.</p>
                <p>Clique em "Add Alimento" para começar!</p>
            </div>
        `;
        return;
    }
    
    foods.forEach(food => {
        const foodElement = document.createElement('div');
        foodElement.className = `food-item ${food.completed ? 'completed' : ''}`;
        foodElement.dataset.id = food.id;
        
        let nutritionHTML = '';
        if (food.nutrition) {
            nutritionHTML = `
                <table class="food-nutrition-table">
                    <thead>
                        <tr>
                            <th>Calorias</th>
                            <th>Proteínas</th>
                            <th>Carboidratos</th>
                            <th>Gorduras</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${Math.round(food.nutrition.calories || 0)} kcal</td>
                            <td>${food.nutrition.protein ? food.nutrition.protein.toFixed(1) + 'g' : '0g'}</td>
                            <td>${food.nutrition.carbs ? food.nutrition.carbs.toFixed(1) + 'g' : '0g'}</td>
                            <td>${food.nutrition.fat ? food.nutrition.fat.toFixed(1) + 'g' : '0g'}</td>
                        </tr>
                    </tbody>
                </table>
            `;
        }
        
        foodElement.innerHTML = `
            <div class="food-description">
                ${food.description}
            </div>
            ${nutritionHTML}
            <div class="food-actions">
                <div class="food-action-buttons">
                    <button class="complete-btn ${food.completed ? 'completed' : ''}" 
                            onclick="toggleFoodCompletion(${food.id}, ${!food.completed})">
                        <i class="fas ${food.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                        ${food.completed ? 'Concluído' : 'Marcar'}
                    </button>
                    <button class="edit-food-btn" onclick="editFood(${food.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="delete-food-btn" onclick="deleteFood(${food.id})">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        `;
        
        foodsList.appendChild(foodElement);
    });
}

// Editar alimento
function editFood(foodId) {
    const meals = JSON.parse(localStorage.getItem(getUserKey('meals'))) || [];
    const mealIndex = meals.findIndex(m => m.id === selectedMealId);
    
    if (mealIndex === -1) return;
    
    const foodIndex = meals[mealIndex].foods.findIndex(f => f.id === foodId);
    if (foodIndex === -1) return;
    
    const food = meals[mealIndex].foods[foodIndex];
    
    // Preencher formulário com dados do alimento
    editingFoodId = foodId;
    fillFoodForm(food);
    
    // Mostrar formulário
    document.getElementById('foodFormContainer').style.display = 'block';
    document.getElementById('addFoodBtn').style.display = 'none';
}

// Alternar conclusão do alimento
function toggleFoodCompletion(foodId, completed) {
    const meals = JSON.parse(localStorage.getItem(getUserKey('meals'))) || [];
    const mealIndex = meals.findIndex(m => m.id === selectedMealId);
    
    if (mealIndex === -1) return;
    
    const foodIndex = meals[mealIndex].foods.findIndex(f => f.id === foodId);
    if (foodIndex === -1) return;
    
    const food = meals[mealIndex].foods[foodIndex];
    
    if (completed && !food.completed) {
        // Marcar como concluído e adicionar ao resumo
        food.completed = true;
        food.completedDate = new Date().toISOString();
        if (food.nutrition) {
            addToDailySummary(food.nutrition);
        }
    } else if (!completed && food.completed) {
        // Desmarcar e remover do resumo
        food.completed = false;
        food.completedDate = null;
        if (food.nutrition) {
            removeFromDailySummary(food.nutrition);
        }
    }
    
    localStorage.setItem(getUserKey('meals'), JSON.stringify(meals));
    renderFoods(meals[mealIndex].foods);
}

// Excluir alimento
function deleteFood(foodId) {
    if (!confirm('Tem certeza que deseja excluir este alimento?')) {
        return;
    }
    
    const meals = JSON.parse(localStorage.getItem(getUserKey('meals'))) || [];
    const mealIndex = meals.findIndex(m => m.id === selectedMealId);
    
    if (mealIndex !== -1) {
        const foodIndex = meals[mealIndex].foods.findIndex(f => f.id === foodId);
        
        if (foodIndex !== -1) {
            const food = meals[mealIndex].foods[foodIndex];
            
            // Remover do resumo se estava concluído
            if (food.completed && food.nutrition) {
                removeFromDailySummary(food.nutrition);
            }
            
            // Remover o alimento
            meals[mealIndex].foods.splice(foodIndex, 1);
            localStorage.setItem(getUserKey('meals'), JSON.stringify(meals));
            
            // Atualizar visualização
            renderFoods(meals[mealIndex].foods);
            renderMeal(meals[mealIndex]);
        }
    }
}

// Excluir refeição
function deleteMeal(mealId) {
    if (!confirm('Tem certeza que deseja excluir esta refeição? Todos os alimentos serão perdidos.')) {
        return;
    }
    
    let meals = JSON.parse(localStorage.getItem(getUserKey('meals'))) || [];
    
    // Remover alimentos concluídos do resumo antes de excluir
    const mealToDelete = meals.find(m => m.id === mealId);
    if (mealToDelete) {
        mealToDelete.foods.forEach(food => {
            if (food.completed && food.nutrition) {
                removeFromDailySummary(food.nutrition);
            }
        });
    }
    
    meals = meals.filter(m => m.id !== mealId);
    localStorage.setItem(getUserKey('meals'), JSON.stringify(meals));
    
    // Remover da visualização
    const mealElement = document.querySelector(`.meal-item[data-id="${mealId}"]`);
    if (mealElement) {
        mealElement.remove();
    }
    
    // Se era a refeição selecionada, limpar seleção
    if (selectedMealId === mealId) {
        selectedMealId = null;
        document.getElementById('selectedMealCard').style.display = 'none';
        document.getElementById('noMealSelectedCard').style.display = 'block';
    }
    
    // Mostrar empty state se não houver mais refeições
    if (meals.length === 0) {
        document.getElementById('noMealsState').style.display = 'block';
    }
}

// ========== SISTEMA DE RESUMO DIÁRIO ========== //

// Verificar reset diário
function checkDailyReset() {
    const lastReset = localStorage.getItem(getUserKey('lastDailyReset'));
    const today = new Date().toDateString();
    
    if (!lastReset || lastReset !== today) {
        resetDailySummary();
    }
}

// Carregar resumo diário
function loadDailySummary() {
    const dailySummary = JSON.parse(localStorage.getItem(getUserKey('dailySummary'))) || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        lastUpdated: new Date().toDateString()
    };
    
    updateSummaryDisplay(dailySummary);
}

// Salvar resumo diário
function saveDailySummary(summary) {
    summary.lastUpdated = new Date().toDateString();
    localStorage.setItem(getUserKey('dailySummary'), JSON.stringify(summary));
}

// Zerar resumo diário
function resetDailySummary() {
    const newSummary = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        lastUpdated: new Date().toDateString()
    };
    
    localStorage.setItem(getUserKey('lastDailyReset'), new Date().toDateString());
    saveDailySummary(newSummary);
    updateSummaryDisplay(newSummary);
    
    // Remover status de concluído de todos os alimentos do usuário atual
    const meals = JSON.parse(localStorage.getItem(getUserKey('meals'))) || [];
    let needsUpdate = false;
    
    meals.forEach(meal => {
        meal.foods.forEach(food => {
            if (food.completed) {
                food.completed = false;
                food.completedDate = null;
                needsUpdate = true;
            }
        });
    });
    
    if (needsUpdate) {
        localStorage.setItem(getUserKey('meals'), JSON.stringify(meals));
        
        if (selectedMealId) {
            const currentMeal = meals.find(m => m.id === selectedMealId);
            if (currentMeal) {
                renderFoods(currentMeal.foods);
            }
        }
    }
    
    // Feedback visual
    const resetBtn = document.querySelector('[onclick="resetDailySummary()"]');
    const originalText = resetBtn.innerHTML;
    resetBtn.innerHTML = '<i class="fas fa-check"></i> Zerado!';
    resetBtn.style.background = 'linear-gradient(135deg, #27ae60, #229954)';
    
    setTimeout(() => {
        resetBtn.innerHTML = originalText;
        resetBtn.style.background = '';
    }, 2000);
}

// Atualizar exibição do resumo
function updateSummaryDisplay(summary) {
    document.getElementById('totalCalories').textContent = Math.round(summary.calories);
    document.getElementById('totalProtein').textContent = summary.protein.toFixed(1);
    document.getElementById('totalCarbs').textContent = summary.carbs.toFixed(1);
    document.getElementById('totalFat').textContent = summary.fat.toFixed(1);
    document.getElementById('caloriesConsumed').textContent = Math.round(summary.calories);
    
    updateProgressBar(summary.calories);
}

// Adicionar alimento ao resumo diário
function addToDailySummary(nutrition) {
    const summary = JSON.parse(localStorage.getItem(getUserKey('dailySummary'))) || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    };
    
    summary.calories += nutrition.calories || 0;
    summary.protein += nutrition.protein || 0;
    summary.carbs += nutrition.carbs || 0;
    summary.fat += nutrition.fat || 0;
    
    saveDailySummary(summary);
    updateSummaryDisplay(summary);
}

// Remover alimento do resumo diário
function removeFromDailySummary(nutrition) {
    const summary = JSON.parse(localStorage.getItem(getUserKey('dailySummary'))) || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    };
    
    summary.calories = Math.max(0, summary.calories - (nutrition.calories || 0));
    summary.protein = Math.max(0, summary.protein - (nutrition.protein || 0));
    summary.carbs = Math.max(0, summary.carbs - (nutrition.carbs || 0));
    summary.fat = Math.max(0, summary.fat - (nutrition.fat || 0));
    
    saveDailySummary(summary);
    updateSummaryDisplay(summary);
}

// ========== SISTEMA DE META DIÁRIA ========== //

// Carregar meta diária
function loadDailyGoal() {
    const goal = localStorage.getItem(getUserKey('dailyCalorieGoal')) || 2000;
    document.getElementById('dailyGoalInput').value = goal;
    document.getElementById('calorieGoalValue').textContent = goal;
    
    const summary = JSON.parse(localStorage.getItem(getUserKey('dailySummary'))) || { calories: 0 };
    updateProgressBar(summary.calories);
}

// Atualizar meta diária (do usuário atual)
function updateDailyGoal() {
    const newGoal = parseInt(document.getElementById('dailyGoalInput').value);
    
    if (newGoal && newGoal >= 500 && newGoal <= 10000) {
        localStorage.setItem(getUserKey('dailyCalorieGoal'), newGoal);
        document.getElementById('calorieGoalValue').textContent = newGoal;
        
        const summary = JSON.parse(localStorage.getItem(getUserKey('dailySummary'))) || { calories: 0 };
        updateProgressBar(summary.calories);
        
        // Feedback visual
        const updateBtn = document.querySelector('[onclick="updateDailyGoal()"]');
        const originalText = updateBtn.innerHTML;
        updateBtn.innerHTML = '<i class="fas fa-check"></i> Atualizado!';
        updateBtn.style.background = 'linear-gradient(135deg, #27ae60, #229954)';
        
        setTimeout(() => {
            updateBtn.innerHTML = originalText;
            updateBtn.style.background = '';
        }, 2000);
    } else {
        alert('Por favor, insira uma meta válida entre 500 e 10000 calorias.');
    }
}

// Atualizar barra de progresso
function updateProgressBar(calories) {
    const goal = parseInt(localStorage.getItem(getUserKey('dailyCalorieGoal'))) || 2000;
    const progress = Math.min((calories / goal) * 100, 100);
    
    document.getElementById('calorieProgress').style.width = `${progress}%`;
    document.getElementById('caloriePercentage').textContent = `${Math.round(progress)}%`;
    
    // Mudar cor baseada no progresso
    const progressFill = document.getElementById('calorieProgress');
    if (progress >= 100) {
        progressFill.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)'; // Vermelho se ultrapassar
    } else if (progress >= 75) {
        progressFill.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)'; // Laranja se perto
    } else {
        progressFill.style.background = 'linear-gradient(90deg, var(--primary), var(--accent))'; // Gradiente normal
    }
}