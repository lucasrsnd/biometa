let dailyGoal = 0;
let todayConsumption = [];
let challenges = {};

document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    window.location.href = "login.html";
    return;
  }

  console.log(`=== CARREGANDO DADOS DO USUÁRIO ${user.id} ===`);

  initNavbar();

  initParticles();

  setupIntersectionObserver();

  setupEventListeners();

  initializeHydrationSystem();
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

  loadUserData();
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
          value: "#36a2eb",
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
          color: "#36a2eb",
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

function setupIntersectionObserver() {
  const sections = document.querySelectorAll(
    ".hydration-section, .side-section"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");

          const cards = entry.target.querySelectorAll(".card");
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

function loadUserData() {
  const userData = JSON.parse(localStorage.getItem("user")) || {
    firstName: "Usuário",
    lastName: "BioMeta",
  };

  const initials =
    (userData.firstName?.charAt(0) || "U") +
    (userData.lastName?.charAt(0) || "B");
  document.getElementById("navbarAvatar").textContent = initials;
  document.getElementById("navbarName").textContent = `${
    userData.firstName || "Usuário"
  } ${userData.lastName || "BioMeta"}`;

  return userData;
}

function getCurrentUserId() {
  const user = JSON.parse(localStorage.getItem("user"));
  return user ? user.id : null;
}

function getUserKey(key) {
  const userId = getCurrentUserId();
  return userId ? `${key}_${userId}` : key;
}

function initializeHydrationSystem() {
  calculateDailyGoal();
  loadTodayConsumption();
  loadChallenges();
  updateDisplay();
  checkDailyReset();
}

function calculateDailyGoal() {
  const userData = JSON.parse(localStorage.getItem("user")) || {};
  const userWeight = userData.weight || 70;

  dailyGoal = Math.round(userWeight * 35);

  document.getElementById(
    "dailyGoal"
  ).textContent = `${dailyGoal.toLocaleString()} ml`;
  document.getElementById("userWeight").textContent = userWeight;
}

function setupEventListeners() {
  document.querySelectorAll(".btn-quantity").forEach((btn) => {
    btn.addEventListener("click", function () {
      const ml = parseInt(this.dataset.ml);
      addConsumption(ml);
    });
  });

  document
    .getElementById("addCustomConsumption")
    .addEventListener("click", function () {
      const customMl = document.getElementById("customMl").value;
      if (customMl && !isNaN(customMl) && customMl > 0) {
        addConsumption(parseInt(customMl));
        document.getElementById("customMl").value = "";
      } else {
        alert("Por favor, informe uma quantidade válida em ml.");
      }
    });

  document
    .getElementById("customMl")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        document.getElementById("addCustomConsumption").click();
      }
    });
}

function addConsumption(ml) {
  const consumption = {
    id: Date.now(),
    ml: ml,
    timestamp: new Date().toISOString(),
    time: new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  todayConsumption.push(consumption);
  saveTodayConsumption();
  updateDisplay();
  updateChallenges();

  showConsumptionFeedback(ml);
}

function showConsumptionFeedback(ml) {
  const feedback = document.createElement("div");
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

function loadTodayConsumption() {
  const today = new Date().toDateString();
  const hydrationData =
    JSON.parse(localStorage.getItem(getUserKey("hydration"))) || {};

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
    consumption: todayConsumption,
  };

  localStorage.setItem(getUserKey("hydration"), JSON.stringify(hydrationData));
}

function updateDisplay() {
  const totalConsumed = todayConsumption.reduce(
    (total, item) => total + item.ml,
    0
  );
  const progress =
    dailyGoal > 0 ? Math.min((totalConsumed / dailyGoal) * 100, 100) : 0;

  document.getElementById(
    "consumedToday"
  ).textContent = `${totalConsumed.toLocaleString()} ml`;
  document.getElementById("remainingGoal").textContent = `${Math.max(
    0,
    dailyGoal - totalConsumed
  ).toLocaleString()} ml restantes`;
  document.getElementById(
    "totalToday"
  ).textContent = `${totalConsumed.toLocaleString()} ml`;
  document.getElementById("totalRecords").textContent = todayConsumption.length;
  document.getElementById("waterFill").style.width = `${progress}%`;
  document.getElementById("progressText").textContent = `${Math.round(
    progress
  )}% da meta atingida`;

  updateTimeInfo();
  updateHistoryList();
}

function updateHistoryList() {
  const historyList = document.getElementById("historyList");

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
    .map(
      (consumption) => `
            <div class="history-item">
                <div class="history-amount">${consumption.ml.toLocaleString()} ml</div>
                <div class="history-time">${consumption.time}</div>
            </div>
        `
    )
    .join("");
}

function updateTimeInfo() {
  const now = new Date();
  const hours = now.getHours();
  let message = "";

  if (hours < 12) {
    message = "Bom dia! 💪 Mantenha-se hidratado!";
  } else if (hours < 18) {
    message = "Boa tarde! 🌞 Continue bebendo água!";
  } else {
    message = "Boa noite! 🌙 Hidrate-se antes de dormir!";
  }

  document.getElementById("timeInfo").textContent = message;
}

function clearTodayHistory() {
  if (
    confirm(
      "Tem certeza que deseja limpar todo o histórico de hoje? Isso não afetará seus desafios conquistados."
    )
  ) {
    todayConsumption = [];
    saveTodayConsumption();
    updateDisplay();
    updateChallenges();

    const clearBtn = document.querySelector('[onclick="clearTodayHistory()"]');
    const originalText = clearBtn.innerHTML;
    clearBtn.innerHTML = '<i class="fas fa-check"></i> Limpo!';
    clearBtn.style.background = "linear-gradient(135deg, #27ae60, #229954)";

    setTimeout(() => {
      clearBtn.innerHTML = originalText;
      clearBtn.style.background = "";
    }, 2000);
  }
}

function loadChallenges() {
  const saved =
    JSON.parse(localStorage.getItem(getUserKey("hydration_challenges"))) || {};

  challenges = {
    early: saved.early || false,
    bottle: saved.bottle || false,
    streak: saved.streak || { current: 0, max: 30, lastCompleted: null },
    bottleClicks: saved.bottleClicks || 0,
    lastUpdated: saved.lastUpdated || new Date().toDateString(),
  };
}

function saveChallenges() {
  challenges.lastUpdated = new Date().toDateString();
  localStorage.setItem(
    getUserKey("hydration_challenges"),
    JSON.stringify(challenges)
  );
}

function updateChallenges() {
  const totalConsumed = todayConsumption.reduce(
    (total, item) => total + item.ml,
    0
  );
  const today = new Date().toDateString();

  if (challenges.lastUpdated !== today) {
    resetDailyChallenges();
  }

  const earlyConsumption = todayConsumption
    .filter((item) => {
      const hour = new Date(item.timestamp).getHours();
      return hour < 10; // Antes das 10h
    })
    .reduce((total, item) => total + item.ml, 0);

  challenges.early = earlyConsumption >= 500;

  challenges.bottle = totalConsumed >= 2000;

  updateStreakChallenge(totalConsumed, today);

  saveChallenges();
  updateChallengesDisplay();
}

function resetDailyChallenges() {
  const today = new Date().toDateString();

  challenges.early = false;
  challenges.bottle = false;
  challenges.bottleClicks = 0;
  challenges.lastUpdated = today;
}

function updateStreakChallenge(totalConsumed, today) {
  if (challenges.streak.lastCompleted === today) {
    return;
  }

  if (totalConsumed >= dailyGoal) {
    challenges.streak.current++;
    challenges.streak.lastCompleted = today;

    if (challenges.streak.current > challenges.streak.max) {
      challenges.streak.current = challenges.streak.max;
    }
  } else if (
    challenges.streak.lastCompleted &&
    challenges.streak.lastCompleted !== today
  ) {
    const lastCompleted = new Date(challenges.streak.lastCompleted);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastCompleted.toDateString() !== yesterday.toDateString()) {
      challenges.streak.current = 0;
    }
  }
}

function addConsumption(ml) {
  const consumption = {
    id: Date.now(),
    ml: ml,
    timestamp: new Date().toISOString(),
    time: new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  todayConsumption.push(consumption);
  saveTodayConsumption();
  updateDisplay();

  if (ml === 1000) {
    challenges.bottleClicks = (challenges.bottleClicks || 0) + 1;
    if (challenges.bottleClicks >= 2) {
      challenges.bottle = true;
    }
    saveChallenges();
  }

  updateChallenges();

  showConsumptionFeedback(ml);
}

function updateChallengesDisplay() {
  const earlyStatus = document.getElementById("earlyStatus");
  if (earlyStatus) {
    earlyStatus.textContent = challenges.early
      ? "Concluído! 🎉"
      : "Não concluído";
    earlyStatus.className = challenges.early
      ? "challenge-status completed"
      : "challenge-status";
  }

  const bottleStatus = document.getElementById("bottleStatus");
  if (bottleStatus) {
    bottleStatus.textContent = challenges.bottle
      ? "Concluído! 🎉"
      : "Não concluído";
    bottleStatus.className = challenges.bottle
      ? "challenge-status completed"
      : "challenge-status";
  }

  const streakProgress = document.getElementById("streakProgress");
  const streakDays = document.getElementById("streakDays");

  if (streakProgress && streakDays) {
    const progress = (challenges.streak.current / challenges.streak.max) * 100;
    streakProgress.style.width = `${progress}%`;
    streakDays.textContent = `${challenges.streak.current}/${challenges.streak.max} dias`;
  }
}

function checkDailyReset() {
  const lastReset = localStorage.getItem(getUserKey("last_hydration_reset"));
  const today = new Date().toDateString();

  if (!lastReset || lastReset !== today) {
    resetDailyData();
  }
}

function resetDailyData() {
  const today = new Date().toDateString();
  localStorage.setItem(getUserKey("last_hydration_reset"), today);

  const challenges =
    JSON.parse(localStorage.getItem(getUserKey("hydration_challenges"))) || {};
  if (challenges.lastUpdated !== today) {
    challenges.early = false;
    challenges.bottle = false;
    saveChallenges();
  }
}
