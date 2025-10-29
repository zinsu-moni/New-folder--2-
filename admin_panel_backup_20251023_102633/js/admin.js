// Admin API bridge for frontend admin pages
console.log('[admin.js] Loading...');

// Helper to normalize paths for calls against backend which mounts admin router under /api/admin
function adminPath(path) {
    if (!path.startsWith('/')) path = '/' + path;
    // If frontend code included '/admin', remove it to avoid duplication because backend uses '/api/admin'
    if (path.startsWith('/admin/')) path = path.substring(6); // '/admin/foo' -> '/foo'
    if (path === '/admin') path = '/';
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
    getDashboard: async () => { try { return await api.get(adminPath('/dashboard')); } catch (e) { showBackendConnectionError(e); throw e; } },

    getUsers: async (skip = 0, limit = 100, role = null) => {
        try {
            let url = adminPath(`/users?skip=${skip}&limit=${limit}`);
            if (role) url += `&role=${role}`;
            return await api.get(url);
        } catch (e) { showBackendConnectionError(e); throw e; }
    },

    updateUserRole: async (userId, role) => { return await api.put(adminPath(`/users/${userId}/role`), { role }); },
    updateUserStatus: async (userId, isActive) => { return await api.put(adminPath(`/users/${userId}/status`), { is_active: isActive }); },
    deleteUser: async (userId) => { return await api.delete(adminPath(`/users/${userId}`)); },
    impersonateUser: async (userId) => { return await api.post(adminPath(`/impersonate/${userId}`)); },

    // Coupons
    getCoupons: async (skip = 0, limit = 100) => { return await api.get(adminPath(`/coupons?skip=${skip}&limit=${limit}`)); },
    createCoupon: async (data) => { return await api.post(adminPath(`/coupons`), data); },
    updateCoupon: async (id, data) => { return await api.put(adminPath(`/coupons/${id}`), data); },
    deleteCoupon: async (id) => { return await api.delete(adminPath(`/coupons/${id}`)); },

    // Articles
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
    getWithdrawals: async (skip = 0, limit = 100, status = null) => { let url = adminPath(`/withdrawals?skip=${skip}&limit=${limit}`); if (status) url += `&status=${status}`; return await api.get(url); },
    approveWithdrawal: async (id) => { return await api.post(adminPath(`/withdrawals/${id}/approve`)); },
    rejectWithdrawal: async (id, reason) => { return await api.post(adminPath(`/withdrawals/${id}/reject`), { reason }); },

    // Logs
    getLogs: async (skip = 0, limit = 100) => { return await api.get(adminPath(`/logs?skip=${skip}&limit=${limit}`)); },

    // Click-to-earn
    getClickToEarnTasks: async (skip = 0, limit = 100) => { return await api.get(adminPath(`/click-to-earn?skip=${skip}&limit=${limit}`)); },
    updateClickToEarnTask: async (id, data) => { return await api.put(adminPath(`/click-to-earn/${id}`), data); }
};

// Expose to window
try { window.adminAPI = adminAPI; console.log('[admin.js] adminAPI attached to window'); } catch (e) { console.error('[admin.js] failed to attach adminAPI', e); }

// Simple UI helpers
function showToast(message, type = 'info') { const el = document.createElement('div'); el.textContent = message; el.style.cssText = 'position:fixed;top:20px;right:20px;padding:8px 12px;color:white;border-radius:6px;z-index:9999;'; el.style.background = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'; document.body.appendChild(el); setTimeout(() => el.remove(), 2500); }
