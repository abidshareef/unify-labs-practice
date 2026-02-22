// script.js
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    cacheDOM() {
        this.taskInput = document.getElementById('task-input');
        this.prioritySelect = document.getElementById('priority-select');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.taskList = document.getElementById('task-list');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clear-completed-btn');
        this.saveTasksBtn = document.getElementById('save-tasks-btn');
        this.totalCount = document.getElementById('total-count');
        this.completedCount = document.getElementById('completed-count');
        this.pendingCount = document.getElementById('pending-count');
    }

    bindEvents() {
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
        
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompletedTasks());
        this.saveTasksBtn.addEventListener('click', () => this.saveTasks());
    }

    addTask() {
        const text = this.taskInput.value.trim();
        const priority = this.prioritySelect.value;
        
        if (!text) {
            this.showNotification('Please enter a task!', 'error');
            return;
        }
        
        const task = {
            id: Date.now(),
            text,
            priority,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.unshift(task);
        this.taskInput.value = '';
        this.taskInput.focus();
        this.saveToLocalStorage();
        this.render();
        this.updateStats();
        this.showNotification('Task added successfully!', 'success');
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveToLocalStorage();
        this.render();
        this.updateStats();
        this.showNotification('Task deleted!', 'info');
    }

    toggleTaskStatus(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveToLocalStorage();
            this.render();
            this.updateStats();
            
            const message = task.completed ? 'Task marked as completed!' : 'Task marked as active!';
            this.showNotification(message, 'success');
        }
    }

    clearCompletedTasks() {
        if (this.tasks.some(task => task.completed)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveToLocalStorage();
            this.render();
            this.updateStats();
            this.showNotification('Completed tasks cleared!', 'success');
        } else {
            this.showNotification('No completed tasks to clear!', 'info');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterButtons.forEach(button => {
            if (button.dataset.filter === filter) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        this.render();
    }

    saveTasks() {
        this.saveToLocalStorage();
        this.showNotification('Tasks saved successfully!', 'success');
    }

    saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.taskList.innerHTML = `
                <div class="empty-state">
                    <i>📋</i>
                    <h3>No tasks found</h3>
                    <p>${this.currentFilter === 'all' ? 'Add a new task to get started!' : 
                       this.currentFilter === 'active' ? 'All tasks are completed!' : 
                       'No tasks have been completed yet!'}</p>
                </div>
            `;
            return;
        }
        
        this.taskList.innerHTML = filteredTasks.map(task => `
            <li class="task-item ${task.priority}-priority ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <span class="priority-tag priority-${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                <button class="delete-btn">✕</button>
            </li>
        `).join('');
        
        // Bind events to newly created elements
        this.taskList.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                this.toggleTaskStatus(taskId);
            });
        });
        
        this.taskList.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                this.deleteTask(taskId);
            });
        });
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        this.totalCount.textContent = total;
        this.completedCount.textContent = completed;
        this.pendingCount.textContent = pending;
    }

    showNotification(message, type) {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Trigger reflow to enable animation
        notification.offsetHeight;
        
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});

// Add notification styles dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
    }
    
    .notification.success {
        background: linear-gradient(to right, #2ecc71, #27ae60);
    }
    
    .notification.error {
        background: linear-gradient(to right, #e74c3c, #c0392b);
    }
    
    .notification.info {
        background: linear-gradient(to right, #3498db, #2980b9);
    }
`;

document.head.appendChild(notificationStyles);
