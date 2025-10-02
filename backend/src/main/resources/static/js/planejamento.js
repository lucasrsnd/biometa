document.addEventListener('DOMContentLoaded', function() {
    // Limpar dados de usuários anteriores (se necessário)
    clearPreviousUserData();
    
    // Carregar dados do usuário
    loadUserData();
    
    // Inicializar componentes
    initializeCalendar();
    initializeTodoList();
    initializeNotes();
    
    // Configurar event listeners
    setupEventListeners();
});

// Carregar dados do usuário
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('user')) || {
        firstName: 'Usuário',
        lastName: 'BioMeta'
    };
    
    const initials = (userData.firstName?.charAt(0) || 'U') + (userData.lastName?.charAt(0) || 'B');
    document.getElementById('navbarAvatar').textContent = initials;
    document.getElementById('navbarName').textContent = `${userData.firstName || 'Usuário'} ${userData.lastName || 'BioMeta'}`;
}

// ========== CALENDÁRIO E AGENDA ========== //

let currentYear = 2025;
let selectedDate = null;
let events = {};

function initializeCalendar() {
    generateCalendar();
    loadEvents();
}

// FUNÇÃO CORRIGIDA: Criar data string sem problemas de timezone
function createDateString(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// FUNÇÃO CORRIGIDA: Obter data atual formatada corretamente
function getTodayFormatted() {
    const today = new Date();
    return createDateString(today.getFullYear(), today.getMonth(), today.getDate());
}

function generateCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    
    document.getElementById('currentYear').textContent = currentYear;
    
    for (let month = 0; month < 12; month++) {
        const monthContainer = document.createElement('div');
        monthContainer.className = 'month-container';
        
        const monthHeader = document.createElement('div');
        monthHeader.className = 'month-header';
        monthHeader.textContent = new Date(currentYear, month).toLocaleString('pt-BR', { month: 'long' });
        
        const monthGrid = document.createElement('div');
        monthGrid.className = 'month-grid';
        
        // Cabeçalho dos dias da semana
        const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        daysOfWeek.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            monthGrid.appendChild(dayHeader);
        });
        
        // Dias do mês
        const firstDay = new Date(currentYear, month, 1);
        const lastDay = new Date(currentYear, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Espaços vazios antes do primeiro dia
        for (let i = 0; i < firstDay.getDay(); i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            monthGrid.appendChild(emptyDay);
        }
        
        // Dias do mês
        const todayFormatted = getTodayFormatted();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            dayElement.textContent = day;
            
            // CORREÇÃO: Usar função própria para criar a data string
            const dateFormatted = createDateString(currentYear, month, day);
            dayElement.dataset.date = dateFormatted;
            
            // Verificar se é hoje
            if (dateFormatted === todayFormatted) {
                dayElement.classList.add('today');
            }
            
            // Verificar se é passado
            const dateObj = new Date(currentYear, month, day);
            const todayObj = new Date();
            todayObj.setHours(0, 0, 0, 0); // Resetar horas para comparar apenas datas
            
            if (dateObj < todayObj && dateFormatted !== todayFormatted) {
                dayElement.classList.add('past');
            }
            
            // Verificar se tem eventos
            if (events[dateFormatted]) {
                dayElement.classList.add('has-events');
            }
            
            dayElement.addEventListener('click', () => selectDate(dateFormatted));
            monthGrid.appendChild(dayElement);
        }
        
        monthContainer.appendChild(monthHeader);
        monthContainer.appendChild(monthGrid);
        calendar.appendChild(monthContainer);
    }
}

// FUNÇÃO CORRIGIDA: selectDate
function selectDate(date) {
    // CORREÇÃO: Manter a data exata que foi clicada
    selectedDate = date;
    
    console.log('Data selecionada:', date); // Para debug
    
    // Remover seleção anterior
    document.querySelectorAll('.day.selected').forEach(day => {
        day.classList.remove('selected');
    });
    
    // Adicionar seleção atual
    const selectedDay = document.querySelector(`.day[data-date="${date}"]`);
    if (selectedDay) {
        selectedDay.classList.add('selected');
    }
    
    // CORREÇÃO: Mostrar eventos imediatamente com a data correta
    showDayEvents(date);
}

// FUNÇÃO CORRIGIDA: showDayEvents
function showDayEvents(date) {
    const dayEvents = document.getElementById('dayEvents');
    const selectedDateElement = document.getElementById('selectedDate');
    const eventsList = document.getElementById('eventsList');

    // CORREÇÃO APLICADA AQUI:
    // Em vez de usar new Date(), vamos manipular a string diretamente.
    const [year, month, day] = date.split("-");
    const displayDate = `${day}/${month}/${year}`;
    
    selectedDateElement.textContent = displayDate;

    eventsList.innerHTML = '';
    
    if (events[date] && events[date].length > 0) {
        events[date].forEach((event, index) => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-item';
            eventElement.innerHTML = `
                <div class="event-color" style="background-color: ${event.color}"></div>
                <div class="event-content">
                    <div class="event-title">${event.title}</div>
                    ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
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

    dayEvents.style.display = 'block';
}

// ========== TO-DO LIST (KANBAN) ========== //

let tasks = {
    todo: [],
    doing: [],
    done: []
};

function initializeTodoList() {
    loadTasks();
    renderTasks();
    setupDragAndDrop();
}

function setupDragAndDrop() {
    const columns = document.querySelectorAll('.column-content');
    
    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
    });
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const newColumn = e.target.closest('.column-content').dataset.column;
    
    moveTask(taskId, newColumn);
}

function moveTask(taskId, newColumn) {
    let task = null;
    let oldColumn = null;
    
    // Encontrar a tarefa e sua coluna atual
    for (const [column, columnTasks] of Object.entries(tasks)) {
        const taskIndex = columnTasks.findIndex(t => t.id === taskId);
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
    // Limpar todas as colunas
    document.getElementById('todoColumn').innerHTML = '';
    document.getElementById('doingColumn').innerHTML = '';
    document.getElementById('doneColumn').innerHTML = '';
    
    // Atualizar contadores
    document.getElementById('todoCount').textContent = tasks.todo.length;
    document.getElementById('doingCount').textContent = tasks.doing.length;
    document.getElementById('doneCount').textContent = tasks.done.length;
    
    // Renderizar tarefas
    renderColumnTasks('todo', tasks.todo);
    renderColumnTasks('doing', tasks.doing);
    renderColumnTasks('done', tasks.done);
}

function renderColumnTasks(columnId, columnTasks) {
    const column = document.getElementById(columnId + 'Column');
    
    if (columnTasks.length === 0) {
        column.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <p>Nenhuma tarefa</p>
            </div>
        `;
        return;
    }
    
    columnTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
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
        
        taskElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', task.id);
            taskElement.classList.add('dragging');
        });
        
        taskElement.addEventListener('dragend', () => {
            taskElement.classList.remove('dragging');
        });
        
        column.appendChild(taskElement);
    });
}

// ========== NOTAS DO DIA ========== //

function initializeNotes() {
    loadNotes();
    updateNotesDate();
}

function updateNotesDate() {
    const today = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    document.getElementById('notesDate').textContent = today.toLocaleDateString('pt-BR', options);
}

// ========== EVENT LISTENERS ========== //

function setupEventListeners() {
    // Navegação do calendário
    document.getElementById('prevYear').addEventListener('click', () => {
        currentYear--;
        generateCalendar();
    });
    
    document.getElementById('nextYear').addEventListener('click', () => {
        currentYear++;
        generateCalendar();
    });
    
    // Botões de adicionar evento
    document.getElementById('addEventBtn').addEventListener('click', showEventModal);
    document.getElementById('addEventToDay').addEventListener('click', showEventModal);
    
    // Modal de evento
    document.getElementById('eventForm').addEventListener('submit', addEvent);
    document.querySelector('.close').addEventListener('click', hideEventModal);
    document.getElementById('cancelEventBtn').addEventListener('click', hideEventModal);
    
    // To-Do List
    document.getElementById('addTaskBtn').addEventListener('click', showTaskForm);
    document.getElementById('cancelTaskBtn').addEventListener('click', hideTaskForm);
    document.getElementById('taskForm').addEventListener('submit', addTask);
    
    // Notas
    document.getElementById('saveNotesBtn').addEventListener('click', saveNotes);
    document.getElementById('dailyNotes').addEventListener('input', updateNotesCount);
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('eventModal');
        if (e.target === modal) {
            hideEventModal();
        }
    });
}

// ========== GERENCIAMENTO DE EVENTOS ========== //

function showEventModal() {
    const modal = document.getElementById('eventModal');
    const eventDate = document.getElementById('eventDate');
    
    if (selectedDate) {
        eventDate.value = selectedDate;
    } else {
        eventDate.value = getTodayFormatted();
    }
    
    modal.style.display = 'block';
}

function hideEventModal() {
    document.getElementById('eventModal').style.display = 'none';
    document.getElementById('eventForm').reset();
}

function addEvent(e) {
    e.preventDefault();
    
    const title = document.getElementById('eventTitle').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    const date = document.getElementById('eventDate').value;
    const color = document.getElementById('eventColor').value;
    
    if (!title) {
        alert('Por favor, informe o título do evento.');
        return;
    }
    
    const event = {
        id: Date.now(),
        title,
        description,
        date,
        color,
        createdAt: new Date().toISOString()
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
    alert('Evento adicionado com sucesso!');
}

function deleteEvent(date, index) {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
        events[date].splice(index, 1);
        
        if (events[date].length === 0) {
            delete events[date];
        }
        
        saveEvents();
        generateCalendar();
        showDayEvents(date);
    }
}

// ========== GERENCIAMENTO DE TAREFAS ========== //

function showTaskForm() {
    document.getElementById('taskFormContainer').style.display = 'block';
    document.getElementById('addTaskBtn').style.display = 'none';
}

function hideTaskForm() {
    document.getElementById('taskFormContainer').style.display = 'none';
    document.getElementById('addTaskBtn').style.display = 'block';
    document.getElementById('taskForm').reset();
}

function addTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value.trim();
    const column = document.getElementById('taskColumn').value;
    
    if (!title) {
        alert('Por favor, informe o título da tarefa.');
        return;
    }
    
    const task = {
        id: 'task_' + Date.now(),
        title,
        column,
        createdAt: new Date().toISOString()
    };
    
    tasks[column].push(task);
    saveTasks();
    renderTasks();
    hideTaskForm();
}

function deleteTask(taskId) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        for (const column of Object.keys(tasks)) {
            tasks[column] = tasks[column].filter(task => task.id !== taskId);
        }
        saveTasks();
        renderTasks();
    }
}

// ========== GERENCIAMENTO DE NOTAS ========== //

function updateNotesCount() {
    const textarea = document.getElementById('dailyNotes');
    const count = textarea.value.length;
    document.getElementById('notesCount').textContent = count;
}

// ========== LOCAL STORAGE ========== //

function getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.id : null;
}

function getUserKey(key) {
    const userId = getCurrentUserId();
    return userId ? `${key}_${userId}` : key;
}

function loadEvents() {
    events = JSON.parse(localStorage.getItem(getUserKey('planning_events'))) || {};
}

function saveEvents() {
    localStorage.setItem(getUserKey('planning_events'), JSON.stringify(events));
}

function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem(getUserKey('planning_tasks')));
    if (savedTasks) {
        tasks = savedTasks;
    } else {
        // Se não existir dados para este usuário, inicializar vazio
        tasks = {
            todo: [],
            doing: [],
            done: []
        };
    }
}

function saveTasks() {
    localStorage.setItem(getUserKey('planning_tasks'), JSON.stringify(tasks));
}

function loadNotes() {
    const today = new Date().toISOString().split('T')[0];
    const notes = JSON.parse(localStorage.getItem(getUserKey('planning_notes'))) || {};
    document.getElementById('dailyNotes').value = notes[today] || '';
    updateNotesCount();
}

function saveNotes() {
    const today = new Date().toISOString().split('T')[0];
    const notes = JSON.parse(localStorage.getItem(getUserKey('planning_notes'))) || {};
    notes[today] = document.getElementById('dailyNotes').value;
    localStorage.setItem(getUserKey('planning_notes'), JSON.stringify(notes));
    alert('Notas salvas com sucesso!');
}

// FUNÇÃO PARA LIMPAR DADOS DO USUÁRIO ANTERIOR
function clearPreviousUserData() {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    // Lista de todas as chaves que devem ser específicas por usuário
    const userSpecificKeys = [
        'planning_events',
        'planning_tasks', 
        'planning_notes',
        'workouts',
        'meals',
        'dailySummary',
        'dailyCalorieGoal',
        'hydration',
        'hydration_challenges',
        'last_hydration_reset',
        'lastDailyReset'
    ];
    
    // Remover chaves antigas que não tem ID de usuário
    userSpecificKeys.forEach(key => {
        if (localStorage.getItem(key) && !localStorage.getItem(`${key}_${userId}`)) {
            localStorage.removeItem(key);
        }
    });
}