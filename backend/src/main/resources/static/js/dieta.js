document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados do usuário para a navbar
    loadUserData();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Carregar refeições salvas
    loadSavedMeals();
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
    let meals = JSON.parse(localStorage.getItem('meals')) || [];
    
    // Verificar se já existe uma refeição com este ID (para atualização)
    const index = meals.findIndex(m => m.id === meal.id);
    
    if (index !== -1) {
        meals[index] = meal;
    } else {
        meals.push(meal);
    }
    
    localStorage.setItem('meals', JSON.stringify(meals));
    updateNutritionSummary();
}

// Carregar refeições salvas
function loadSavedMeals() {
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    
    if (meals.length > 0) {
        document.getElementById('noMealsState').style.display = 'none';
        meals.forEach(meal => renderMeal(meal));
        
        // Selecionar a primeira refeição por padrão
        if (!selectedMealId) {
            selectMeal(meals[0].id);
        }
    }
}

// Renderizar refeição na lista
function renderMeal(meal) {
    const mealsList = document.getElementById('mealsList');
    
    // Esconder empty state se for a primeira refeição
    if (document.getElementById('noMealsState').style.display !== 'none') {
        document.getElementById('noMealsState').style.display = 'none';
    }
    
    // Verificar se a refeição já está renderizada
    const existingItem = document.querySelector(`.meal-item[data-id="${meal.id}"]`);
    
    if (existingItem) {
        // Atualizar refeição existente
        existingItem.querySelector('.meal-item-name').textContent = meal.name;
        existingItem.querySelector('.meal-item-foods').textContent = 
            `${meal.foods.length} alimento${meal.foods.length !== 1 ? 's' : ''}`;
    } else {
        // Criar novo item de refeição
        const mealElement = document.createElement('div');
        mealElement.className = `meal-item ${meal.id === selectedMealId ? 'active' : ''}`;
        mealElement.dataset.id = meal.id;
        
        mealElement.innerHTML = `
            <div>
                <div class="meal-item-name">${meal.name}</div>
                <div class="meal-item-foods">${meal.foods.length} alimento${meal.foods.length !== 1 ? 's' : ''}</div>
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
        foodElement.className = 'food-item';
        foodElement.dataset.id = food.id;
        
        let nutritionHTML = '';
        if (food.nutrition) {
            nutritionHTML = `
                <div class="food-nutrition">
                    <div class="nutrition-info">
                        <div class="nutrition-value">${food.nutrition.calories || 0}</div>
                        <div class="nutrition-label">Calorias</div>
                    </div>
                    <div class="nutrition-info">
                        <div class="nutrition-value">${food.nutrition.protein || 0}g</div>
                        <div class="nutrition-label">Proteínas</div>
                    </div>
                    <div class="nutrition-info">
                        <div class="nutrition-value">${food.nutrition.carbs || 0}g</div>
                        <div class="nutrition-label">Carboidratos</div>
                    </div>
                    <div class="nutrition-info">
                        <div class="nutrition-value">${food.nutrition.fat || 0}g</div>
                        <div class="nutrition-label">Gorduras</div>
                    </div>
                </div>
            `;
        }
        
        foodElement.innerHTML = `
            <div class="food-description">${food.description}</div>
            ${nutritionHTML}
            <div class="food-actions">
                <button class="calculate-btn" onclick="calculateNutrition(${food.id})" 
                    ${food.nutrition ? 'style="display: none;"' : ''}>
                    <i class="fas fa-calculator"></i> Calcular Informações
                </button>
                <div class="delete-food" onclick="deleteFood(${food.id})">
                    <i class="fas fa-trash"></i>
                </div>
            </div>
        `;
        
        foodsList.appendChild(foodElement);
    });
}

// Mostrar formulário de alimento
function showFoodForm() {
    document.getElementById('foodFormContainer').style.display = 'block';
    document.getElementById('addFoodBtn').style.display = 'none';
}

// Esconder formulário de alimento
function hideFoodForm() {
    document.getElementById('foodFormContainer').style.display = 'none';
    document.getElementById('addFoodBtn').style.display = 'block';
    document.getElementById('foodForm').reset();
}

// Adicionar alimento à refeição
function addFood(e) {
    e.preventDefault();
    
    if (!selectedMealId) {
        alert('Por favor, selecione uma refeição primeiro.');
        return;
    }
    
    const description = document.getElementById('foodDescription').value.trim();
    
    if (!description) {
        alert('Por favor, informe a descrição do alimento.');
        return;
    }
    
    const food = {
        id: Date.now(),
        description,
        nutrition: null // Será preenchido quando calcularmos
    };
    
    // Adicionar alimento à refeição selecionada
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    const mealIndex = meals.findIndex(m => m.id === selectedMealId);
    
    if (mealIndex !== -1) {
        meals[mealIndex].foods.push(food);
        localStorage.setItem('meals', JSON.stringify(meals));
        
        // Atualizar visualização
        renderFoods(meals[mealIndex].foods);
        renderMeal(meals[mealIndex]); // Atualizar contador de alimentos
        
        // Esconder formulário
        hideFoodForm();
        
        // Calcular nutrição automaticamente
        calculateNutrition(food.id);
    }
}

// Calcular informações nutricionais
async function calculateNutrition(foodId) {
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    const mealIndex = meals.findIndex(m => m.id === selectedMealId);
    
    if (mealIndex === -1) return;
    
    const foodIndex = meals[mealIndex].foods.findIndex(f => f.id === foodId);
    if (foodIndex === -1) return;
    
    const foodDescription = meals[mealIndex].foods[foodIndex].description;
    const calculateBtn = document.querySelector(`.food-item[data-id="${foodId}"] .calculate-btn`);
    
    // Mostrar loading
    const originalText = calculateBtn.innerHTML;
    calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculando...';
    calculateBtn.classList.add('loading');
    calculateBtn.disabled = true;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/nutrition/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ description: foodDescription })
        });
        
        if (response.ok) {
            const nutritionData = await response.json();
            
            // Atualizar alimento com dados nutricionais
            meals[mealIndex].foods[foodIndex].nutrition = nutritionData;
            localStorage.setItem('meals', JSON.stringify(meals));
            
            // Atualizar visualização
            renderFoods(meals[mealIndex].foods);
            updateNutritionSummary();
            
        } else {
            const errorText = await response.text();
            throw new Error(errorText || `Erro HTTP: ${response.status}`);
        }
    } catch (error) {
        console.error('Erro ao calcular nutrição:', error);
        
        // Mostrar mensagem de erro amigável
        alert('Não foi possível calcular as informações nutricionais. Usando dados aproximados.');
        
        // Usar dados simulados como fallback
        const simulatedData = simulateNutritionCalculation(foodDescription);
        meals[mealIndex].foods[foodIndex].nutrition = simulatedData;
        localStorage.setItem('meals', JSON.stringify(meals));
        
        // Atualizar visualização
        renderFoods(meals[mealIndex].foods);
        updateNutritionSummary();
    } finally {
        // Restaurar botão independentemente do resultado
        calculateBtn.innerHTML = originalText;
        calculateBtn.classList.remove('loading');
        calculateBtn.disabled = false;
    }
}

function simulateNutritionCalculation(description) {
    description = description.toLowerCase();
    
    // Lógica de simulação similar à do backend
    if (description.includes('biscoito') || description.includes('bolacha') || description.includes('maizena')) {
        return { calories: 80, protein: 1.5, carbs: 12.0, fat: 3.5 };
    } else if (description.includes('arroz')) {
        return { calories: 130, protein: 2.7, carbs: 28.0, fat: 0.3 };
    } else if (description.includes('feijão')) {
        return { calories: 115, protein: 7.5, carbs: 20.0, fat: 0.5 };
    } else if (description.includes('frango')) {
        return { calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6 };
    } else if (description.includes('carne')) {
        return { calories: 250, protein: 26.0, carbs: 0.0, fat: 15.0 };
    } else {
        return { calories: 150, protein: 5.0, carbs: 20.0, fat: 6.0 };
    }
}

// Excluir alimento
function deleteFood(foodId) {
    if (!confirm('Tem certeza que deseja excluir este alimento?')) {
        return;
    }
    
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    const mealIndex = meals.findIndex(m => m.id === selectedMealId);
    
    if (mealIndex !== -1) {
        meals[mealIndex].foods = meals[mealIndex].foods.filter(f => f.id !== foodId);
        localStorage.setItem('meals', JSON.stringify(meals));
        
        // Atualizar visualização
        renderFoods(meals[mealIndex].foods);
        renderMeal(meals[mealIndex]); // Atualizar contador de alimentos
        updateNutritionSummary();
    }
}

// Excluir refeição
function deleteMeal(mealId) {
    if (!confirm('Tem certeza que deseja excluir esta refeição? Todos os alimentos serão perdidos.')) {
        return;
    }
    
    let meals = JSON.parse(localStorage.getItem('meals')) || [];
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
    
    updateNutritionSummary();
}

// Atualizar resumo nutricional
function updateNutritionSummary() {
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    // Calcular totais de todas as refeições
    meals.forEach(meal => {
        meal.foods.forEach(food => {
            if (food.nutrition) {
                totalCalories += food.nutrition.calories || 0;
                totalProtein += food.nutrition.protein || 0;
                totalCarbs += food.nutrition.carbs || 0;
                totalFat += food.nutrition.fat || 0;
            }
        });
    });
    
    // Atualizar interface
    document.getElementById('totalCalories').textContent = totalCalories;
    document.getElementById('totalProtein').textContent = totalProtein.toFixed(1);
    document.getElementById('totalCarbs').textContent = totalCarbs.toFixed(1);
    document.getElementById('totalFat').textContent = totalFat.toFixed(1);
    
    // Atualizar barra de progresso
    const calorieGoal = 2000; // Meta padrão de 2000 calorias
    const progress = Math.min((totalCalories / calorieGoal) * 100, 100);
    
    document.getElementById('calorieProgress').style.width = `${progress}%`;
    document.getElementById('caloriePercentage').textContent = `${Math.round(progress)}%`;
}