/**
 * Affluence Admin Panel Core JavaScript
 * This file contains the core functionality for the admin panel,
 * including API methods for interacting with the backend.
 */

// Log that this script is loading
console.log('[admin.js] Loading admin panel core functionality...');

// Check if API object is available
if (typeof api === 'undefined' || !api) {
    console.error('[admin.js] Error: API object not available. Make sure api.js is loaded first.');
    // Create an error notification that will be shown on the page
    document.addEventListener('DOMContentLoaded', () => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'api-error-notification';
        errorDiv.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; background-color: #f44336; color: white; padding: 15px; text-align: center; z-index: 9999;">
                <strong>Error:</strong> API functionality not available. Please check the console for more details.
                <button onclick="location.reload()" style="margin-left: 10px; background: white; color: #f44336; border: none; padding: 5px 10px; cursor: pointer;">Reload</button>
            </div>
        `;
        document.body.prepend(errorDiv);
    });
}

/**
 * Helper function to construct correct API paths
 * Ensures all paths are correctly formatted for the backend router
 */
function adminPath(path) {
    // Add leading slash if missing
    if (!path.startsWith('/')) {
        path = '/' + path;
    }
    
    // Always add the /admin prefix if it's missing - the backend expects /api/admin prefix
    // but api.js only adds the /api part
    if (!path.startsWith('/admin/') && path !== '/admin') {
        path = '/admin' + path;
    }
    
    return path;
}

function showBackendConnectionError(error) {
    console.error('[admin.js] Backend connection error:', error);
    const msg = (error && error.message) ? error.message : 'Failed to connect to backend';
    const el = document.createElement('div');
    el.className = 'backend-connection-error';
    el.innerHTML = `\n+        <div style="background-color:#fff5f5;border:1px solid #fed7d7;padding:12px;border-radius:8px;margin:10px 0;text-align:center;">\n+            <strong style="color:#c53030">Backend connection problem</strong><br>\n+            ${msg}\n+            <div style="margin-top:8px">\n+                <a href="api-diagnostic.html" style="margin-right:8px">Run diagnostics</a>\n+                <button onclick="location.reload()">Retry</button>\n+            </div>\n+        </div>\n+    `;
    const target = document.querySelector('.content-area') || document.body;
    target.insertBefore(el, target.firstChild);
}

const adminAPI = {
    // Dashboard
    getDashboard: async () => {
        try {
            console.log('[admin.js] Fetching admin dashboard data...');
            const response = await api.get(adminPath('/dashboard'));
            console.log('[admin.js] Dashboard data received:', response);
            return response;
        } catch (error) {
            console.error('[admin.js] Failed to fetch admin dashboard:', error);
            showBackendConnectionError(error);
            throw error;
        }
    },

    // User Management
    getUsers: async (skip = 0, limit = 100, role = null) => {
        try {
            let url = adminPath(`/users?skip=${skip}&limit=${limit}`);
            if (role) url += `&role=${role}`;
            
            console.log('[admin.js] Fetching users:', url);
            const result = await api.get(url);
            return result;
        } catch (error) {
            console.error('[admin.js] Failed to fetch users:', error);
            showBackendConnectionError(error);
            throw error;
        }
    },

    updateUserRole: async (userId, role) => {
        try {
            return await api.put(adminPath(`/users/${userId}/role`), { role });
        } catch (error) {
            showBackendConnectionError(error);
            throw error;
        }
    },

    updateUserStatus: async (userId, isActive) => {
        try {
            return await api.put(adminPath(`/users/${userId}/status`), { is_active: isActive });
        } catch (error) {
            showBackendConnectionError(error);
            throw error;
        }
    },

    deleteUser: async (userId) => {
        try {
            return await api.delete(adminPath(`/users/${userId}`));
        } catch (error) {
            showBackendConnectionError(error);
            throw error;
        }
    },

    impersonateUser: async (userId) => {
        try {
            return await api.post(adminPath(`/impersonate/${userId}`));
        } catch (error) {
            showBackendConnectionError(error);
            throw error;
        }
    },

    // Coupon Management
    getCoupons: async (skip = 0, limit = 100) => {
        try {
            return await api.get(adminPath(`/coupons?skip=${skip}&limit=${limit}`));
        } catch (error) {
            showBackendConnectionError(error);
            throw error;
        }
    },

    createCoupon: async (couponData) => {
        try {
            return await api.post(adminPath(`/coupons`), couponData);
        } catch (error) {
            showBackendConnectionError(error);
            throw error;
        }
    },

    updateCoupon: async (couponId, couponData) => {
        try {
            return await api.put(adminPath(`/coupons/${couponId}`), couponData);
        } catch (error) {
            showBackendConnectionError(error);
            throw error;
        }
    },

    deleteCoupon: async (couponId) => {
        try {
            return await api.delete(adminPath(`/coupons/${couponId}`));
        } catch (error) {
            showBackendConnectionError(error);
            throw error;
        }
    },

    // Article Management
    getArticles: async (skip = 0, limit = 100) => { return await api.get(adminPath(`/articles?skip=${skip}&limit=${limit}`)); },
    createArticle: async (data) => { return await api.post(adminPath(`/articles`), data); },
    updateArticle: async (id, data) => { return await api.put(adminPath(`/articles/${id}`), data); },
    deleteArticle: async (id) => { return await api.delete(adminPath(`/articles/${id}`)); },

    // Cards
    getCards: async (skip = 0, limit = 100) => { return await api.get(adminPath(`/cards?skip=${skip}&limit=${limit}`)); },
    createCard: async (data) => { return await api.post(adminPath(`/cards`), data); },
    updateCard: async (id, data) => { return await api.put(adminPath(`/cards/${id}`), data); },
    deleteCard: async (id) => { return await api.delete(adminPath(`/cards/${id}`)); },

    // Announcements
    getAnnouncements: async (skip = 0, limit = 100) => { return await api.get(adminPath(`/announcements?skip=${skip}&limit=${limit}`)); },
    createAnnouncement: async (data) => { return await api.post(adminPath(`/announcements`), data); },
    updateAnnouncement: async (id, data) => { return await api.put(adminPath(`/announcements/${id}`), data); },
    deleteAnnouncement: async (id) => { return await api.delete(adminPath(`/announcements/${id}`)); },

    // Withdrawals
    getWithdrawals: async (skip = 0, limit = 100, status = null) => { 
        try {
            let url = adminPath(`/withdrawals?skip=${skip}&limit=${limit}`); 
            if (status) url += `&status=${status}`; 
            return await api.get(url); 
        } catch (error) {
            showBackendConnectionError(error);
            throw error;
        }
    },
    
    processWithdrawal: async (id, status, adminNote = '') => { 
        try {
            return await api.put(adminPath(`/withdrawals/${id}/approve`), { 
                status: status, // 'approved' or 'rejected'
                admin_note: adminNote 
            }); 
        } catch (error) {
            showBackendConnectionError(error);
            throw error;
        }
    },

    // Logs
    getLogs: async (skip = 0, limit = 100) => { return await api.get(adminPath(`/logs?skip=${skip}&limit=${limit}`)); },

    // Click-to-earn
    getClickToEarnTasks: async (skip = 0, limit = 100) => { 
        // The backend returns a single object, not an array
        const response = await api.get(adminPath(`/click-to-earn`));
        console.log('[admin.js] getClickToEarnTasks response:', response);
        
        // Ensure we return in a consistent array format for backward compatibility
        return Array.isArray(response) ? response : [response];
    },
    // Alias for backward compatibility (singular form)
    getClickToEarnTask: async () => { 
        console.log('[admin.js] Warning: getClickToEarnTask() is deprecated, use getClickToEarnTasks() instead');
        const tasks = await adminAPI.getClickToEarnTasks(0, 1);
        return tasks[0];
    },
    updateClickToEarnTask: async (data) => { return await api.put(adminPath(`/click-to-earn`), data); }
};

// Export for module environments, or attach to window for browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = adminAPI;
} else {
    // Make sure to create a global reference
    window.adminAPI = adminAPI;
}

// Log that the script has loaded successfully
console.log('[admin.js] Admin panel core functionality loaded successfully');

// Simple UI helpers
function showToast(message, type = 'info') { 
    const el = document.createElement('div'); 
    el.textContent = message; 
    el.style.cssText = 'position:fixed;top:20px;right:20px;padding:8px 12px;color:white;border-radius:6px;z-index:9999;'; 
    el.style.background = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'; 
    document.body.appendChild(el); 
    setTimeout(() => el.remove(), 2500); 
}
