// API Configuration and Helper Functions for Affluence Frontend

// Determine API base URL dynamically so we can host frontend on GitHub Pages
// and backend on a separate domain (e.g., pxxl.app)
function detectApiBase() {
    try {
        console.log("Detecting API base URL...");
        
        // 1) Explicit global override
        if (typeof window !== 'undefined' && window.AFFLUENCE_API_BASE) {
            console.log("Using global override API base:", window.AFFLUENCE_API_BASE);
            return String(window.AFFLUENCE_API_BASE).replace(/\/$/, '');
        }

        // 2) Meta tag in <head>: <meta name="api-base" content="https://api.example.com/api">
        if (typeof document !== 'undefined') {
            const meta = document.querySelector('meta[name="api-base"]');
            if (meta && meta.content) {
                console.log("Using meta tag API base:", meta.content);
                return String(meta.content).replace(/\/$/, '');
            }
        }

        // 3) Local storage (handy for quick overrides without code changes)
        const stored = (typeof localStorage !== 'undefined') ? localStorage.getItem('affluence_api_base') : null;
        if (stored) {
            console.log("Using localStorage API base:", stored);
            return String(stored).replace(/\/$/, '');
        }

        // 4) If running locally, force to local FastAPI - HARDCODED FOR RELIABILITY
        console.log("Using hardcoded API base: http://localhost:8000/api");
        return 'http://localhost:8000/api';
        
        /* Original detection logic
        if (typeof location !== 'undefined') {
            const host = location.hostname;
            if (host === 'localhost' || host === '127.0.0.1') {
                return 'http://localhost:8000/api';
            }
        }

        // 5) Fallback: assume same-origin under /api
        if (typeof location !== 'undefined') {
            return `${location.origin}/api`;
        }
        */
    } catch (e) {
        console.warn('API base detection failed, falling back to localhost:8000/api', e);
    }
    return 'http://localhost:8000/api';
}

// Print the detected API base URL for debugging
const detectedApiBase = detectApiBase();
console.log('DETECTED API BASE:', detectedApiBase);

const API_CONFIG = {
    BASE_URL: detectedApiBase,
    TIMEOUT: 30000, // 30 seconds
};

// API Helper Class
class AffluenceAPI {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.token = localStorage.getItem('affluence_token');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('affluence_token', token);
    }

    // Get authentication token
    getToken() {
        return this.token || localStorage.getItem('affluence_token');
    }

    // Remove authentication token
    removeToken() {
        this.token = null;
        localStorage.removeItem('affluence_token');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    }

    // Make HTTP request
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Add authorization header if token exists
        if (this.getToken() && !options.skipAuth) {
            headers['Authorization'] = `Bearer ${this.getToken()}`;
        }

        const config = {
            ...options,
            headers,
        };

        console.log(`API Request: ${config.method || 'GET'} ${url}`);
        console.log(`Headers:`, headers);
        
        try {
            // Add timeout to prevent hanging requests
            const fetchPromise = fetch(url, config);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timed out')), 10000)
            );
            
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            console.log(`API Response status: ${response.status} ${response.statusText}`);
            
            // Get response headers for debugging
            const responseHeaders = {};
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });
            console.log('Response headers:', responseHeaders);
            
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const text = await response.text();
                console.log('Raw response:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.error('JSON parse error:', e);
                    data = { message: text };
                }
            } else {
                data = { message: await response.text() };
                console.warn('Response not JSON:', data.message);
            }

            if (!response.ok) {
                // Handle authentication errors
                if (response.status === 401) {
                    this.removeToken();
                    // Redirect to appropriate login page based on current page
                    const isAdminPage = window.location.pathname.includes('admin-');
                    if (isAdminPage) {
                        window.location.href = '/admin-login.html';
                    } else {
                        window.location.href = '/login.html';
                    }
                }
                throw new Error(data.detail || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // GET request
    async get(endpoint, options = {}) {
        console.log('[API] GET request to:', endpoint);
        console.log('[API] Has token:', !!this.getToken());
        try {
            const result = await this.request(endpoint, { ...options, method: 'GET' });
            console.log('[API] GET success:', endpoint, result);
            return result;
        } catch (error) {
            console.error('[API] GET failed:', endpoint, error);
            throw error;
        }
    }

    // POST request
    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // PUT request
    async put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // DELETE request
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    // === AUTHENTICATION ENDPOINTS ===

    // Register new user
    async register(userData) {
        return this.post('/auth/register', userData, { skipAuth: true });
    }

    // Login user
    async login(username, password) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${this.baseURL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Login failed');
        }

        this.setToken(data.access_token);
        return data;
    }

    // Login admin (separate endpoint for admin authentication)
    async adminLogin(username, password) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${this.baseURL}/auth/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Admin login failed');
        }

        this.setToken(data.access_token);
        return data;
    }

    // Logout user
    logout() {
        this.removeToken();
        window.location.href = '/login.html';
    }

    // === USER ENDPOINTS ===

    // Get current user profile
    async getProfile() {
        return this.get('/users/me');
    }

    // Update user profile
    async updateProfile(profileData) {
        return this.put('/users/me', profileData);
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        return this.post('/users/me/change-password', {
            current_password: currentPassword,
            new_password: newPassword,
        });
    }

    // Update bank details
    async updateBankDetails(bankData) {
        return this.put('/users/me/bank-details', bankData);
    }

    // Get dashboard statistics
    async getDashboardStats() {
        return this.get('/users/dashboard');
    }

    // Get referral information
    async getReferralInfo() {
        return this.get('/users/referrals');
    }

    // Get notifications
    async getNotifications(skip = 0, limit = 20) {
        return this.get(`/users/notifications?skip=${skip}&limit=${limit}`);
    }

    // Mark notification as read
    async markNotificationRead(notificationId) {
        return this.put(`/users/notifications/${notificationId}/read`);
    }

    // Get transaction history
    async getTransactions(skip = 0, limit = 50) {
        return this.get(`/users/transactions?skip=${skip}&limit=${limit}`);
    }

    // Get top earners leaderboard
    async getTopEarners(limit = 20) {
        return this.get(`/users/top-earners?limit=${limit}`);
    }

    // === TASK ENDPOINTS ===

    // Get all available tasks
    async getTasks() {
        return this.get('/tasks/');
    }

    // Get user's tasks
    async getMyTasks() {
        return this.get('/tasks/my-tasks');
    }

    // Take a task
    async takeTask(taskId) {
        return this.post(`/tasks/${taskId}/take`);
    }

    // Claim task reward
    async claimTask(taskId) {
        return this.post(`/tasks/${taskId}/claim`);
    }

    // === WITHDRAWAL ENDPOINTS ===

    // Create withdrawal request
    async createWithdrawal(amount, balanceType) {
        return this.post('/withdrawals/', {
            amount: parseFloat(amount),
            balance_type: balanceType,
        });
    }

    // Get withdrawal history
    async getWithdrawals(skip = 0, limit = 50) {
        return this.get(`/withdrawals/?skip=${skip}&limit=${limit}`);
    }

    // Get specific withdrawal
    async getWithdrawal(withdrawalId) {
        return this.get(`/withdrawals/${withdrawalId}`);
    }

    // === LOAN ENDPOINTS ===

    // Apply for loan
    async applyForLoan(amount, durationMonths, purpose) {
        return this.post('/loans/', {
            amount: parseFloat(amount),
            duration_months: parseInt(durationMonths),
            purpose: purpose,
        });
    }

    // Get loan history
    async getLoans(skip = 0, limit = 50) {
        return this.get(`/loans/?skip=${skip}&limit=${limit}`);
    }

    // Get specific loan
    async getLoan(loanId) {
        return this.get(`/loans/${loanId}`);
    }

    // === STREAMING ENDPOINTS ===

    // Get available audio tracks
    async getAudios() {
        return this.get('/streams/audios');
    }

    // Start streaming session
    async startStream(audioId) {
        return this.post('/streams/start', { audio_id: audioId });
    }

    // Update stream progress
    async updateStreamProgress(streamId, durationListened) {
        return this.put(`/streams/${streamId}/update`, {
            duration_listened: durationListened,
        });
    }

    // Claim stream reward
    async claimStreamReward(streamId) {
        return this.post(`/streams/${streamId}/claim`);
    }

    // Get streaming history
    async getStreamHistory(skip = 0, limit = 50) {
        return this.get(`/streams/history?skip=${skip}&limit=${limit}`);
    }
}

// Create global API instance
const api = new AffluenceAPI();
// Ensure availability on window for cross-script access
try { window.api = api; } catch (_) {}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
    }).format(amount).replace('NGN', '₦');
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Helper function to show toast notification
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS animations
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

// Check authentication on protected pages
function checkAuth() {
    const publicPages = ['/index.html', '/login.html', '/register.html', '/'];
    const adminPages = ['/admin-login.html', '/admin-dashboard.html', '/admin-users.html', 
                        '/admin-coupons.html', '/admin-articles.html', '/admin-cards.html', 
                        '/admin-withdrawals.html', '/admin-announcements.html', '/admin-logs.html'];
    const currentPage = window.location.pathname;
    
    // Skip auth check for admin pages (they have their own auth logic)
    if (adminPages.some(page => currentPage.includes('admin-'))) {
        return;
    }
    
    if (!publicPages.includes(currentPage) && !api.isAuthenticated()) {
        window.location.href = '/login.html';
    }
}

// Run auth check on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth);
} else {
    checkAuth();
}
