// Sistema de inicialização corrigido
document.addEventListener("DOMContentLoaded", function () {
  console.log("=== INICIANDO DASHBOARD ===");
  
  // Verificar autenticação PRIMEIRO
  if (!checkAuthAndRedirect()) {
    return; // Se não está autenticado, para aqui
  }

  console.log(`=== CARREGANDO DADOS DO USUÁRIO ${getCurrentUserId()} ===`);

  // Inicializar componentes
  initNavbar();
  initializeDashboard();
  initParticles();
  setupIntersectionObserver();
  
  // Iniciar keep-alive do backend
  startBackendKeepAlive();
});

// Sistema de autenticação corrigido para páginas protegidas
function checkAuthAndRedirect() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  console.log("=== VERIFICAÇÃO DE AUTENTICAÇÃO NO DASHBOARD ===");
  console.log("Token presente:", !!token);
  console.log("User presente:", !!user);

  if (!token || !user) {
    console.log("❌ Usuário não autenticado, redirecionando para login...");
    window.location.href = "login.html";
    return false;
  }

  try {
    const userData = JSON.parse(user);
    if (!userData.id) {
      console.log("❌ Dados de usuário inválidos, redirecionando...");
      window.location.href = "login.html";
      return false;
    }
    
    console.log("✅ Usuário autenticado:", userData.email);
    return true;
  } catch (error) {
    console.log("❌ Erro ao parsear dados do usuário, redirecionando...");
    window.location.href = "login.html";
    return false;
  }
}

// Sistema de gestão de dados por usuário (CORRIGIDO)
function getCurrentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      console.error("❌ User ID não encontrado ou inválido");
      return null;
    }
    return user.id;
  } catch (error) {
    console.error("❌ Erro ao obter user ID:", error);
    return null;
  }
}

function getUserKey(key) {
  const userId = getCurrentUserId();
  if (!userId) {
    console.error("❌ Não foi possível gerar chave - User ID não disponível");
    return key; // Fallback para evitar quebras
  }
  
  const userKey = `${key}_${userId}`;
  console.log(`🗝️ Gerando chave: ${key} -> ${userKey}`);
  return userKey;
}

// Função para salvar dados com verificação
function saveUserData(key, data) {
  try {
    const userKey = getUserKey(key);
    const dataString = JSON.stringify(data);
    localStorage.setItem(userKey, dataString);
    console.log(`💾 Dados salvos em ${userKey}:`, data);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao salvar dados em ${key}:`, error);
    return false;
  }
}

// Função para carregar dados com verificação
function loadUserData(key, defaultValue = null) {
  try {
    const userKey = getUserKey(key);
    const dataString = localStorage.getItem(userKey);
    
    if (!dataString) {
      console.log(`📁 Nenhum dado encontrado para ${userKey}, usando padrão`);
      return defaultValue;
    }
    
    const data = JSON.parse(dataString);
    console.log(`📂 Dados carregados de ${userKey}:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Erro ao carregar dados de ${key}:`, error);
    return defaultValue;
  }
}

// Sistema de inicialização do dashboard corrigido
async function initializeDashboard() {
  console.log("🔄 Inicializando dashboard...");
  
  try {
    // Carregar dados do usuário do backend
    await loadUserDataFromBackend();
    
    // Atualizar interface
    updateDateAndGreeting();
    
    // Verificar se existem dados salvos
    const hasWorkouts = localStorage.getItem(getUserKey("workouts"));
    const hasMeals = localStorage.getItem(getUserKey("meals"));
    
    console.log("📊 Dados existentes - Workouts:", !!hasWorkouts, "Meals:", !!hasMeals);

    if (!hasWorkouts && !hasMeals) {
      console.log("🆕 Inicializando dados para novo usuário...");
      resetEmptyData();
    } else {
      console.log("🔄 Carregando dados existentes...");
      loadDailySummary();
    }

    loadMotivationalContent();
    loadQuickStats();
    updateQuickActions();
    typeWriterEffect();
    
    console.log("✅ Dashboard inicializado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inicializar dashboard:", error);
    // Fallback: carregar dados básicos mesmo com erro
    loadBasicData();
  }
}

// Carregar dados do usuário do backend
async function loadUserDataFromBackend() {
  const token = localStorage.getItem("token");
  
  try {
    console.log("🔍 Buscando dados do usuário no backend...");
    const response = await fetch("https://biometa.onrender.com/api/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      const userData = await response.json();
      console.log("✅ Dados do usuário recebidos:", userData);
      
      // Atualizar interface
      updateUserInterface(userData);
      
      // Atualizar localStorage com dados completos
      const currentUser = JSON.parse(localStorage.getItem("user")) || {};
      const updatedUser = {
        ...currentUser,
        ...userData,
        id: currentUser.id // Manter o ID original
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      return userData;
    } else if (response.status === 401) {
      console.log("❌ Token inválido, fazendo logout...");
      logout();
    } else {
      throw new Error(`Erro ${response.status}`);
    }
  } catch (error) {
    console.warn("⚠️ Não foi possível carregar dados do backend, usando dados locais:", error.message);
    // Usar dados do localStorage como fallback
    const localUser = JSON.parse(localStorage.getItem("user")) || {};
    updateUserInterface(localUser);
  }
}

function updateUserInterface(userData) {
  // Atualizar nome na dashboard
  const userNameElement = document.getElementById("userName");
  if (userNameElement) {
    userNameElement.textContent = `${userData.firstName} ${userData.lastName}`;
  }

  // Atualizar navbar
  const navbarAvatar = document.getElementById("navbarAvatar");
  const navbarName = document.getElementById("navbarName");

  if (navbarAvatar) {
    const initials = (userData.firstName?.charAt(0) || 'U') + (userData.lastName?.charAt(0) || 'B');
    navbarAvatar.textContent = initials;
  }

  if (navbarName) {
    navbarName.textContent = `${userData.firstName} ${userData.lastName}`;
  }
}

// Sistema de dados vazios corrigido
function resetEmptyData() {
  console.log("🆕 Inicializando dados vazios...");
  
  const emptyData = {
    workouts: [],
    meals: [],
    dailySummary: { 
      calories: 0, 
      protein: 0, 
      carbs: 0, 
      fat: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    },
    dailyCalorieGoal: 2000,
    hydration: { 
      date: new Date().toISOString().split('T')[0], 
      consumption: [] 
    },
    hydration_challenges: {
      early: false,
      bottle: false,
      streak: { current: 0, max: 30, lastCompleted: null },
      bottleClicks: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    },
    planning_events: {},
    planning_tasks: {
      todo: [],
      doing: [],
      done: []
    },
    planning_notes: {}
  };

  // Salvar todos os dados vazios
  Object.keys(emptyData).forEach((key) => {
    saveUserData(key, emptyData[key]);
  });

  console.log("✅ Dados vazios inicializados com sucesso!");
  loadDailySummary();
}

// Carregar dados básicos (fallback)
function loadBasicData() {
  const localUser = JSON.parse(localStorage.getItem("user")) || {
    firstName: "Usuário",
    lastName: "BioMeta"
  };
  
  updateUserInterface(localUser);
  loadDailySummary();
  loadMotivationalContent();
  loadQuickStats();
  updateQuickActions();
}

// Sistema de logout corrigido
function logout() {
  if (confirm("Tem certeza que deseja sair?")) {
    console.log("🚪 Fazendo logout...");
    
    // Limpar dados específicos do usuário
    const userId = getCurrentUserId();
    if (userId) {
      const keysToRemove = [
        'workouts', 'meals', 'dailySummary', 'dailyCalorieGoal',
        'hydration', 'hydration_challenges', 'planning_events',
        'planning_tasks', 'planning_notes', 'last_hydration_reset',
        'lastDailyReset'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(`${key}_${userId}`);
      });
    }
    
    // Limpar dados de autenticação
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    console.log("✅ Logout concluído, redirecionando...");
    window.location.href = "login.html";
  }
}

// Restante das funções do dashboard (mantenha as existentes, mas usando as novas funções de persistência)

function initNavbar() {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("active");
      menuToggle.innerHTML = navLinks.classList.contains("active")
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
    });
  }

  const links = document.querySelectorAll(".nav-links a");
  links.forEach((link) => {
    link.addEventListener("click", function () {
      if (window.innerWidth <= 768) {
        if (navLinks) navLinks.classList.remove("active");
        if (menuToggle) menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
      }
    });
  });
}

function initParticles() {
  if (typeof particlesJS !== "undefined") {
    particlesJS("particles-js", {
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            value_area: 800,
          },
        },
        color: {
          value: "#6c63ff",
        },
        shape: {
          type: "circle",
          stroke: {
            width: 0,
            color: "#000000",
          },
        },
        opacity: {
          value: 0.5,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            opacity_min: 0.1,
            sync: false,
          },
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: true,
            speed: 2,
            size_min: 0.1,
            sync: false,
          },
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#6c63ff",
          opacity: 0.2,
          width: 1,
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
            rotateY: 1200,
          },
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "grab",
          },
          onclick: {
            enable: true,
            mode: "push",
          },
          resize: true,
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 0.5,
            },
          },
          push: {
            particles_nb: 4,
          },
        },
      },
      retina_detect: true,
    });
  }
}

function setupIntersectionObserver() {
  const sections = document.querySelectorAll(".dashboard-section");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");

          const cards = entry.target.querySelectorAll(
            ".summary-card, .motivation-card, .quick-action"
          );
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.style.animation = `slideInUp 0.6s ease-out ${index * 0.1}s both`;
            }, 100);
          });
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  sections.forEach((section) => {
    observer.observe(section);
  });
}

function typeWriterEffect() {
  const welcomeText = document.getElementById("userName")?.textContent;
  const greetingElement = document.getElementById("userName");
  const emojiElement = document.getElementById("greetingEmoji");
  
  if (!welcomeText || !greetingElement || !emojiElement) return;
  
  const emoji = emojiElement.textContent;
  emojiElement.textContent = "";

  greetingElement.textContent = "";
  let i = 0;

  function typeWriter() {
    if (i < welcomeText.length) {
      greetingElement.textContent += welcomeText.charAt(i);
      i++;
      setTimeout(typeWriter, 100);
    } else {
      emojiElement.textContent = emoji;
    }
  }

  setTimeout(typeWriter, 500);
}

function updateDateAndGreeting() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  
  const dateElement = document.getElementById("currentDate");
  if (dateElement) {
    dateElement.textContent = now.toLocaleDateString("pt-BR", options);
  }

  const hour = now.getHours();
  let emoji = "";

  if (hour < 12) {
    emoji = "☀️";
  } else if (hour < 18) {
    emoji = "🌞";
  } else {
    emoji = "🌙";
  }

  const emojiElement = document.getElementById("greetingEmoji");
  if (emojiElement) {
    emojiElement.textContent = emoji;
  }
}

function loadDailySummary() {
  updateWorkoutSummary();
  updateDietSummary();
  updateHydrationSummary();
}

function updateWorkoutSummary() {
  const workouts = loadUserData("workouts", []);
  let completedExercisesToday = 0;
  const today = new Date().toDateString();

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
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

  const dailyGoal = 1;
  const progress = Math.min((completedExercisesToday / dailyGoal) * 100, 100);

  const workoutProgressElement = document.getElementById("workoutProgress");
  const workoutProgressFillElement = document.getElementById("workoutProgressFill");
  const workoutStatusElement = document.getElementById("workoutStatus");

  if (workoutProgressElement) {
    workoutProgressElement.textContent = `${completedExercisesToday} exercício${completedExercisesToday !== 1 ? "s" : ""} feito${completedExercisesToday !== 1 ? "s" : ""} hoje`;
  }

  if (workoutProgressFillElement) {
    workoutProgressFillElement.style.width = `${progress}%`;
  }

  let status = "Nenhum exercício hoje";
  if (completedExercisesToday > 0) {
    status = "Continue treinando!";
  }
  
  if (workoutStatusElement) {
    workoutStatusElement.textContent = status;
  }
}

function updateDietSummary() {
  try {
    const summary = loadUserData("dailySummary", {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    });
    
    const goal = loadUserData("dailyCalorieGoal", 2000);

    const currentCalories = Number(summary.calories) || 0;
    const progress = goal > 0 ? Math.min((currentCalories / goal) * 100, 100) : 0;

    const dietProgressElement = document.getElementById("dietProgress");
    const dietProgressFillElement = document.getElementById("dietProgressFill");
    const dietStatusElement = document.getElementById("dietStatus");

    if (dietProgressElement) {
      dietProgressElement.textContent = `${Math.round(currentCalories)}/${goal} calorias`;
    }

    if (dietProgressFillElement) {
      dietProgressFillElement.style.width = `${progress}%`;
    }

    let status = "Aguardando refeições";
    if (currentCalories > 0) {
      status = progress >= 100 ? "Meta atingida! 🎉" : "Em andamento";
    }
    
    if (dietStatusElement) {
      dietStatusElement.textContent = status;
    }
  } catch (error) {
    console.error("Erro ao atualizar resumo da dieta:", error);
    
    const dietProgressElement = document.getElementById("dietProgress");
    const dietProgressFillElement = document.getElementById("dietProgressFill");
    const dietStatusElement = document.getElementById("dietStatus");
    
    if (dietProgressElement) dietProgressElement.textContent = "0/2000 calorias";
    if (dietProgressFillElement) dietProgressFillElement.style.width = "0%";
    if (dietStatusElement) dietStatusElement.textContent = "Aguardando refeições";
  }
}

function updateHydrationSummary() {
  const hydrationData = loadUserData("hydration", {});
  const todayConsumption = hydrationData.consumption || [];
  const totalConsumed = todayConsumption.reduce((total, item) => total + item.ml, 0);

  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const userWeight = userData.weight || 70;
  const dailyGoal = Math.round(userWeight * 35);

  const progress = dailyGoal > 0 ? Math.min((totalConsumed / dailyGoal) * 100, 100) : 0;

  const hydrationProgressElement = document.getElementById("hydrationProgress");
  const hydrationProgressFillElement = document.getElementById("hydrationProgressFill");
  const hydrationStatusElement = document.getElementById("hydrationStatus");

  if (hydrationProgressElement) {
    hydrationProgressElement.textContent = `${Math.round(totalConsumed)}/${dailyGoal} ml`;
  }

  if (hydrationProgressFillElement) {
    hydrationProgressFillElement.style.width = `${progress}%`;
  }

  let status = "Comece a beber água!";
  if (totalConsumed > 0) {
    status = progress >= 100 ? "Hidratado! 💧" : "Continue bebendo água";
  }
  
  if (hydrationStatusElement) {
    hydrationStatusElement.textContent = status;
  }
}

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
    "O sacrifício hoje trará resultados amanhã!",
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  const quoteElement = document.getElementById("motivationalQuote");
  if (quoteElement) {
    quoteElement.textContent = randomQuote;
  }
}

function updateDailyTip() {
  const tips = [
    {
      tip: "Beba um copo de água ao acordar para ativar o metabolismo",
      icon: "fa-tint",
    },
    {
      tip: "Alongue-se por 5 minutos antes do treino para prevenir lesões",
      icon: "fa-running",
    },
    {
      tip: "Mantenha uma garrafa de água sempre visível para lembrar de beber",
      icon: "fa-wine-bottle",
    },
    {
      tip: "Durma 7-8 horas por noite para melhor recuperação muscular",
      icon: "fa-bed",
    },
    {
      tip: "Inclua proteínas em todas as refeições principais",
      icon: "fa-egg",
    },
    {
      tip: "Faça pequenas pausas ativas durante o dia para se movimentar",
      icon: "fa-walking",
    },
    {
      tip: "Consuma frutas e vegetais coloridos para variedade de nutrientes",
      icon: "fa-apple-alt",
    },
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  const tipElement = document.getElementById("dailyTip");
  const tipIconElement = document.getElementById("tipIcon");
  
  if (tipElement) {
    tipElement.textContent = randomTip.tip;
  }
  
  if (tipIconElement) {
    tipIconElement.className = `fas ${randomTip.icon}`;
  }
}

function loadQuickStats() {
  updatePersonalStats();
}

function updatePersonalStats() {
  const workouts = loadUserData("workouts", []);
  let completedExercisesToday = 0;
  const today = new Date().toDateString();

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
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
  
  const totalWorkoutsElement = document.getElementById("totalWorkouts");
  if (totalWorkoutsElement) {
    totalWorkoutsElement.textContent = completedExercisesToday;
  }

  const meals = loadUserData("meals", []);
  let mealsWithFoodToday = 0;
  const todayISO = new Date().toISOString().split("T")[0];

  meals.forEach((meal) => {
    const hasFoodToday = meal.foods.some((food) => {
      if (!food.completedDate) return false;
      const foodDate = new Date(food.completedDate).toISOString().split("T")[0];
      return foodDate === todayISO;
    });
    if (hasFoodToday) {
      mealsWithFoodToday++;
    }
  });
  
  const totalMealsElement = document.getElementById("totalMeals");
  if (totalMealsElement) {
    totalMealsElement.textContent = mealsWithFoodToday;
  }

  const hydrationData = loadUserData("hydration", {});
  const todayConsumption = hydrationData.consumption || [];
  const totalWater = todayConsumption.reduce((total, item) => total + item.ml, 0) / 1000;
  
  const waterConsumedElement = document.getElementById("waterConsumed");
  if (waterConsumedElement) {
    waterConsumedElement.textContent = totalWater.toFixed(1) + "L";
  }

  const streak = calculateCurrentStreak();
  const currentStreakElement = document.getElementById("currentStreak");
  if (currentStreakElement) {
    currentStreakElement.textContent = streak;
  }
}

function calculateCurrentStreak() {
  const workouts = loadUserData("workouts", []);
  const today = new Date().toDateString();
  let activityToday = false;

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
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
  return activityToday ? 1 : 0;
}

function updateQuickActions() {
  updateWorkoutBadge();
  updateDietBadge();
  updateHydrationBadge();
  updatePlanningBadge();
}

function updateWorkoutBadge() {
  const workouts = loadUserData("workouts", []);
  let completedExercisesToday = 0;
  const today = new Date().toDateString();

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
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

  const workoutBadgeElement = document.getElementById("workoutBadge");
  if (workoutBadgeElement) {
    workoutBadgeElement.textContent = `${completedExercisesToday} exercício${completedExercisesToday !== 1 ? "s" : ""} hoje`;
  }
}

function updateDietBadge() {
  const summary = loadUserData("dailySummary", { calories: 0 });
  const dietBadgeElement = document.getElementById("dietBadge");
  if (dietBadgeElement) {
    dietBadgeElement.textContent = `${Math.round(summary.calories)} calorias hoje`;
  }
}

function updateHydrationBadge() {
  const hydrationData = loadUserData("hydration", {});
  const todayConsumption = hydrationData.consumption || [];
  const totalConsumed = todayConsumption.reduce((total, item) => total + item.ml, 0);
  
  const hydrationBadgeElement = document.getElementById("hydrationBadge");
  if (hydrationBadgeElement) {
    hydrationBadgeElement.textContent = `${Math.round(totalConsumed)} ml hoje`;
  }
}

function updatePlanningBadge() {
  const events = loadUserData("planning_events", {});
  const today = new Date().toISOString().split("T")[0];
  const todayEvents = events[today] || [];
  
  const planningBadgeElement = document.getElementById("planningBadge");
  if (planningBadgeElement) {
    planningBadgeElement.textContent = `${todayEvents.length} evento${todayEvents.length !== 1 ? "s" : ""} hoje`;
  }
}

// Sistema de keep-alive do backend
function startBackendKeepAlive() {
  return setInterval(async () => {
    try {
      await fetch('https://biometa.onrender.com/api/health', {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      console.log('✅ Backend mantido ativo:', new Date().toLocaleTimeString());
    } catch (error) {
      console.log('⚠️ Backend pode estar em cold start');
    }
  }, 4 * 60 * 1000); // A cada 4 minutos
}

// Event listeners para atualizações em tempo real
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    console.log("🔄 Página visível, atualizando dados...");
    loadDailySummary();
    updateQuickActions();
    updatePersonalStats();
  }
});

window.addEventListener("pageshow", function () {
  console.log("🔄 Página mostrada, atualizando dados...");
  loadDailySummary();
  updateQuickActions();
  updatePersonalStats();
});

// Atualização periódica
setInterval(() => {
  loadDailySummary();
  updateQuickActions();
  updatePersonalStats();
}, 60000);