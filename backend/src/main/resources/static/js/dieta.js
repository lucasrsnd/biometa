document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados do usuário para a navbar
    loadUserData();
    
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
        
        if (!selectedMealId) {
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
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
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
    
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
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
            
            localStorage.setItem('meals', JSON.stringify(meals));
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
        localStorage.setItem('meals', JSON.stringify(meals));
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
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
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
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
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
    
    localStorage.setItem('meals', JSON.stringify(meals));
    renderFoods(meals[mealIndex].foods);
}

// Excluir alimento
function deleteFood(foodId) {
    if (!confirm('Tem certeza que deseja excluir este alimento?')) {
        return;
    }
    
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
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
            localStorage.setItem('meals', JSON.stringify(meals));
            
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
    
    let meals = JSON.parse(localStorage.getItem('meals')) || [];
    
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
    localStorage.setItem('meals', JSON.stringify(meals));
    
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
    const lastReset = localStorage.getItem('lastDailyReset');
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
    
    alert('Resumo diário zerado com sucesso! Todos os alimentos foram desmarcados.');
}


// Atualizar exibição do resumo
function updateSummaryDisplay(summary) {
    document.getElementById('totalCalories').textContent = summary.calories;
    document.getElementById('totalProtein').textContent = summary.protein.toFixed(1);
    document.getElementById('totalCarbs').textContent = summary.carbs.toFixed(1);
    document.getElementById('totalFat').textContent = summary.fat.toFixed(1);
    document.getElementById('caloriesConsumed').textContent = summary.calories;
    
    updateProgressBar(summary.calories);
}

// Adicionar alimento ao resumo diário
function addToDailySummary(nutrition) {
    const summary = JSON.parse(localStorage.getItem('dailySummary')) || {
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
    const summary = JSON.parse(localStorage.getItem('dailySummary')) || {
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
    document.getElementById('calorieGoal').textContent = goal;
    document.getElementById('calorieGoalValue').textContent = goal;
    
    const summary = JSON.parse(localStorage.getItem(getUserKey('dailySummary'))) || { calories: 0 };
    updateProgressBar(summary.calories);
}

// Atualizar meta diária (do usuário atual)
function updateDailyGoal() {
    const newGoal = parseInt(document.getElementById('dailyGoalInput').value);
    
    if (newGoal && newGoal >= 500 && newGoal <= 10000) {
        localStorage.setItem(getUserKey('dailyCalorieGoal'), newGoal);
        document.getElementById('calorieGoal').textContent = newGoal;
        document.getElementById('calorieGoalValue').textContent = newGoal;
        
        const summary = JSON.parse(localStorage.getItem(getUserKey('dailySummary'))) || { calories: 0 };
        updateProgressBar(summary.calories);
        
        alert('Meta diária atualizada para ' + newGoal + ' calorias!');
    } else {
        alert('Por favor, insira uma meta válida entre 500 e 10000 calorias.');
    }
}

// Atualizar barra de progresso
function updateProgressBar(calories) {
    const goal = parseInt(localStorage.getItem('dailyCalorieGoal')) || 2000;
    const progress = Math.min((calories / goal) * 100, 100);
    
    document.getElementById('calorieProgress').style.width = `${progress}%`;
    document.getElementById('caloriePercentage').textContent = `${Math.round(progress)}%`;
    
    // Mudar cor baseada no progresso
    const progressFill = document.getElementById('calorieProgress');
    if (progress >= 100) {
        progressFill.style.backgroundColor = '#e74c3c'; // Vermelho se ultrapassar
    } else if (progress >= 75) {
        progressFill.style.backgroundColor = '#f39c12'; // Laranja se perto
    } else {
        progressFill.style.backgroundColor = '#2ecc71'; // Verde se normal
    }
}