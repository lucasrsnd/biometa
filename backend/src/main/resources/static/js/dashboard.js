// Variáveis globais
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // Inicializar dashboard
    initializeDashboard();
});

async function initializeDashboard() {
    await loadUserData();
    updateDateAndGreeting();
    loadDailySummary();
    loadMotivationalContent();
    loadQuickStats();
    updateQuickActions();
}

// ========== DADOS DO USUÁRIO ========== //

async function loadUserData() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("/api/user/me", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const userData = await response.json();

            document.getElementById(
                "userName"
            ).textContent = `${userData.firstName} ${userData.lastName}`;

            const initials =
                userData.firstName.charAt(0) + userData.lastName.charAt(0);
            document.getElementById("navbarAvatar").textContent = initials;

            document.getElementById(
                "navbarName"
            ).textContent = `${userData.firstName} ${userData.lastName}`;

            // Salvar dados atualizados no localStorage
            const currentUser = JSON.parse(localStorage.getItem('user')) || {};
            const updatedUser = { 
                ...currentUser, 
                ...userData,
                id: currentUser.id || userData.id
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

        } else if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
        } else {
            throw new Error('Erro ao carregar dados');
        }
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        // Usar dados do localStorage como fallback
        const userData = JSON.parse(localStorage.getItem('user')) || {
            firstName: 'Usuário',
            lastName: 'BioMeta'
        };
        
        document.getElementById("userName").textContent = `${userData.firstName} ${userData.lastName}`;
        const initials = (userData.firstName?.charAt(0) || 'U') + (userData.lastName?.charAt(0) || 'B');
        document.getElementById("navbarAvatar").textContent = initials;
        document.getElementById("navbarName").textContent = `${userData.firstName} ${userData.lastName}`;
    }
}

// ========== DATA E CUMPRIMENTO ========== //

function updateDateAndGreeting() {
    const now = new Date();
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    document.getElementById("currentDate").textContent = now.toLocaleDateString(
        "pt-BR",
        options
    );

    // Cumprimento baseado no horário
    const hour = now.getHours();
    let emoji = "";

    if (hour < 12) {
        emoji = "☀️";
    } else if (hour < 18) {
        emoji = "🌞";
    } else {
        emoji = "🌙";
    }

    document.getElementById("greetingEmoji").textContent = emoji;
}

// ========== RESUMO DIÁRIO ========== //

function loadDailySummary() {
    updateWorkoutSummary();
    updateDietSummary();
    updateHydrationSummary();
}

function updateWorkoutSummary() {
    const workouts = JSON.parse(localStorage.getItem(getUserKey('workouts'))) || [];
    let completedExercisesToday = 0;
    const today = new Date().toDateString();

    workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
            // Verificar se o exercício foi concluído HOJE
            if (exercise.completedWeight !== null && exercise.completedReps !== null) {
                // Se não temos data de conclusão, assumimos que foi hoje
                if (!exercise.completedDate) {
                    completedExercisesToday++;
                } else {
                    // Verificar se a conclusão foi hoje
                    const completedDate = new Date(exercise.completedDate).toDateString();
                    if (completedDate === today) {
                        completedExercisesToday++;
                    }
                }
            }
        });
    });

    // Para o resumo diário, vamos considerar que a meta é completar pelo menos 1 exercício
    const dailyGoal = 1; // Meta mínima: pelo menos 1 exercício por dia
    const progress = Math.min((completedExercisesToday / dailyGoal) * 100, 100);
    
    document.getElementById('workoutProgress').textContent = 
        `${completedExercisesToday} exercício${completedExercisesToday !== 1 ? 's' : ''} feito${completedExercisesToday !== 1 ? 's' : ''} hoje`;
    document.getElementById('workoutProgressFill').style.width = `${progress}%`;
    
    let status = 'Nenhum exercício hoje';
    if (completedExercisesToday > 0) {
        status = 'Continue treinando!';
    }
    document.getElementById('workoutStatus').textContent = status;
}

function updateDietSummary() {
    const summary = JSON.parse(localStorage.getItem(getUserKey('dailySummary'))) || { calories: 0 };
    const goal = parseInt(localStorage.getItem(getUserKey('dailyCalorieGoal'))) || 2000;
    
    const progress = Math.min((summary.calories / goal) * 100, 100);
    
    document.getElementById('dietProgress').textContent = 
        `${Math.round(summary.calories)}/${goal} calorias`;
    document.getElementById('dietProgressFill').style.width = `${progress}%`;
    
    let status = 'Aguardando refeições';
    if (summary.calories > 0) {
        status = progress >= 100 ? 'Meta atingida! 🎉' : 'Em andamento';
    }
    document.getElementById('dietStatus').textContent = status;
}

function updateHydrationSummary() {
    const hydrationData = JSON.parse(localStorage.getItem(getUserKey('hydration'))) || {};
    const todayConsumption = hydrationData.consumption || [];
    const totalConsumed = todayConsumption.reduce((total, item) => total + item.ml, 0);
    
    // SEMPRE buscar o peso atual do usuário
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    const userWeight = userData.weight || 70;
    const dailyGoal = Math.round(userWeight * 35);
    
    const progress = dailyGoal > 0 ? Math.min((totalConsumed / dailyGoal) * 100, 100) : 0;
    
    document.getElementById('hydrationProgress').textContent = 
        `${Math.round(totalConsumed)}/${dailyGoal} ml`;
    document.getElementById('hydrationProgressFill').style.width = `${progress}%`;
    
    let status = 'Comece a beber água!';
    if (totalConsumed > 0) {
        status = progress >= 100 ? 'Hidratado! 💧' : 'Continue bebendo água';
    }
    document.getElementById('hydrationStatus').textContent = status;
}

// ========== CONTEÚDO MOTIVACIONAL ========== //

function loadMotivationalContent() {
    updateMotivationalQuote();
    updateDailyTip();
}

function updateMotivationalQuote() {
    const quotes = [
        "A disciplina é a ponte entre metas e realizações!",
        "Cada treino é um investimento em você mesmo!",
        "O progresso acontece fora da zona de conforto!",
        "Seja mais forte que suas desculpas!",
        "O corpo alcança o que a mente acredita!",
        "Pequenos progressos ainda são progressos!",
        "Sua única limitação é você mesmo!",
        "O sacrifício hoje trará resultados amanhã!"
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('motivationalQuote').textContent = randomQuote;
}

function updateDailyTip() {
    const tips = [
        {
            tip: "Beba um copo de água ao acordar para ativar o metabolismo",
            icon: "fa-tint"
        },
        {
            tip: "Alongue-se por 5 minutos antes do treino para prevenir lesões",
            icon: "fa-running"
        },
        {
            tip: "Mantenha uma garrafa de água sempre visível para lembrar de beber",
            icon: "fa-wine-bottle"
        },
        {
            tip: "Durma 7-8 horas por noite para melhor recuperação muscular",
            icon: "fa-bed"
        },
        {
            tip: "Inclua proteínas em todas as refeições principais",
            icon: "fa-egg"
        },
        {
            tip: "Faça pequenas pausas ativas durante o dia para se movimentar",
            icon: "fa-walking"
        },
        {
            tip: "Consuma frutas e vegetais coloridos para variedade de nutrientes",
            icon: "fa-apple-alt"
        }
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    document.getElementById('dailyTip').textContent = randomTip.tip;
    document.getElementById('tipIcon').className = `fas ${randomTip.icon}`;
}

// ========== ESTATÍSTICAS RÁPIDAS ========== //

function loadQuickStats() {
    updatePersonalStats();
}

function updatePersonalStats() {
    // Treinos realizados HOJE
    const workouts = JSON.parse(localStorage.getItem(getUserKey('workouts'))) || [];
    let completedExercisesToday = 0;
    const today = new Date().toDateString();

    workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
            if (exercise.completedWeight !== null && exercise.completedReps !== null) {
                if (!exercise.completedDate) {
                    completedExercisesToday++;
                } else {
                    const completedDate = new Date(exercise.completedDate).toDateString();
                    if (completedDate === today) {
                        completedExercisesToday++;
                    }
                }
            }
        });
    });
    document.getElementById('totalWorkouts').textContent = completedExercisesToday;
    
    // Refeições registradas HOJE
    const meals = JSON.parse(localStorage.getItem(getUserKey('meals'))) || [];
    let mealsWithFoodToday = 0;
    const todayISO = new Date().toISOString().split('T')[0];
    
    meals.forEach(meal => {
        // Verificar se a refeição tem alimentos registrados hoje
        const hasFoodToday = meal.foods.some(food => {
            if (!food.completedDate) return false;
            const foodDate = new Date(food.completedDate).toISOString().split('T')[0];
            return foodDate === todayISO;
        });
        if (hasFoodToday) {
            mealsWithFoodToday++;
        }
    });
    document.getElementById('totalMeals').textContent = mealsWithFoodToday;
    
    // Água consumida HOJE (já está sendo calculada corretamente)
    const hydrationData = JSON.parse(localStorage.getItem(getUserKey('hydration'))) || {};
    const todayConsumption = hydrationData.consumption || [];
    const totalWater = todayConsumption.reduce((total, item) => total + item.ml, 0) / 1000;
    document.getElementById('waterConsumed').textContent = totalWater.toFixed(1) + 'L';
    
    // Dias consecutivos (baseado em ter feito pelo menos 1 exercício por dia)
    const streak = calculateCurrentStreak();
    document.getElementById('currentStreak').textContent = streak;
}

function calculateCurrentStreak() {
    // Verificar se houve atividade hoje
    const workouts = JSON.parse(localStorage.getItem(getUserKey('workouts'))) || [];
    const today = new Date().toDateString();
    let activityToday = false;

    workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
            if (exercise.completedWeight !== null && exercise.completedReps !== null) {
                if (!exercise.completedDate) {
                    activityToday = true;
                } else {
                    const completedDate = new Date(exercise.completedDate).toDateString();
                    if (completedDate === today) {
                        activityToday = true;
                    }
                }
            }
        });
    });

    // Simulação - se houve atividade hoje, retorna 1, senão 0
    // Em uma implementação real, você verificaria dias consecutivos no histórico
    return activityToday ? 1 : 0;
}

// ========== AÇÕES RÁPIDAS ========== //

function updateQuickActions() {
    updateWorkoutBadge();
    updateDietBadge();
    updateHydrationBadge();
    updatePlanningBadge();
}

function updateWorkoutBadge() {
    const workouts = JSON.parse(localStorage.getItem(getUserKey('workouts'))) || [];
    let completedExercisesToday = 0;
    const today = new Date().toDateString();

    workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
            // Verificar se o exercício foi concluído HOJE
            if (exercise.completedWeight !== null && exercise.completedReps !== null) {
                if (!exercise.completedDate) {
                    completedExercisesToday++;
                } else {
                    const completedDate = new Date(exercise.completedDate).toDateString();
                    if (completedDate === today) {
                        completedExercisesToday++;
                    }
                }
            }
        });
    });

    document.getElementById('workoutBadge').textContent = 
        `${completedExercisesToday} exercício${completedExercisesToday !== 1 ? 's' : ''} hoje`;
}

function updateDietBadge() {
    const summary = JSON.parse(localStorage.getItem(getUserKey('dailySummary'))) || { calories: 0 };
    document.getElementById('dietBadge').textContent = 
        `${Math.round(summary.calories)} calorias hoje`;
}

function updateHydrationBadge() {
    const hydrationData = JSON.parse(localStorage.getItem(getUserKey('hydration'))) || {};
    const todayConsumption = hydrationData.consumption || [];
    const totalConsumed = todayConsumption.reduce((total, item) => total + item.ml, 0);
    document.getElementById('hydrationBadge').textContent = 
        `${Math.round(totalConsumed)} ml hoje`;
}

function updatePlanningBadge() {
    const events = JSON.parse(localStorage.getItem(getUserKey('planning_events'))) || {};
    const today = new Date().toISOString().split('T')[0];
    const todayEvents = events[today] || [];
    document.getElementById('planningBadge').textContent = 
        `${todayEvents.length} evento${todayEvents.length !== 1 ? 's' : ''} hoje`;
}

// ========== FUNÇÕES AUXILIARES ========== //

function getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.id : null;
}

function getUserKey(key) {
    const userId = getCurrentUserId();
    return userId ? `${key}_${userId}` : key;
}

// ========== ATUALIZAÇÃO AUTOMÁTICA ========== //

// Atualizar dados quando a página ganhar foco
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        loadDailySummary();
        updateQuickActions();
        updatePersonalStats();
    }
});

// Atualizar quando voltar de outras páginas
window.addEventListener('pageshow', function() {
    loadDailySummary();
    updateQuickActions();
    updatePersonalStats();
});

// Atualizar a cada minuto para dados em tempo real
setInterval(() => {
    loadDailySummary();
    updateQuickActions();
    updatePersonalStats();
}, 60000);