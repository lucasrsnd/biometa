document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    window.location.href = "login.html";
    return;
  }

  console.log(`=== CARREGANDO DADOS DO USUÁRIO ${user.id} ===`);

  initNavbar();

  clearPreviousUserData();

  loadUserData();

  initializeCalendar();
  initializeTodoList();
  initializeNotes();

  setupEventListeners();

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
    ".planning-section, .side-section"
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

  const navbarAvatar = document.getElementById("navbarAvatar");
  const navbarName = document.getElementById("navbarName");

  if (navbarAvatar) {
    navbarAvatar.textContent = initials;
  }

  if (navbarName) {
    navbarName.textContent = `${userData.firstName || "Usuário"} ${
      userData.lastName || "BioMeta"
    }`;
  }
}

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = null;
let events = {};

function initializeCalendar() {
  generateCalendar();
  loadEvents();
}

function createDateString(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

function getTodayFormatted() {
  const today = new Date();
  return createDateString(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
}

function generateCalendar() {
  const calendar = document.getElementById("calendar");
  if (!calendar) return;

  calendar.innerHTML = "";

  updateMonthDisplay();

  const monthContainer = document.createElement("div");
  monthContainer.className = "month-container";

  const monthHeader = document.createElement("div");
  monthHeader.className = "month-header";
  monthHeader.textContent = new Date(currentYear, currentMonth).toLocaleString(
    "pt-BR",
    {
      month: "long",
      year: "numeric",
    }
  );

  const monthGrid = document.createElement("div");
  monthGrid.className = "month-grid";

  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  daysOfWeek.forEach((day) => {
    const dayHeader = document.createElement("div");
    dayHeader.className = "day-header";
    dayHeader.textContent = day;
    monthGrid.appendChild(dayHeader);
  });

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();

  for (let i = 0; i < firstDay.getDay(); i++) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "day empty";
    monthGrid.appendChild(emptyDay);
  }

  const todayFormatted = getTodayFormatted();

  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement("div");
    dayElement.className = "day";
    dayElement.textContent = day;

    const dateFormatted = createDateString(currentYear, currentMonth, day);
    dayElement.dataset.date = dateFormatted;

    if (dateFormatted === todayFormatted) {
      dayElement.classList.add("today");
    }

    const dateObj = new Date(currentYear, currentMonth, day);
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    if (dateObj < todayObj && dateFormatted !== todayFormatted) {
      dayElement.classList.add("past");
    }

    if (events[dateFormatted]) {
      dayElement.classList.add("has-events");
    }

    dayElement.addEventListener("click", () => selectDate(dateFormatted));
    monthGrid.appendChild(dayElement);
  }

  monthContainer.appendChild(monthHeader);
  monthContainer.appendChild(monthGrid);
  calendar.appendChild(monthContainer);
}

function updateMonthDisplay() {
  const currentMonthElement = document.getElementById("currentMonth");
  if (currentMonthElement) {
    currentMonthElement.textContent = new Date(
      currentYear,
      currentMonth
    ).toLocaleString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  }
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  generateCalendar();
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  generateCalendar();
}

function selectDate(date) {
  selectedDate = date;

  document.querySelectorAll(".day.selected").forEach((day) => {
    day.classList.remove("selected");
  });

  const selectedDay = document.querySelector(`.day[data-date="${date}"]`);
  if (selectedDay) {
    selectedDay.classList.add("selected");
  }

  showDayEvents(date);
}

function showDayEvents(date) {
  const dayEvents = document.getElementById("dayEvents");
  const selectedDateElement = document.getElementById("selectedDate");
  const eventsList = document.getElementById("eventsList");

  if (!dayEvents || !selectedDateElement || !eventsList) return;

  const [year, month, day] = date.split("-");
  const displayDate = `${day}/${month}/${year}`;

  selectedDateElement.textContent = displayDate;

  eventsList.innerHTML = "";

  if (events[date] && events[date].length > 0) {
    events[date].forEach((event, index) => {
      const eventElement = document.createElement("div");
      eventElement.className = "event-item";
      eventElement.innerHTML = `
                <div class="event-color" style="background-color: ${
                  event.color
                }"></div>
                <div class="event-content">
                    <div class="event-title">${event.title}</div>
                    ${
                      event.description
                        ? `<div class="event-description">${event.description}</div>`
                        : ""
                    }
                </div>
                <div class="event-actions">
                    <button class="btn btn-small btn-outline" onclick="deleteEvent('${date}', ${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
      eventsList.appendChild(eventElement);
    });
  } else {
    eventsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-plus"></i>
                <p>Nenhum evento para este dia.</p>
                <p>Clique em "Add Evento" para adicionar.</p>
            </div>
        `;
  }

  dayEvents.style.display = "block";
}

let tasks = {
  todo: [],
  doing: [],
  done: [],
};

function initializeTodoList() {
  loadTasks();
  renderTasks();
  setupDragAndDrop();
}

function setupDragAndDrop() {
  const columns = document.querySelectorAll(".column-content");

  columns.forEach((column) => {
    column.addEventListener("dragover", handleDragOver);
    column.addEventListener("drop", handleDrop);
  });
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();
  const taskId = e.dataTransfer.getData("text/plain");
  const newColumn = e.target.closest(".column-content").dataset.column;

  moveTask(taskId, newColumn);
}

function moveTask(taskId, newColumn) {
  let task = null;
  let oldColumn = null;

  for (const [column, columnTasks] of Object.entries(tasks)) {
    const taskIndex = columnTasks.findIndex((t) => t.id === taskId);
    if (taskIndex !== -1) {
      task = columnTasks[taskIndex];
      oldColumn = column;
      tasks[column].splice(taskIndex, 1);
      break;
    }
  }

  if (task && oldColumn !== newColumn) {
    tasks[newColumn].push(task);
    saveTasks();
    renderTasks();
  }
}

function renderTasks() {
  const todoColumn = document.getElementById("todoColumn");
  const doingColumn = document.getElementById("doingColumn");
  const doneColumn = document.getElementById("doneColumn");

  if (!todoColumn || !doingColumn || !doneColumn) return;

  todoColumn.innerHTML = "";
  doingColumn.innerHTML = "";
  doneColumn.innerHTML = "";

  const todoCount = document.getElementById("todoCount");
  const doingCount = document.getElementById("doingCount");
  const doneCount = document.getElementById("doneCount");

  if (todoCount) todoCount.textContent = tasks.todo.length;
  if (doingCount) doingCount.textContent = tasks.doing.length;
  if (doneCount) doneCount.textContent = tasks.done.length;

  renderColumnTasks("todo", tasks.todo);
  renderColumnTasks("doing", tasks.doing);
  renderColumnTasks("done", tasks.done);
}

function renderColumnTasks(columnId, columnTasks) {
  const column = document.getElementById(columnId + "Column");
  if (!column) return;

  if (columnTasks.length === 0) {
    column.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <p>Nenhuma tarefa</p>
            </div>
        `;
    return;
  }

  columnTasks.forEach((task) => {
    const taskElement = document.createElement("div");
    taskElement.className = "task-item";
    taskElement.draggable = true;
    taskElement.dataset.taskId = task.id;

    taskElement.innerHTML = `
            <div class="task-title">${task.title}</div>
            <div class="task-actions">
                <button class="btn btn-small btn-outline" onclick="deleteTask('${task.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

    taskElement.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", task.id);
      taskElement.classList.add("dragging");
    });

    taskElement.addEventListener("dragend", () => {
      taskElement.classList.remove("dragging");
    });

    column.appendChild(taskElement);
  });
}

function initializeNotes() {
  loadNotes();
  updateNotesDate();
}

function updateNotesDate() {
  const notesDate = document.getElementById("notesDate");
  if (!notesDate) return;

  const today = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  notesDate.textContent = today.toLocaleDateString("pt-BR", options);
}

function setupEventListeners() {
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");

  if (prevMonthBtn) {
    prevMonthBtn.addEventListener("click", prevMonth);
  }

  if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", nextMonth);
  }

  document
    .getElementById("addEventBtn")
    .addEventListener("click", showEventModal);
  document
    .getElementById("addEventToDay")
    .addEventListener("click", showEventModal);

  document.getElementById("eventForm").addEventListener("submit", addEvent);
  document.querySelector(".close").addEventListener("click", hideEventModal);
  document
    .getElementById("cancelEventBtn")
    .addEventListener("click", hideEventModal);

  document.getElementById("addTaskBtn").addEventListener("click", showTaskForm);
  document
    .getElementById("cancelTaskBtn")
    .addEventListener("click", hideTaskForm);
  document.getElementById("taskForm").addEventListener("submit", addTask);

  document.getElementById("saveNotesBtn").addEventListener("click", saveNotes);
  document
    .getElementById("dailyNotes")
    .addEventListener("input", updateNotesCount);

  window.addEventListener("click", (e) => {
    const modal = document.getElementById("eventModal");
    if (e.target === modal) {
      hideEventModal();
    }
  });
}

function goToToday() {
  const today = new Date();
  currentMonth = today.getMonth();
  currentYear = today.getFullYear();
  generateCalendar();

  const todayFormatted = getTodayFormatted();
  selectDate(todayFormatted);
}

function showEventModal() {
  const modal = document.getElementById("eventModal");
  const eventDate = document.getElementById("eventDate");

  if (!modal || !eventDate) return;

  if (selectedDate) {
    eventDate.value = selectedDate;
  } else {
    eventDate.value = getTodayFormatted();
  }

  modal.style.display = "block";
}

function hideEventModal() {
  const modal = document.getElementById("eventModal");
  const eventForm = document.getElementById("eventForm");

  if (modal) modal.style.display = "none";
  if (eventForm) eventForm.reset();
}

function addEvent(e) {
  e.preventDefault();

  const title = document.getElementById("eventTitle")?.value.trim();
  const description = document.getElementById("eventDescription")?.value.trim();
  const date = document.getElementById("eventDate")?.value;
  const colorInput = document.querySelector('input[name="eventColor"]:checked');

  if (!title || !date || !colorInput) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  const color = colorInput.value;

  const event = {
    id: Date.now(),
    title,
    description,
    date,
    color,
    createdAt: new Date().toISOString(),
  };

  if (!events[date]) {
    events[date] = [];
  }

  events[date].push(event);
  saveEvents();

  generateCalendar();

  if (selectedDate === date) {
    showDayEvents(date);
  }

  hideEventModal();
  alert("Evento adicionado com sucesso!");
}

function deleteEvent(date, index) {
  if (confirm("Tem certeza que deseja excluir este evento?")) {
    events[date].splice(index, 1);

    if (events[date].length === 0) {
      delete events[date];
    }

    saveEvents();
    generateCalendar();
    showDayEvents(date);
  }
}

function showTaskForm() {
  const taskFormContainer = document.getElementById("taskFormContainer");
  const addTaskBtn = document.getElementById("addTaskBtn");

  if (taskFormContainer) taskFormContainer.style.display = "block";
  if (addTaskBtn) addTaskBtn.style.display = "none";
}

function hideTaskForm() {
  const taskFormContainer = document.getElementById("taskFormContainer");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskForm = document.getElementById("taskForm");

  if (taskFormContainer) taskFormContainer.style.display = "none";
  if (addTaskBtn) addTaskBtn.style.display = "block";
  if (taskForm) taskForm.reset();
}

function addTask(e) {
  e.preventDefault();

  const title = document.getElementById("taskTitle")?.value.trim();
  const column = document.getElementById("taskColumn")?.value;

  if (!title) {
    alert("Por favor, informe o título da tarefa.");
    return;
  }

  const task = {
    id: "task_" + Date.now(),
    title,
    column,
    createdAt: new Date().toISOString(),
  };

  tasks[column].push(task);
  saveTasks();
  renderTasks();
  hideTaskForm();
}

function deleteTask(taskId) {
  if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
    for (const column of Object.keys(tasks)) {
      tasks[column] = tasks[column].filter((task) => task.id !== taskId);
    }
    saveTasks();
    renderTasks();
  }
}

function updateNotesCount() {
  const textarea = document.getElementById("dailyNotes");
  const countElement = document.getElementById("notesCount");

  if (!textarea || !countElement) return;

  const count = textarea.value.length;
  countElement.textContent = count;
}

function getCurrentUserId() {
  const user = JSON.parse(localStorage.getItem("user"));
  return user ? user.id : null;
}

function getUserKey(key) {
  const userId = getCurrentUserId();
  return userId ? `${key}_${userId}` : key;
}

function loadEvents() {
  events =
    JSON.parse(localStorage.getItem(getUserKey("planning_events"))) || {};
}

function saveEvents() {
  localStorage.setItem(getUserKey("planning_events"), JSON.stringify(events));
}

function loadTasks() {
  const savedTasks = JSON.parse(
    localStorage.getItem(getUserKey("planning_tasks"))
  );
  if (savedTasks) {
    tasks = savedTasks;
  } else {
    tasks = {
      todo: [],
      doing: [],
      done: [],
    };
  }
}

function saveTasks() {
  localStorage.setItem(getUserKey("planning_tasks"), JSON.stringify(tasks));
}

function loadNotes() {
  const today = new Date().toISOString().split("T")[0];
  const notes =
    JSON.parse(localStorage.getItem(getUserKey("planning_notes"))) || {};
  const dailyNotes = document.getElementById("dailyNotes");

  if (dailyNotes) {
    dailyNotes.value = notes[today] || "";
  }
  updateNotesCount();
}

function saveNotes() {
  const today = new Date().toISOString().split("T")[0];
  const notes =
    JSON.parse(localStorage.getItem(getUserKey("planning_notes"))) || {};
  const dailyNotes = document.getElementById("dailyNotes");
  const saveBtn = document.getElementById("saveNotesBtn");

  if (!dailyNotes || !saveBtn) return;

  notes[today] = dailyNotes.value;
  localStorage.setItem(getUserKey("planning_notes"), JSON.stringify(notes));

  const originalText = saveBtn.innerHTML;
  saveBtn.innerHTML = '<i class="fas fa-check"></i> Salvo!';
  saveBtn.style.background = "linear-gradient(135deg, #27ae60, #229954)";

  setTimeout(() => {
    saveBtn.innerHTML = originalText;
    saveBtn.style.background = "";
  }, 2000);
}

function clearPreviousUserData() {
  const userId = getCurrentUserId();
  if (!userId) return;

  const userSpecificKeys = [
    "planning_events",
    "planning_tasks",
    "planning_notes",
    "workouts",
    "meals",
    "dailySummary",
    "dailyCalorieGoal",
    "hydration",
    "hydration_challenges",
    "last_hydration_reset",
    "lastDailyReset",
  ];

  userSpecificKeys.forEach((key) => {
    if (
      localStorage.getItem(key) &&
      !localStorage.getItem(`${key}_${userId}`)
    ) {
      localStorage.removeItem(key);
    }
  });
}
