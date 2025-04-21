document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const app = document.getElementById('app');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const taskForm = document.getElementById('taskForm');
  
  // State
  let state = {
    darkMode: localStorage.getItem('darkMode') === 'true',
    tasks: JSON.parse(localStorage.getItem('tasks')) || [],
    viewMode: localStorage.getItem('viewMode') || 'daily'
  };

  // Initialize
  renderApp();

  // Render Functions
  function renderApp() {
    app.className = state.darkMode ? 'dark-mode' : '';
    app.innerHTML = `
      <div class="container">
        <!-- Header -->
        <header class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">AI Life Organizer ✨</h1>
          <button id="darkModeToggle" class="btn">
            ${state.darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </header>

        <!-- Task Form -->
        <form id="taskForm" class="mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" id="taskName" placeholder="Task name" class="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required>
            <select id="taskPriority" class="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
              <option value="high">High Priority</option>
              <option value="medium" selected>Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <select id="taskCategory" class="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="health">Health</option>
            </select>
            <input type="number" id="taskDuration" placeholder="Duration (mins)" min="1" value="30" class="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required>
          </div>
          <button type="submit" class="btn btn-primary w-full">Add Task</button>
        </form>

        <!-- Progress -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold mb-2">Progress</h2>
          <div class="progress-container">
            <div class="progress-bar" style="width: ${calculateProgress()}%"></div>
          </div>
          <p class="mt-2 text-sm">
            ${getCompletedCount()} of ${state.tasks.length} tasks completed
          </p>
        </div>

        <!-- Task List -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Your Tasks</h2>
            <div class="flex gap-2">
              <button data-view="daily" class="view-toggle ${state.viewMode === 'daily' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'} px-3 py-1 rounded">
                Daily
              </button>
              <button data-view="weekly" class="view-toggle ${state.viewMode === 'weekly' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'} px-3 py-1 rounded">
                Weekly
              </button>
            </div>
          </div>
          
          <div id="taskList" class="space-y-3">
            ${renderTasks()}
          </div>
        </div>
      </div>
    `;

    // Re-attach event listeners
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    document.getElementById('taskForm').addEventListener('submit', handleAddTask);
    document.querySelectorAll('.view-toggle').forEach(btn => {
      btn.addEventListener('click', () => handleViewChange(btn.dataset.view));
    });
  }

  function renderTasks() {
    if (state.tasks.length === 0) {
      return '<p class="text-gray-500 dark:text-gray-400">No tasks yet. Add one above!</p>';
    }

    return state.tasks.map(task => `
      <div class="task-card" data-id="${task.id}">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-medium ${task.completed ? 'line-through text-gray-400' : 'dark:text-white'}">${task.name}</h3>
            <div class="flex flex-wrap gap-2 mt-2">
              <span class="priority-${task.priority} px-2 py-1 rounded text-xs">
                ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
              <span class="px-2 py-1 rounded bg-gray-100 dark:bg-gray-600 text-xs">
                ${task.category}
              </span>
              <span class="px-2 py-1 rounded bg-purple-100 dark:bg-purple-900 text-xs">
                ${task.duration} mins
              </span>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="complete-btn btn ${task.completed ? 'bg-gray-200 dark:bg-gray-600' : 'bg-green-500 text-white'}">
              ${task.completed ? 'Undo' : '✓'}
            </button>
            <button class="delete-btn btn bg-red-500 text-white">✕</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Helper Functions
  function calculateProgress() {
    const completed = state.tasks.filter(t => t.completed).length;
    return state.tasks.length ? Math.round((completed / state.tasks.length) * 100) : 0;
  }

  function getCompletedCount() {
    return state.tasks.filter(t => t.completed).length;
  }

  // Event Handlers
  function toggleDarkMode() {
    state.darkMode = !state.darkMode;
    localStorage.setItem('darkMode', state.darkMode);
    renderApp();
  }

  function handleAddTask(e) {
    e.preventDefault();
    
    const newTask = {
      id: Date.now(),
      name: document.getElementById('taskName').value,
      priority: document.getElementById('taskPriority').value,
      category: document.getElementById('taskCategory').value,
      duration: parseInt(document.getElementById('taskDuration').value),
      completed: false,
      createdAt: new Date().toISOString()
    };

    state.tasks = [...state.tasks, newTask];
    localStorage.setItem('tasks', JSON.stringify(state.tasks));
    
    // Reset form
    taskForm.reset();
    renderApp();
  }

  function handleViewChange(mode) {
    state.viewMode = mode;
    localStorage.setItem('viewMode', mode);
    renderApp();
  }

  // Event delegation for dynamic elements
  app.addEventListener('click', (e) => {
    const taskCard = e.target.closest('.task-card');
    if (!taskCard) return;
    
    const taskId = parseInt(taskCard.dataset.id);
    
    if (e.target.classList.contains('complete-btn')) {
      toggleTaskComplete(taskId);
    } else if (e.target.classList.contains('delete-btn')) {
      deleteTask(taskId);
    }
  });

  function toggleTaskComplete(id) {
    state.tasks = state.tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    localStorage.setItem('tasks', JSON.stringify(state.tasks));
    renderApp();
  }

  function deleteTask(id) {
    state.tasks = state.tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(state.tasks));
    renderApp();
  }
});