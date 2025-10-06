document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    window.location.href = "login.html";
    return;
  }

  console.log(`=== CARREGANDO DADOS DO USUÁRIO ${user.id} ===`);

  initNavbar();

  initializeDashboard();

  initParticles();

  setupIntersectionObserver();
});

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
              card.style.animation = `slideInUp 0.6s ease-out ${
                index * 0.1
              }s both`;
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

async function initializeDashboard() {
  await loadUserData();
  updateDateAndGreeting();

  const hasWorkouts = localStorage.getItem(getUserKey("workouts"));
  const hasMeals = localStorage.getItem(getUserKey("meals"));

  if (hasWorkouts) {
    loadDailySummary();
  } else {
    resetEmptyData();
  }

  if (hasMeals) {
    loadMotivationalContent();
    loadQuickStats();
    updateQuickActions();
  }

  typeWriterEffect();
}

function resetEmptyData() {
  console.log("Inicializando dados vazios para novo usuário");

  const emptyData = {
    workouts: [],
    meals: [],
    dailySummary: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    dailyCalorieGoal: 2000,
    hydration: { date: new Date().toDateString(), consumption: [] },
    hydration_challenges: {
      early: false,
      bottle: false,
      streak: { current: 0, max: 30, lastCompleted: null },
      bottleClicks: 0,
      lastUpdated: new Date().toDateString(),
    },
  };

  Object.keys(emptyData).forEach((key) => {
    localStorage.setItem(getUserKey(key), JSON.stringify(emptyData[key]));
  });

  loadDailySummary();
  loadMotivationalContent();
  loadQuickStats();
  updateQuickActions();
}

async function loadUserData() {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch("https://biometa-backend.onrender.com/api/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const userData = await response.json();

      const userNameElement = document.getElementById("userName");
      if (userNameElement) {
        userNameElement.textContent = `${userData.firstName} ${userData.lastName}`;
      }

      const navbarAvatar = document.getElementById("navbarAvatar");
      const navbarName = document.getElementById("navbarName");

      if (navbarAvatar) {
        const initials =
          userData.firstName.charAt(0) + userData.lastName.charAt(0);
        navbarAvatar.textContent = initials;
      }

      if (navbarName) {
        navbarName.textContent = `${userData.firstName} ${userData.lastName}`;
      }

      const currentUser = JSON.parse(localStorage.getItem("user")) || {};
      const updatedUser = {
        ...currentUser,
        ...userData,
        id: currentUser.id || userData.id,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } else if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "login.html";
    } else {
      throw new Error("Erro ao carregar dados");
    }
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error);
    const userData = JSON.parse(localStorage.getItem("user")) || {
      firstName: "Usuário",
      lastName: "BioMeta",
    };

    const userNameElement = document.getElementById("userName");
    if (userNameElement) {
      userNameElement.textContent = `${userData.firstName} ${userData.lastName}`;
    }

    const navbarAvatar = document.getElementById("navbarAvatar");
    const navbarName = document.getElementById("navbarName");

    if (navbarAvatar) {
      const initials =
        (userData.firstName?.charAt(0) || "U") +
        (userData.lastName?.charAt(0) || "B");
      navbarAvatar.textContent = initials;
    }

    if (navbarName) {
      navbarName.textContent = `${userData.firstName} ${userData.lastName}`;
    }
  }
}

function loadSavedMeals() {
  const meals = JSON.parse(localStorage.getItem(getUserKey("meals"))) || [];

  const isValidData = meals.every(
    (meal) => meal && typeof meal === "object" && meal.id && meal.name
  );

  if (meals.length > 0 && isValidData) {
    document.getElementById("noMealsState").style.display = "none";
    meals.forEach((meal) => renderMeal(meal));

    if (!selectedMealId && meals.length > 0) {
      selectMeal(meals[0].id);
    }
  } else {
    console.log("Dados de refeições inválidos detectados, limpando...");
    localStorage.setItem(getUserKey("meals"), JSON.stringify([]));
    document.getElementById("noMealsState").style.display = "block";
  }
}

function typeWriterEffect() {
  const welcomeText = document.getElementById("userName").textContent;
  const greetingElement = document.getElementById("userName");
  const emojiElement = document.getElementById("greetingEmoji");
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
  document.getElementById("currentDate").textContent = now.toLocaleDateString(
    "pt-BR",
    options
  );

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

function loadDailySummary() {
  updateWorkoutSummary();
  updateDietSummary();
  updateHydrationSummary();
}

function updateWorkoutSummary() {
  const workouts =
    JSON.parse(localStorage.getItem(getUserKey("workouts"))) || [];
  let completedExercisesToday = 0;
  const today = new Date().toDateString();

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      if (
        exercise.completedWeight !== null &&
        exercise.completedReps !== null
      ) {
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

  document.getElementById(
    "workoutProgress"
  ).textContent = `${completedExercisesToday} exercício${
    completedExercisesToday !== 1 ? "s" : ""
  } feito${completedExercisesToday !== 1 ? "s" : ""} hoje`;
  document.getElementById("workoutProgressFill").style.width = `${progress}%`;

  let status = "Nenhum exercício hoje";
  if (completedExercisesToday > 0) {
    status = "Continue treinando!";
  }
  document.getElementById("workoutStatus").textContent = status;
}

function updateDietSummary() {
  try {
    const summary = JSON.parse(
      localStorage.getItem(getUserKey("dailySummary"))
    ) || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    const goal =
      parseInt(localStorage.getItem(getUserKey("dailyCalorieGoal"))) || 2000;

    const currentCalories = Number(summary.calories) || 0;
    const progress =
      goal > 0 ? Math.min((currentCalories / goal) * 100, 100) : 0;

    document.getElementById("dietProgress").textContent = `${Math.round(
      currentCalories
    )}/${goal} calorias`;
    document.getElementById("dietProgressFill").style.width = `${progress}%`;

    let status = "Aguardando refeições";
    if (currentCalories > 0) {
      status = progress >= 100 ? "Meta atingida! 🎉" : "Em andamento";
    }
    document.getElementById("dietStatus").textContent = status;
  } catch (error) {
    console.error("Erro ao atualizar resumo da dieta:", error);
    document.getElementById("dietProgress").textContent = "0/2000 calorias";
    document.getElementById("dietProgressFill").style.width = "0%";
    document.getElementById("dietStatus").textContent = "Aguardando refeições";
  }
}

function updateHydrationSummary() {
  const hydrationData =
    JSON.parse(localStorage.getItem(getUserKey("hydration"))) || {};
  const todayConsumption = hydrationData.consumption || [];
  const totalConsumed = todayConsumption.reduce(
    (total, item) => total + item.ml,
    0
  );

  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const userWeight = userData.weight || 70;
  const dailyGoal = Math.round(userWeight * 35);

  const progress =
    dailyGoal > 0 ? Math.min((totalConsumed / dailyGoal) * 100, 100) : 0;

  document.getElementById("hydrationProgress").textContent = `${Math.round(
    totalConsumed
  )}/${dailyGoal} ml`;
  document.getElementById("hydrationProgressFill").style.width = `${progress}%`;

  let status = "Comece a beber água!";
  if (totalConsumed > 0) {
    status = progress >= 100 ? "Hidratado! 💧" : "Continue bebendo água";
  }
  document.getElementById("hydrationStatus").textContent = status;
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
  document.getElementById("motivationalQuote").textContent = randomQuote;
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
  document.getElementById("dailyTip").textContent = randomTip.tip;
  document.getElementById("tipIcon").className = `fas ${randomTip.icon}`;
}

function loadQuickStats() {
  updatePersonalStats();
}

function updatePersonalStats() {
  const workouts =
    JSON.parse(localStorage.getItem(getUserKey("workouts"))) || [];
  let completedExercisesToday = 0;
  const today = new Date().toDateString();

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      if (
        exercise.completedWeight !== null &&
        exercise.completedReps !== null
      ) {
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
  document.getElementById("totalWorkouts").textContent =
    completedExercisesToday;

  const meals = JSON.parse(localStorage.getItem(getUserKey("meals"))) || [];
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
  document.getElementById("totalMeals").textContent = mealsWithFoodToday;

  const hydrationData =
    JSON.parse(localStorage.getItem(getUserKey("hydration"))) || {};
  const todayConsumption = hydrationData.consumption || [];
  const totalWater =
    todayConsumption.reduce((total, item) => total + item.ml, 0) / 1000;
  document.getElementById("waterConsumed").textContent =
    totalWater.toFixed(1) + "L";

  const streak = calculateCurrentStreak();
  document.getElementById("currentStreak").textContent = streak;
}

function calculateCurrentStreak() {
  const workouts =
    JSON.parse(localStorage.getItem(getUserKey("workouts"))) || [];
  const today = new Date().toDateString();
  let activityToday = false;

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      if (
        exercise.completedWeight !== null &&
        exercise.completedReps !== null
      ) {
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
  const workouts =
    JSON.parse(localStorage.getItem(getUserKey("workouts"))) || [];
  let completedExercisesToday = 0;
  const today = new Date().toDateString();

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      if (
        exercise.completedWeight !== null &&
        exercise.completedReps !== null
      ) {
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

  document.getElementById(
    "workoutBadge"
  ).textContent = `${completedExercisesToday} exercício${
    completedExercisesToday !== 1 ? "s" : ""
  } hoje`;
}

function updateDietBadge() {
  const summary = JSON.parse(
    localStorage.getItem(getUserKey("dailySummary"))
  ) || { calories: 0 };
  document.getElementById("dietBadge").textContent = `${Math.round(
    summary.calories
  )} calorias hoje`;
}

function updateHydrationBadge() {
  const hydrationData =
    JSON.parse(localStorage.getItem(getUserKey("hydration"))) || {};
  const todayConsumption = hydrationData.consumption || [];
  const totalConsumed = todayConsumption.reduce(
    (total, item) => total + item.ml,
    0
  );
  document.getElementById("hydrationBadge").textContent = `${Math.round(
    totalConsumed
  )} ml hoje`;
}

function updatePlanningBadge() {
  const events =
    JSON.parse(localStorage.getItem(getUserKey("planning_events"))) || {};
  const today = new Date().toISOString().split("T")[0];
  const todayEvents = events[today] || [];
  document.getElementById("planningBadge").textContent = `${
    todayEvents.length
  } evento${todayEvents.length !== 1 ? "s" : ""} hoje`;
}

function getCurrentUserId() {
  const user = JSON.parse(localStorage.getItem("user"));
  return user ? user.id : null;
}

function getUserKey(key) {
  const userId = getCurrentUserId();
  return userId ? `${key}_${userId}` : key;
}

document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    loadDailySummary();
    updateQuickActions();
    updatePersonalStats();
  }
});

window.addEventListener("pageshow", function () {
  loadDailySummary();
  updateQuickActions();
  updatePersonalStats();
});

setInterval(() => {
  loadDailySummary();
  updateQuickActions();
  updatePersonalStats();
}, 60000);
