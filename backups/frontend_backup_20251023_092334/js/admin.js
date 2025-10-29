// Admin API functions
console.log('[admin.js] Loading... api available:', typeof api);

// Show backend connection error
function showBackendConnectionError(error) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'backend-connection-error';
    errorMessage.innerHTML = `
        <div style="background-color: #fee2e2; border: 1px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #b91c1c; margin-top: 0;">🚨 Backend Connection Error</h3>
            <p>${error.message || 'Failed to connect to the backend server'}</p>
            <div style="margin-top: 15px;">
                <a href="test-api-connection.html" style="background-color: #2563eb; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; margin-right: 10px;">
                    Run Diagnostics
                </a>
                <button onclick="location.reload()" style="background-color: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                    Retry Connection
                </button>
            </div>
        </div>
    `;
    
    // Add to the top of content area
    const contentArea = document.querySelector('.content-area') || document.querySelector('.main-content');
    if (contentArea) {
        contentArea.insertBefore(errorMessage, contentArea.firstChild);
    } else {
        document.body.insertBefore(errorMessage, document.body.firstChild);
    }
}

const adminAPI = {
    // Dashboard
    getDashboard: async () => {
        try {
            console.log('Fetching admin dashboard data...');
            // Use the correct path with /admin prefix
            const response = await api.get('/admin/dashboard');
            console.log('Admin dashboard data received:', response);
            return response;
        } catch (error) {
            console.error('Failed to fetch admin dashboard:', error);
            showBackendConnectionError(error);
            throw error;
        }
    },

    // User Management
    getUsers: async (skip = 0, limit = 100, role = null) => {
        try {
            // Use the correct path with /admin prefix
            let url = `/admin/users?skip=${skip}&limit=${limit}`;
            if (role) url += `&role=${role}`;
            console.log('adminAPI.getUsers calling:', url);
            
            // Make API call with specific logging for debugging
            const result = await api.get(url);
            console.log('adminAPI.getUsers result:', result);
            
            // Check if the result is what we expect
            if (!result) {
                console.error('Empty response from API');
                throw new Error('Empty response from server');
            }
            
            return result;
        } catch (error) {
            console.error('Error in getUsers:', error);
            showBackendConnectionError(error);
            throw error;
        }
    },

    updateUserRole: async (userId, role) => {
        // Use the correct path with /admin prefix
        return await api.put(`/admin/users/${userId}/role`, { role });
    },

    updateUserStatus: async (userId, isActive) => {
        // Use the correct path with /admin prefix
        return await api.put(`/admin/users/${userId}/status`, { is_active: isActive });
    },

    deleteUser: async (userId) => {
        // Use the correct path with /admin prefix
        return await api.delete(`/admin/users/${userId}`);
    },

    impersonateUser: async (userId) => {
        // Use the correct path with /admin prefix
        return await api.post(`/admin/impersonate/${userId}`);
    },

    // Coupon Management
    getCoupons: async (skip = 0, limit = 100, status = null) => {
        // Use the correct path with /admin prefix
        let url = `/admin/coupons?skip=${skip}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        return await api.get(url);
    },

    createCoupon: async (data) => {
        // Use the correct path with /admin prefix
        return await api.post('/admin/coupons', data);
    },

    updateCoupon: async (couponId, data) => {
        // Use the correct path with /admin prefix
        return await api.put(`/admin/coupons/${couponId}`, data);
    },

    deleteCoupon: async (couponId) => {
        // Use the correct path with /admin prefix
        return await api.delete(`/admin/coupons/${couponId}`);
    },

    // Article Management
    getArticles: async (skip = 0, limit = 100, includeUnpublished = true) => {
        return await api.get(`/admin/articles?skip=${skip}&limit=${limit}&include_unpublished=${includeUnpublished}`);
    },

    createArticle: async (data) => {
        return await api.post('/admin/articles', data);
    },

    updateArticle: async (articleId, data) => {
        return await api.put(`/admin/articles/${articleId}`, data);
    },

    deleteArticle: async (articleId) => {
        return await api.delete(`/admin/articles/${articleId}`);
    },

    // Card Management
    getCards: async (skip = 0, limit = 100) => {
        return await api.get(`/admin/cards?skip=${skip}&limit=${limit}`);
    },

    createCard: async (data) => {
        return await api.post('/admin/cards', data);
    },

    updateCard: async (cardId, data) => {
        return await api.put(`/admin/cards/${cardId}`, data);
    },

    deleteCard: async (cardId) => {
        return await api.delete(`/admin/cards/${cardId}`);
    },

    // Announcement Management
    getAnnouncements: async (skip = 0, limit = 100) => {
        return await api.get(`/admin/announcements?skip=${skip}&limit=${limit}`);
    },

    createAnnouncement: async (data) => {
        return await api.post('/admin/announcements', data);
    },

    updateAnnouncement: async (announcementId, data) => {
        return await api.put(`/admin/announcements/${announcementId}`, data);
    },

    deleteAnnouncement: async (announcementId) => {
        return await api.delete(`/admin/announcements/${announcementId}`);
    },

    // Withdrawal Management
    getWithdrawals: async (skip = 0, limit = 100, status = null) => {
        let url = `/admin/withdrawals?skip=${skip}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        return await api.get(url);
    },

    approveWithdrawal: async (withdrawalId, status, adminNote = '') => {
        return await api.put(`/admin/withdrawals/${withdrawalId}/approve`, {
            status,
            admin_note: adminNote
        });
    },

    // System Logs
    getLogs: async (skip = 0, limit = 100, action = null) => {
        let url = `/admin/logs?skip=${skip}&limit=${limit}`;
        if (action) url += `&action=${action}`;
        return await api.get(url);
    },

    // Click to Earn Task
    getClickToEarnTask: async () => {
        return await api.get('/admin/click-to-earn');
    },

    updateClickToEarnTask: async (data) => {
        return await api.put('/admin/click-to-earn', data);
    }
};

// Expose on window to ensure availability across scripts
console.log('[admin.js] Exposing adminAPI to window...');
try { 
    window.adminAPI = adminAPI;
    console.log('[admin.js] adminAPI exposed successfully:', typeof window.adminAPI);
} catch (e) {
    console.error('[admin.js] Failed to expose adminAPI:', e);
}

// Helper functions
function showModal(title, content, onConfirm) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;

    modal.innerHTML = `
        <div style="
            background: white;
            padding: 30px;
            border-radius: 12px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        ">
            <h2 style="margin-bottom: 20px; color: #2d3748;">${title}</h2>
            <div style="margin-bottom: 25px; color: #4a5568;">${content}</div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="this.closest('div').parentElement.remove()" style="
                    padding: 10px 20px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                ">Cancel</button>
                <button onclick="(${onConfirm})(); this.closest('div').parentElement.remove();" style="
                    padding: 10px 20px;
                    border: none;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                ">Confirm</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

function showFormModal(title, fields, onSubmit) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        overflow-y: auto;
    `;

    const fieldsHtml = fields.map(field => {
        if (field.type === 'textarea') {
            return `
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #2d3748;">
                        ${field.label}
                    </label>
                    <textarea 
                        id="${field.name}" 
                        ${field.required ? 'required' : ''}
                        placeholder="${field.placeholder || ''}"
                        style="
                            width: 100%;
                            padding: 10px;
                            border: 1px solid #e2e8f0;
                            border-radius: 8px;
                            font-size: 14px;
                            min-height: 100px;
                            font-family: inherit;
                        "
                    >${field.value || ''}</textarea>
                </div>
            `;
        } else if (field.type === 'select') {
            return `
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #2d3748;">
                        ${field.label}
                    </label>
                    <select 
                        id="${field.name}"
                        ${field.required ? 'required' : ''}
                        style="
                            width: 100%;
                            padding: 10px;
                            border: 1px solid #e2e8f0;
                            border-radius: 8px;
                            font-size: 14px;
                        "
                    >
                        ${field.options.map(opt => `
                            <option value="${opt.value}" ${field.value === opt.value ? 'selected' : ''}>
                                ${opt.label}
                            </option>
                        `).join('')}
                    </select>
                </div>
            `;
        } else {
            return `
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #2d3748;">
                        ${field.label}
                    </label>
                    <input 
                        type="${field.type || 'text'}" 
                        id="${field.name}" 
                        value="${field.value || ''}"
                        ${field.required ? 'required' : ''}
                        placeholder="${field.placeholder || ''}"
                        step="${field.step || 'any'}"
                        style="
                            width: 100%;
                            padding: 10px;
                            border: 1px solid #e2e8f0;
                            border-radius: 8px;
                            font-size: 14px;
                        "
                    >
                </div>
            `;
        }
    }).join('');

    modal.innerHTML = `
        <div style="
            background: white;
            padding: 30px;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            margin: 20px;
        ">
            <h2 style="margin-bottom: 25px; color: #2d3748;">${title}</h2>
            <form id="modalForm">
                ${fieldsHtml}
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
                    <button type="button" onclick="this.closest('div').parentElement.parentElement.remove()" style="
                        padding: 10px 20px;
                        border: 1px solid #e2e8f0;
                        background: white;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">Cancel</button>
                    <button type="submit" style="
                        padding: 10px 20px;
                        border: none;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">Submit</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    
    const form = modal.querySelector('#modalForm');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = {};
        fields.forEach(field => {
            const element = document.getElementById(field.name);
            let value = element.value;
            
            // Convert to appropriate type
            if (field.type === 'number') {
                value = parseFloat(value);
            } else if (field.type === 'checkbox') {
                value = element.checked;
            }
            
            formData[field.name] = value;
        });
        
        try {
            await onSubmit(formData);
            modal.remove();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
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
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
