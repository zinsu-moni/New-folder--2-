// Tasks Page Integration

// Global variables
let allTasks = [];
let userTasks = [];

function getApiClient() {
    try {
        if (typeof window !== 'undefined' && window.api) {
            return window.api;
        }
    } catch (err) {
        console.warn('[tasks.js] getApiClient() window access failed:', err);
    }
    return null;
}

document.addEventListener('DOMContentLoaded', async () => {
    // Get the API reference that was created in the HTML
    if (typeof window !== 'undefined' && window.api) {
        console.log('Using existing API instance from window');
    } else {
        // If no API instance exists, create one
        try {
            const instance = new AffluenceAPI();
            if (typeof window !== 'undefined') {
                window.api = instance;
            }
            console.log('Created new API instance');
        } catch (e) {
            console.error('Failed to create API instance:', e);
            // Show error in UI
            showLoadingError('API initialization failed. Please reload the page.');
            return;
        }
    }

    try {
        const apiClient = getApiClient();
        const isAuth = apiClient && typeof apiClient.isAuthenticated === 'function' ? apiClient.isAuthenticated() : null;
        const token = apiClient && typeof apiClient.getToken === 'function' ? apiClient.getToken() : null;
        console.log('[tasks.js] isAuthenticated:', isAuth);
        console.log('[tasks.js] token present:', !!token, token ? token.slice(0, 20) + '…' : null);
    } catch (logErr) {
        console.warn('[tasks.js] Failed to inspect auth state:', logErr);
    }

    // Clear any hardcoded tasks from the HTML
    const tasksContainer = document.getElementById('tasksContainer');
    if (tasksContainer) {
        tasksContainer.innerHTML = '';
    }
    
    await loadTasks();
    setupTaskHandlers();
});

async function loadTasks() {
    try {
        try {
            const apiClient = getApiClient();
            const token = apiClient && typeof apiClient.getToken === 'function' ? apiClient.getToken() : null;
            console.log('[tasks.js] loadTasks() - token present:', !!token, token ? token.slice(0, 20) + '…' : null);
            console.log('[tasks.js] loadTasks() - isAuthenticated:', apiClient && typeof apiClient.isAuthenticated === 'function' ? apiClient.isAuthenticated() : null);
        } catch (logErr) {
            console.warn('[tasks.js] loadTasks() auth inspection failed:', logErr);
        }

        // Show loading
        showLoadingTasks();
        
        // FORCE DISPLAY HARDCODED TASKS - This will ensure tasks are displayed even if API fails
        const hardcodedTasks = [
            {
                id: 3,
                title: "Official Channel",
                description: "Follow the AFFLUENCE COMMUNITY channel on WhatsApp for exclusive updates and announcements",
                amount: 8000,
                reward_type: "activity",
                time_estimate: 8,
                task_type: "alpha",
                status: "active",
                availability: "daily",
                link: "https://whatsapp.com/channel/0029Vb6pW630G0XanwhpY038"
            },
            {
                id: 4,
                title: "Refer a Friend",
                description: "Invite friends to join Affluence and earn rewards",
                amount: 5000,
                reward_type: "affiliate",
                time_estimate: 2,
                task_type: "mega",
                status: "active",
                availability: "always",
                link: "https://affluence.com/refer"
            }
        ];

        // Just use hardcoded tasks to ensure something displays immediately
        allTasks = hardcodedTasks;
        userTasks = [];

        // Render hardcoded tasks right away so the UI doesn't stay on the loading state
        try { renderTasks(); } catch (e) { console.warn('Immediate render of hardcoded tasks failed:', e); }
        
        // Try API calls only if API is available
        const apiClient = getApiClient();
        if (apiClient) {
            try {
                if (typeof apiClient.getTasks === 'function') {
                    const apiTasks = await apiClient.getTasks();
                        if (apiTasks && apiTasks.length > 0) {
                            allTasks = apiTasks;  // Replace hardcoded tasks with API tasks
                            console.log('Available tasks loaded from API:', apiTasks);
                            // Re-render with API tasks
                            try { renderTasks(); } catch (e) { console.warn('Render after API tasks failed:', e); }
                        }
                }
            } catch (tasksError) {
                console.error('Error loading available tasks:', tasksError);
                // Keep using hardcoded tasks
            }
            
            try {
                if (typeof apiClient.getMyTasks === 'function') {
                    const apiMyTasks = await apiClient.getMyTasks();
                    if (apiMyTasks && apiMyTasks.length > 0) {
                        userTasks = apiMyTasks;
                        console.log('User tasks loaded from API:', apiMyTasks);
                        // Re-render to reflect user-specific states (taken/claimed)
                        try { renderTasks(); } catch (e) { console.warn('Render after user tasks failed:', e); }
                    }
                }
            } catch (myTasksError) {
                console.error('Error loading user tasks:', myTasksError);
                // Continue with empty userTasks
            }
        }
        
        // Always render tasks
        renderTasks();
        
    } catch (error) {
        console.error('Error loading tasks:', error);
        if (error && error.status) {
            console.warn('[tasks.js] loadTasks() error status:', error.status, 'detail:', error.data || error.message);
        }
        showToast('Failed to load tasks', 'error');
        
        // Show error in the UI
        const _tasksContainer = document.getElementById('tasksContainer') || document.querySelector('.tasks-grid');
        if (_tasksContainer) {
            _tasksContainer.innerHTML = `
                <div class="no-tasks task-error">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--danger); margin-bottom: 15px;"></i>
                    <h3>Error Loading Tasks</h3>
                    <p>There was a problem loading your tasks. This could be due to:</p>
                    <ul style="text-align: left; margin: 15px auto; max-width: 300px;">
                        <li>Server connection issues</li>
                        <li>Missing API endpoints</li>
                        <li>Authentication issues</li>
                    </ul>
                    <button class="task-btn btn-primary" style="max-width: 200px; margin: 15px auto;" onclick="loadTasks()">Try Again</button>
                </div>
            `;
        }
    }
}

function renderTasks() {
    try {
        const tasksContainer = document.getElementById('tasksContainer');
        if (!tasksContainer) {
            console.error('Tasks container not found in DOM');
            return;
        }
        
        // Clear all existing task cards (including hardcoded ones)
        tasksContainer.innerHTML = '';
        
        if (!allTasks || allTasks.length === 0) {
            console.log('No tasks available to render');
            tasksContainer.innerHTML = `
                <div class="no-tasks">
                    <i class="fas fa-tasks" style="font-size: 48px; color: var(--gray); margin-bottom: 15px;"></i>
                    <p>No tasks available at the moment</p>
                </div>
            `;
            return;
        }
        
        // Generate HTML for each task
        let tasksHtml = '';
        for (const task of allTasks) {
            try {
                const userTask = userTasks.find(ut => ut.task_id === task.id);
                const status = userTask ? userTask.status : 'available';
                
                // Determine badge class based on task type
                const taskType = task.task_type || 'alpha';
                const badgeClass = taskType === 'mega' ? 'badge-danger' : 'badge-primary';
                const badgeIcon = taskType === 'mega' ? '💎' : '🌟';
                const badgeText = taskType === 'mega' ? 'Mega' : 'Alpha';
                
                const taskAmount = task.amount ? `₦${task.amount.toLocaleString()}` : 'Free';
                
                tasksHtml += `
                    <div class="task-card" data-task-id="${task.id}">
                        <div class="task-header">
                            <div class="task-badge ${badgeClass}">${badgeIcon} ${badgeText}</div>
                        </div>
                        <div class="task-content">
                            <h3 class="task-title">${task.title || 'Task'}</h3>
                            <p class="task-description">${task.description || ''}</p>
                            <div class="task-footer">
                                <span class="task-amount">${taskAmount}</span>
                                ${renderTaskButton(task.id, status, userTask, task.link)}
                            </div>
                        </div>
                    </div>
                `;
            } catch (taskError) {
                console.error('Error rendering individual task:', taskError, task);
            }
        }
        
        // Update the DOM
        tasksContainer.innerHTML = tasksHtml;
        console.log(`Rendered ${allTasks.length} tasks successfully`);
    } catch (renderError) {
        console.error('Error in renderTasks function:', renderError);
        // Try a simpler fallback rendering
        const tasksContainer = document.getElementById('tasksContainer');
        if (tasksContainer) {
            tasksContainer.innerHTML = `
                <div class="task-error">
                    <i class="fas fa-exclamation-triangle" style="color: var(--danger); font-size: 48px; margin-bottom: 15px;"></i>
                    <h3>Error Displaying Tasks</h3>
                    <p>There was a problem displaying your tasks.</p>
                    <button onclick="location.reload()" class="task-btn btn-primary">Reload Page</button>
                </div>
            `;
        }
    }
}

function renderTaskButton(taskId, status, userTask, link = '') {
    try {
        switch (status) {
            case 'available':
                if (link) {
                    return `
                        <button class="btn-task btn-take" data-task-id="${taskId}" data-task-link="${link}">
                            <i class="fas fa-external-link-alt"></i> Take Task
                        </button>`;
                } else {
                    return `<button class="btn-task btn-take" data-task-id="${taskId}">
                                <i class="fas fa-hand-pointer"></i> Take Task
                            </button>`;
                }
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
                // For any unknown status, default to available
                return `<button class="btn-task btn-take" data-task-id="${taskId}">
                            <i class="fas fa-hand-pointer"></i> Take Task
                        </button>`;
        }
    } catch (error) {
        console.error('Error rendering task button:', error);
        // Provide a safe default button
        return `<button class="btn-task btn-take" data-task-id="${taskId}">
                    <i class="fas fa-hand-pointer"></i> Take Task
                </button>`;
    }
}

function isClaimable(takenAt) {
    try {
        if (!takenAt) return true; // If no time specified, allow claiming
        
        const DELAY_MINUTES = 5; // From backend config
        const takenTime = new Date(takenAt);
        const now = new Date();
        const diffMinutes = (now - takenTime) / 1000 / 60;
        return diffMinutes >= DELAY_MINUTES;
    } catch (error) {
        console.error('Error checking if task is claimable:', error);
        return true; // Default to claimable if there's an error
    }
}

function getTimeLeft(takenAt) {
    try {
        if (!takenAt) return '0m'; // Default if no time
        
        const DELAY_MINUTES = 5;
        const takenTime = new Date(takenAt);
        const now = new Date();
        const diffMinutes = (now - takenTime) / 1000 / 60;
        const remaining = Math.ceil(DELAY_MINUTES - diffMinutes);
        return `${Math.max(0, remaining)}m`;
    } catch (error) {
        console.error('Error calculating time left:', error);
        return '0m'; // Default if there's an error
    }
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
    
    // We no longer need this since we're clearing hardcoded tasks
    // addBadgesToHardcodedTasks();
}

async function handleTakeTask(taskId, btn) {
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Taking...';
    
    try {
        // Get task link directly from button data attribute
        const taskLink = btn.dataset.taskLink || '';
        
        // If no link in button data, find task by id
        const task = allTasks.find(t => t.id == taskId);
        const link = taskLink || (task && task.link) || '';
        
        const apiClient = getApiClient();
        if (!apiClient || typeof apiClient.takeTask !== 'function') {
            throw new Error('Task service unavailable. Please refresh and try again.');
        }

        // Take the task
        const response = await apiClient.takeTask(taskId);
        showToast(response.message || 'Task taken successfully', 'success');
        
        // Open task link in new tab if available
        if (link) {
            // Wait a moment to ensure the toast message is visible
            setTimeout(() => {
                window.open(link, '_blank');
                showToast('Task link opened in new tab', 'info');
            }, 300);
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
        const apiClient = getApiClient();
        if (!apiClient || typeof apiClient.claimTask !== 'function') {
            throw new Error('Task service unavailable. Please refresh and try again.');
        }

        const response = await apiClient.claimTask(taskId);
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

function showLoadingError(message) {
    const tasksContainer = document.getElementById('tasksContainer');
    if (tasksContainer) {
        tasksContainer.innerHTML = `
            <div class="no-tasks task-error">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--danger); margin-bottom: 15px;"></i>
                <h3>Error Loading Tasks</h3>
                <p>${message || 'There was a problem loading your tasks.'}</p>
                <button class="task-btn btn-primary" style="max-width: 200px; margin: 15px auto;" onclick="location.reload()">Reload Page</button>
            </div>
        `;
    }
}

// Function to add badges to any hardcoded tasks that might exist in the HTML
function addBadgesToHardcodedTasks() {
    const hardcodedTaskCards = document.querySelectorAll('.task-card:not([data-task-id])');
    
    hardcodedTaskCards.forEach((card, index) => {
        // Skip if card already has a badge
        if (card.querySelector('.task-badge')) return;
        
        // Add task header with badge if it doesn't exist
        if (!card.querySelector('.task-header')) {
            const header = document.createElement('div');
            header.className = 'task-header';
            
            // Alternate between alpha and mega badges
            const isMega = index % 2 === 0;
            const badgeClass = isMega ? 'badge-danger' : 'badge-primary';
            const badgeIcon = isMega ? '💎' : '🌟';
            const badgeText = isMega ? 'Mega' : 'Alpha';
            
            header.innerHTML = `<div class="task-badge ${badgeClass}">${badgeIcon} ${badgeText}</div>`;
            
            // Add the header at the beginning of the card
            card.insertBefore(header, card.firstChild);
        }
    });
}

// Add styles for task badges
function addTaskStyles() {
    // Check if styles already exist
    if (document.getElementById('dynamic-task-styles')) return;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'dynamic-task-styles';
    styleEl.textContent = `
        .task-header {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 10px;
        }
        
        .task-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 600;
            color: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .badge-primary {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }
        
        .badge-danger {
            background: linear-gradient(135deg, #ef4444, #b91c1c);
        }
        
        .task-card {
            position: relative;
            padding: 20px;
        }
        
        .task-card .task-title {
            margin-top: 5px;
        }
    `;
    
    document.head.appendChild(styleEl);
}

// Add styles when the page loads
document.addEventListener('DOMContentLoaded', addTaskStyles);

// Function to show toast messages if not already defined
if (typeof showToast !== 'function') {
    function showToast(message, type = 'info') {
        // Check if toast container exists
        let toastContainer = document.querySelector('.toast-container');
        
        // Create toast container if it doesn't exist
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            toastContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            padding: 12px 16px; 
            margin-bottom: 10px; 
            border-radius: 8px; 
            box-shadow: 0 3px 10px rgba(0,0,0,0.1); 
            display: flex; 
            align-items: center; 
            min-width: 250px;
            animation: slideInRight 0.3s ease forwards;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                toast.style.background = '#10b981';
                toast.style.color = 'white';
                break;
            case 'error':
                toast.style.background = '#ef4444';
                toast.style.color = 'white';
                break;
            case 'warning':
                toast.style.background = '#f59e0b';
                toast.style.color = 'white';
                break;
            default: // info
                toast.style.background = '#3b82f6';
                toast.style.color = 'white';
        }
        
        // Add icon based on type
        const icon = document.createElement('i');
        icon.className = 'fas';
        icon.style.marginRight = '10px';
        
        switch (type) {
            case 'success':
                icon.className += ' fa-check-circle';
                break;
            case 'error':
                icon.className += ' fa-times-circle';
                break;
            case 'warning':
                icon.className += ' fa-exclamation-triangle';
                break;
            default: // info
                icon.className += ' fa-info-circle';
        }
        
        toast.appendChild(icon);
        toast.appendChild(document.createTextNode(message));
        
        // Add to container
        toastContainer.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // Add animation styles
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(styleEl);
}

// Auto-refresh tasks every minute to update timers
setInterval(async () => {
    if (userTasks.some(t => t.status === 'taken')) {
        await loadTasks();
    }
}, 60000);

// Debug function to help diagnose task loading issues
function debugTasks() {
    console.log('Debug - allTasks:', allTasks);
    console.log('Debug - userTasks:', userTasks);
    
    // Test getMockTasks directly
    const apiClient = getApiClient();
    if (apiClient && typeof apiClient.getMockTasks === 'function') {
        const mockTasks = apiClient.getMockTasks();
        console.log('Debug - Mock Tasks:', mockTasks);
    }
    
    // Force reload tasks
    loadTasks().then(() => {
        console.log('Debug - Tasks reloaded successfully');
    }).catch(err => {
        console.error('Debug - Error reloading tasks:', err);
        // EMERGENCY FALLBACK - directly manipulate DOM if all else fails
        const tasksContainer = document.getElementById('tasksContainer');
        if (tasksContainer) {
            tasksContainer.innerHTML = `
                <div class="task-card">
                    <div class="task-header">
                        <div class="task-badge badge-primary">🌟 Alpha</div>
                    </div>
                    <div class="task-content">
                        <h3 class="task-title">WhatsApp Group Task</h3>
                        <p class="task-description">Join the WhatsApp group and earn rewards</p>
                        <div class="task-footer">
                            <span class="task-amount">₦2,000</span>
                            <button class="btn-task btn-take" onclick="window.open('https://chat.whatsapp.com/KUa9YFBd7D3AHwsTukdGx8', '_blank')">
                                <i class="fas fa-external-link-alt"></i> Take Task
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    });
}

// Debug function is available for manual use in the console if needed

// Fallback safety: if the loading spinner persists (race or error), render hardcoded tasks after a short delay
setTimeout(() => {
    try {
        const container = document.getElementById('tasksContainer');
        if (!container) return;

        // If the container still contains the loading-tasks placeholder, attempt to render hardcoded tasks
        if (container.querySelector('.loading-tasks')) {
            console.warn('[tasks.js] Loading spinner persisted — rendering fallback tasks');
            try { renderTasks(); } catch (e) { console.error('[tasks.js] Fallback renderTasks failed:', e); }
        }
    } catch (err) {
        console.error('[tasks.js] Fallback check failed:', err);
    }
}, 900);
