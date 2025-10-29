// Shared Admin Panel Functions

// Initialize sidebar and mobile menu - SIMPLE VERSION THAT WORKS
function initAdminUI() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const sidebar = document.getElementById('sidebar');

    console.log('initAdminUI called', {
        hasBtn: !!mobileMenuBtn,
        hasOverlay: !!mobileOverlay,
        hasSidebar: !!sidebar
    });

    if (!mobileMenuBtn || !sidebar) {
        console.error('Missing required elements!');
        return;
    }

    // Simple toggle - exactly like dashboard
    mobileMenuBtn.addEventListener('click', () => {
        console.log('Menu button clicked!');
        sidebar.classList.toggle('active');
        if (mobileOverlay) mobileOverlay.classList.toggle('active');
    });

    // Close on overlay click
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            mobileOverlay.classList.remove('active');
        });
    }

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            sidebar.classList.remove('active');
            if (mobileOverlay) mobileOverlay.classList.remove('active');
        }
    });

    // Close menu when clicking a nav item on mobile
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.matchMedia('(max-width: 768px)').matches) {
                sidebar.classList.remove('active');
                if (mobileOverlay) mobileOverlay.classList.remove('active');
            }
        });
    });

    // Show vendor lounge link only for subadmins
    showVendorLoungeIfSubAdmin();
}

// Show vendor lounge menu item for subadmins only
async function showVendorLoungeIfSubAdmin() {
    try {
        const me = await api.get('/users/me');
        const role = (me.role || '').toLowerCase();
        if (role === 'subadmin') {
            const el = document.getElementById('vendorMenuItem');
            if (el) el.style.display = 'flex';
        }
    } catch (_) { /* ignore */ }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('affluence_token');
        window.location.href = 'admin-login.html';
    }
}

// Check admin authentication
async function checkAdminAuth() {
    try {
        // Check if token exists first
        const token = localStorage.getItem('affluence_token');
        console.log('Checking admin auth... Token exists:', !!token);
        
        if (!token) {
            console.error('No token found, redirecting to login');
            window.location.href = 'admin-login.html';
            return null;
        }

        const user = await api.get('/users/me');
        console.log('User loaded:', user);
        
        if (user.role !== 'admin' && user.role !== 'subadmin') {
            alert('Access denied. Admin role required.');
            window.location.href = 'dashboard.html';
            return null;
        }
        return user;
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = 'admin-login.html';
        return null;
    }
}

// Format currency
function formatCurrency(amount) {
    return '₦' + parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Modal helpers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// DON'T auto-initialize - let pages call initAdminUI() explicitly on DOMContentLoaded
// This ensures DOM elements exist before we try to bind events
