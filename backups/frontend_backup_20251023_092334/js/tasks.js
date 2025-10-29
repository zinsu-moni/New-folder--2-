// Tasks Page Integration

let allTasks = [];
let userTasks = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadTasks();
    setupTaskHandlers();
});

async function loadTasks() {
    try {
        // Show loading
        showLoadingTasks();
        
        // Fetch available tasks and user tasks
        const [tasks, myTasks] = await Promise.all([
            api.getTasks(),
            api.getMyTasks()
        ]);
        
        allTasks = tasks;
        userTasks = myTasks;
        
        // Render tasks
        renderTasks();
        
    } catch (error) {
        console.error('Error loading tasks:', error);
        showToast('Failed to load tasks', 'error');
    }
}

function renderTasks() {
    const tasksContainer = document.getElementById('tasksContainer');
    if (!tasksContainer) return;
    
    if (allTasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="no-tasks">
                <i class="fas fa-tasks" style="font-size: 48px; color: var(--gray); margin-bottom: 15px;"></i>
                <p>No tasks available at the moment</p>
            </div>
        `;
        return;
    }
    
    tasksContainer.innerHTML = allTasks.map(task => {
        const userTask = userTasks.find(ut => ut.task_id === task.id);
        const status = userTask ? userTask.status : 'available';
        
        return `
            <div class="task-card" data-task-id="${task.id}">
                <div class="task-icon">
                    <i class="${task.icon || 'fas fa-tasks'}"></i>
                </div>
                <div class="task-content">
                    <h3 class="task-title">${task.title}</h3>
                    <p class="task-description">${task.description || ''}</p>
                    <div class="task-footer">
                        <span class="task-amount">₦${task.amount}</span>
                        ${renderTaskButton(task.id, status, userTask)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderTaskButton(taskId, status, userTask) {
    switch (status) {
        case 'available':
            return `<button class="btn-task btn-take" data-task-id="${taskId}">
                        <i class="fas fa-hand-pointer"></i> Take Task
                    </button>`;
        case 'taken':
            const canClaim = userTask && isClaimable(userTask.taken_at);
            if (canClaim) {
                return `<button class="btn-task btn-claim" data-task-id="${taskId}">
                            <i class="fas fa-gift"></i> Claim Reward
                        </button>`;
            } else {
                const timeLeft = getTimeLeft(userTask.taken_at);
                return `<button class="btn-task btn-waiting" disabled>
                            <i class="fas fa-clock"></i> Wait ${timeLeft}
                        </button>`;
            }
        case 'claimed':
            return `<button class="btn-task btn-completed" disabled>
                        <i class="fas fa-check-circle"></i> Completed
                    </button>`;
        default:
            return '';
    }
}

function isClaimable(takenAt) {
    const DELAY_MINUTES = 5; // From backend config
    const takenTime = new Date(takenAt);
    const now = new Date();
    const diffMinutes = (now - takenTime) / 1000 / 60;
    return diffMinutes >= DELAY_MINUTES;
}

function getTimeLeft(takenAt) {
    const DELAY_MINUTES = 5;
    const takenTime = new Date(takenAt);
    const now = new Date();
    const diffMinutes = (now - takenTime) / 1000 / 60;
    const remaining = Math.ceil(DELAY_MINUTES - diffMinutes);
    return `${remaining}m`;
}

function setupTaskHandlers() {
    document.addEventListener('click', async (e) => {
        // Handle Take Task
        if (e.target.closest('.btn-take')) {
            const btn = e.target.closest('.btn-take');
            const taskId = btn.dataset.taskId;
            await handleTakeTask(taskId, btn);
        }
        
        // Handle Claim Task
        if (e.target.closest('.btn-claim')) {
            const btn = e.target.closest('.btn-claim');
            const taskId = btn.dataset.taskId;
            await handleClaimTask(taskId, btn);
        }
    });
}

async function handleTakeTask(taskId, btn) {
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Taking...';
    
    try {
        const response = await api.takeTask(taskId);
        showToast(response.message, 'success');
        
        // Open task link in new tab
        const task = allTasks.find(t => t.id == taskId);
        if (task && task.link) {
            window.open(task.link, '_blank');
        }
        
        // Reload tasks
        await loadTasks();
        
    } catch (error) {
        showToast(error.message || 'Failed to take task', 'error');
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }
}

async function handleClaimTask(taskId, btn) {
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Claiming...';
    
    try {
        const response = await api.claimTask(taskId);
        showToast(`Earned ₦${response.amount_earned}! 🎉`, 'success');
        
        // Reload tasks
        await loadTasks();
        
        // Refresh dashboard if on dashboard page
        if (typeof loadDashboardData === 'function') {
            loadDashboardData();
        }
        
    } catch (error) {
        showToast(error.message || 'Failed to claim reward', 'error');
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }
}

function showLoadingTasks() {
    const tasksContainer = document.getElementById('tasksContainer');
    if (tasksContainer) {
        tasksContainer.innerHTML = `
            <div class="loading-tasks">
                <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: var(--primary-color);"></i>
                <p style="margin-top: 15px;">Loading tasks...</p>
            </div>
        `;
    }
}

// Auto-refresh tasks every minute to update timers
setInterval(async () => {
    if (userTasks.some(t => t.status === 'taken')) {
        await loadTasks();
    }
}, 60000);
