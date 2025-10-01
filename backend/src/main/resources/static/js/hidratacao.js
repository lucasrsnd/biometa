document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados do usuário
    loadUserData();
    
    // Inicializar sistema de hidratação
    initializeHydrationSystem();
    
    // Configurar event listeners
    setupEventListeners();
});

// ========== FUNÇÕES DE USUÁRIO ========== //

function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('user')) || {
        firstName: 'Usuário',
        lastName: 'BioMeta'
    };
    
    const initials = (userData.firstName?.charAt(0) || 'U') + (userData.lastName?.charAt(0) || 'B');
    document.getElementById('navbarAvatar').textContent = initials;
    document.getElementById('navbarName').textContent = `${userData.firstName || 'Usuário'} ${userData.lastName || 'BioMeta'}`;
    
    return userData;
}

function getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.id : null;
}

function getUserKey(key) {
    const userId = getCurrentUserId();
    return userId ? `${key}_${userId}` : key;
}

// ========== SISTEMA DE HIDRATAÇÃO ========== //

let dailyGoal = 0;
let todayConsumption = [];
let challenges = {};

function initializeHydrationSystem() {
    calculateDailyGoal();
    loadTodayConsumption();
    loadChallenges();
    updateDisplay();
    checkDailyReset();
}

function calculateDailyGoal() {
    const userData = loadUserData();
    const userWeight = userData.weight || 70; // Usar peso do cadastro ou 70kg padrão
    
    dailyGoal = Math.round(userWeight * 35); // 35ml por kg
    
    document.getElementById('dailyGoal').textContent = `${dailyGoal.toLocaleString()} ml`;
    document.getElementById('userWeight').textContent = userWeight;
}

function recalculateGoal() {
    const userData = loadUserData();
    const currentWeight = userData.weight || 70;
    
    const newWeight = prompt('Qual é o seu peso atual em kg?', currentWeight);
    
    if (newWeight && !isNaN(newWeight) && newWeight > 0) {
        // Atualizar peso no perfil do usuário
        userData.weight = parseFloat(newWeight);
        localStorage.setItem('user', JSON.stringify(userData));
        
        calculateDailyGoal();
        updateDisplay();
        alert('Meta recalculada com sucesso!');
    }
}

// ========== REGISTRO DE CONSUMO ========== //

function setupEventListeners() {
    // Botões de quantidade rápida
    document.querySelectorAll('.btn-quantity').forEach(btn => {
        btn.addEventListener('click', function() {
            const ml = parseInt(this.dataset.ml);
            addConsumption(ml);
        });
    });
    
    // Input personalizado
    document.getElementById('addCustomConsumption').addEventListener('click', function() {
        const customMl = document.getElementById('customMl').value;
        if (customMl && !isNaN(customMl) && customMl > 0) {
            addConsumption(parseInt(customMl));
            document.getElementById('customMl').value = '';
        } else {
            alert('Por favor, informe uma quantidade válida em ml.');
        }
    });
    
    // Enter no input personalizado
    document.getElementById('customMl').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('addCustomConsumption').click();
        }
    });
}

function addConsumption(ml) {
    const consumption = {
        id: Date.now(),
        ml: ml,
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        })
    };
    
    todayConsumption.push(consumption);
    saveTodayConsumption();
    updateDisplay();
    updateChallenges();
    
    // Feedback visual
    showConsumptionFeedback(ml);
}

function showConsumptionFeedback(ml) {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--water-blue);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        font-weight: 600;
        z-index: 1000;
        animation: fadeInOut 2s ease-in-out;
    `;
    feedback.textContent = `+${ml}ml 💧`;
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        document.body.removeChild(feedback);
    }, 2000);
}

// ========== HISTÓRICO E EXIBIÇÃO ========== //

function loadTodayConsumption() {
    const today = new Date().toDateString();
    const hydrationData = JSON.parse(localStorage.getItem(getUserKey('hydration'))) || {};
    
    if (hydrationData.date !== today) {
        todayConsumption = [];
    } else {
        todayConsumption = hydrationData.consumption || [];
    }
}

function saveTodayConsumption() {
    const today = new Date().toDateString();
    const hydrationData = {
        date: today,
        consumption: todayConsumption
    };
    
    localStorage.setItem(getUserKey('hydration'), JSON.stringify(hydrationData));
}

function updateDisplay() {
    const totalConsumed = todayConsumption.reduce((total, item) => total + item.ml, 0);
    const progress = dailyGoal > 0 ? Math.min((totalConsumed / dailyGoal) * 100, 100) : 0;
    
    // Atualizar estatísticas
    document.getElementById('consumedToday').textContent = `${totalConsumed.toLocaleString()} ml`;
    document.getElementById('remainingGoal').textContent = `${Math.max(0, dailyGoal - totalConsumed).toLocaleString()} ml`;
    document.getElementById('totalToday').textContent = `${totalConsumed.toLocaleString()} ml`;
    document.getElementById('totalRecords').textContent = todayConsumption.length;
    
    // Atualizar gráfico
    document.getElementById('waterFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `${Math.round(progress)}% da meta atingida`;
    
    // Atualizar informações de tempo
    updateTimeInfo();
    
    // Atualizar histórico
    updateHistoryList();
}

function updateHistoryList() {
    const historyList = document.getElementById('historyList');
    
    if (todayConsumption.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tint"></i>
                <p>Nenhum registro hoje.</p>
                <p>Comece a registrar seu consumo!</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = todayConsumption
        .slice()
        .reverse()
        .map(consumption => `
            <div class="history-item">
                <div class="history-amount">${consumption.ml.toLocaleString()} ml</div>
                <div class="history-time">${consumption.time}</div>
            </div>
        `)
        .join('');
}

function updateTimeInfo() {
    const now = new Date();
    const hours = now.getHours();
    let message = '';
    
    if (hours < 12) {
        message = 'Bom dia! 💪';
    } else if (hours < 18) {
        message = 'Boa tarde! 🌞';
    } else {
        message = 'Boa noite! 🌙';
    }
    
    document.getElementById('timeInfo').textContent = message;
}

function clearTodayHistory() {
    if (confirm('Tem certeza que deseja limpar todo o histórico de hoje?')) {
        todayConsumption = [];
        saveTodayConsumption();
        updateDisplay();
        updateChallenges();
    }
}

// ========== DESAFIOS ========== //

function loadChallenges() {
    challenges = JSON.parse(localStorage.getItem(getUserKey('hydration_challenges'))) || {
        consistent: { current: 0, max: 7 },
        early: false,
        bottle: false,
        streak: { current: 0, max: 30 },
        lastUpdated: new Date().toDateString()
    };
}

function saveChallenges() {
    challenges.lastUpdated = new Date().toDateString();
    localStorage.setItem(getUserKey('hydration_challenges'), JSON.stringify(challenges));
}

function updateChallenges() {
    const totalConsumed = todayConsumption.reduce((total, item) => total + item.ml, 0);
    
    // Desafio: Consistência Semanal
    if (totalConsumed >= dailyGoal) {
        if (challenges.consistent.current < challenges.consistent.max) {
            challenges.consistent.current++;
        }
    }
    
    // Desafio: Início Matinal
    const earlyConsumption = todayConsumption.filter(item => {
        const hour = new Date(item.timestamp).getHours();
        return hour < 10;
    }).reduce((total, item) => total + item.ml, 0);
    
    challenges.early = earlyConsumption >= 500;
    
    // Desafio: Garrafa Inteira
    challenges.bottle = totalConsumed >= 2000;
    
    // Desafio: Sequência Perfeita
    if (totalConsumed >= dailyGoal) {
        if (challenges.streak.current < challenges.streak.max) {
            challenges.streak.current++;
        }
    } else {
        challenges.streak.current = 0;
    }
    
    saveChallenges();
    updateChallengesDisplay();
}

function updateChallengesDisplay() {
    // Consistência Semanal
    const consistentProgress = (challenges.consistent.current / challenges.consistent.max) * 100;
    document.getElementById('consistentProgress').style.width = `${consistentProgress}%`;
    document.getElementById('consistentDays').textContent = `${challenges.consistent.current}/${challenges.consistent.max} dias`;
    
    // Início Matinal
    const earlyStatus = document.getElementById('earlyStatus');
    earlyStatus.textContent = challenges.early ? 'Concluído! 🎉' : 'Não concluído';
    earlyStatus.className = challenges.early ? 'challenge-status completed' : 'challenge-status';
    
    // Garrafa Inteira
    const bottleStatus = document.getElementById('bottleStatus');
    bottleStatus.textContent = challenges.bottle ? 'Concluído! 🎉' : 'Não concluído';
    bottleStatus.className = challenges.bottle ? 'challenge-status completed' : 'challenge-status';
    
    // Sequência Perfeita
    const streakProgress = (challenges.streak.current / challenges.streak.max) * 100;
    document.getElementById('streakProgress').style.width = `${streakProgress}%`;
    document.getElementById('streakDays').textContent = `${challenges.streak.current}/${challenges.streak.max} dias`;
}

// ========== RESET DIÁRIO ========== //

function checkDailyReset() {
    const lastReset = localStorage.getItem(getUserKey('last_hydration_reset'));
    const today = new Date().toDateString();
    
    if (!lastReset || lastReset !== today) {
        resetDailyData();
    }
}

function resetDailyData() {
    const today = new Date().toDateString();
    localStorage.setItem(getUserKey('last_hydration_reset'), today);
    
    // Verificar se precisa resetar algum desafio
    const challenges = JSON.parse(localStorage.getItem(getUserKey('hydration_challenges'))) || {};
    if (challenges.lastUpdated !== today) {
        // Reset do desafio matinal diário
        challenges.early = false;
        challenges.bottle = false;
        saveChallenges();
    }
}

// ========== ANIMAÇÕES CSS ========== //

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -40%); }
        20% { opacity: 1; transform: translate(-50%, -50%); }
        80% { opacity: 1; transform: translate(-50%, -50%); }
        100% { opacity: 0; transform: translate(-50%, -60%); }
    }
    
    .water-fill {
        animation: waterRipple 2s ease-in-out;
    }
    
    @keyframes waterRipple {
        0% { transform: scaleX(0); }
        50% { transform: scaleX(1.02); }
        100% { transform: scaleX(1); }
    }
`;
document.head.appendChild(style);