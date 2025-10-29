/**
 * API Configuration and Helper Functions for Affluence Frontend
 * This file provides the core API functionality for communicating with the backend.
 */

console.log('[api.js] Initializing API...');

/**
 * Determine API base URL dynamically based on various sources
 * @returns {string} The base URL for API calls
 */
function detectApiBase() {
    console.log("[api.js] Detecting API base URL...");
    
    try {
        // 1) Explicit global override
        if (typeof window !== 'undefined' && window.AFFLUENCE_API_BASE) {
            console.log("[api.js] Using global override API base:", window.AFFLUENCE_API_BASE);
            return String(window.AFFLUENCE_API_BASE).replace(/\/$/, '');
        }

        // 2) Meta tag in <head>: <meta name="api-base" content="https://api.example.com">
        if (typeof document !== 'undefined') {
            const meta = document.querySelector('meta[name="api-base"]');
            if (meta && meta.content) {
                console.log("[api.js] Using meta tag API base:", meta.content);
                return String(meta.content).replace(/\/$/, '');
            }
        }

        // 3) Local storage (handy for quick overrides without code changes)
        const stored = (typeof localStorage !== 'undefined') ? localStorage.getItem('affluence_api_base') : null;
        if (stored) {
            console.log("[api.js] Using localStorage API base:", stored);
            return String(stored).replace(/\/$/, '');
        }

    // 4) Default to your hosted backend (can still be overridden via meta tag or localStorage)
    console.log("[api.js] Using default hosted API base URL");
    // Include /api in the base URL since it's part of the backend router prefix
    return 'https://affluence-backends-noae.vercel.app/ai';
    } catch (e) {
        console.error('[api.js] API base detection failed:', e);
        return 'https://affluence-backends-noae.vercel.app/ai';
    }
}

// API Configuration and Constants
const API_CONFIG = {
    DEBUG: true,
    TIMEOUT: 20000, // 20 seconds timeout for all requests
    RETRY_COUNT: 2,
    REFRESH_TOKEN_URL: '/auth/refresh',
    STORAGE_KEY: 'affluence_token',
};

/**
 * Affluence API Client
 */
class AffluenceAPI {
    constructor() {
        // Set API base URL
        this.baseURL = detectApiBase();
        this.token = null;
        this.debug = API_CONFIG.DEBUG;
        
        // Try to restore token from localStorage
        this.token = this.getToken();
        
        if (this.debug) {
            console.log('[api.js] API Client initialized with base URL:', this.baseURL);
            console.log('[api.js] Authentication status:', this.isAuthenticated() ? 'Authenticated' : 'Not authenticated');
        }
    }
    
    /**
     * Store authentication token in memory and localStorage
     * @param {string} token - JWT token from backend
     */
    setToken(token) {
        this.token = token;
        
        try {
            localStorage.setItem('affluence_token', token);
            if (this.debug) console.log('[api.js] Token stored in localStorage');
        } catch (e) {
            console.warn('[api.js] Could not store token in localStorage:', e);
        }
    }
    
    /**
     * Get authentication token from memory or localStorage
     * @returns {string|null} JWT token or null if not available
     */
    getToken() {
        try {
            return this.token || localStorage.getItem('affluence_token'); 
        } catch (e) { 
            console.warn('[api.js] Could not get token from localStorage:', e);
            return this.token; 
        } 
    }
    
    /**
     * Remove authentication token from memory and localStorage
     */
    removeToken() { 
        this.token = null; 
        try { 
            localStorage.removeItem('affluence_token'); 
            if (this.debug) console.log('[api.js] Token removed from localStorage');
        } catch (e) {
            console.warn('[api.js] Could not remove token from localStorage:', e);
        } 
    }

    /**
     * Backup current admin token before impersonation
     * Returns the backed up token or null
     */
    backupToken() {
        try {
            const current = this.getToken();
            if (!current) return null;

            // Don't overwrite existing backup
            const existing = localStorage.getItem('affluence_admin_token_backup');
            if (existing) {
                if (this.debug) console.log('[api.js] Admin token backup already exists');
                return existing;
            }

            localStorage.setItem('affluence_admin_token_backup', current);
            if (this.debug) console.log('[api.js] Admin token backed up');
            return current;
        } catch (e) {
            console.warn('[api.js] Could not backup token:', e);
            return null;
        }
    }

    /**
     * Start impersonation: backup current token, set new token and store meta
     * @param {string} newToken
     * @param {Object} meta - optional meta info about impersonation (user id, username)
     */
    startImpersonation(newToken, meta = {}) {
        try {
            this.backupToken();
            this.setToken(newToken);
            try {
                localStorage.setItem('affluence_impersonation_meta', JSON.stringify(meta || {}));
            } catch (e) {
                console.warn('[api.js] Could not store impersonation meta:', e);
            }

            if (this.debug) console.log('[api.js] Impersonation started', meta || {});
            return true;
        } catch (e) {
            console.error('[api.js] Failed to start impersonation:', e);
            throw e;
        }
    }

    /**
     * Convenience: if backend returned an impersonation response, apply it
     * Expected shape: { access_token: '...', user: { user_id, username, ... } }
     */
    startImpersonationFromResponse(resp) {
        if (!resp) return null;
        const token = resp.access_token || resp.token;
        const meta = resp.user || resp;
        if (!token) return null;
        return this.startImpersonation(token, meta);
    }

    /**
     * Check if current session is an impersonation (admin backup exists)
     * @returns {boolean}
     */
    isImpersonating() {
        try {
            return !!localStorage.getItem('affluence_admin_token_backup');
        } catch (e) {
            return false;
        }
    }

    /**
     * Get impersonation metadata stored during startImpersonation
     */
    getImpersonationMeta() {
        try {
            const raw = localStorage.getItem('affluence_impersonation_meta');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Stop impersonation and restore the backed up admin token (if available)
     * Returns true if restored, false if no backup existed (token removed)
     */
    stopImpersonation() {
        try {
            const backup = localStorage.getItem('affluence_admin_token_backup');
            if (backup) {
                this.setToken(backup);
                localStorage.removeItem('affluence_admin_token_backup');
                localStorage.removeItem('affluence_impersonation_meta');
                if (this.debug) console.log('[api.js] Impersonation stopped, admin token restored');
                return true;
            }

            // No backup: simply remove any token (logout)
            this.removeToken();
            if (this.debug) console.log('[api.js] No impersonation backup found; token cleared');
            return false;
        } catch (e) {
            console.error('[api.js] Failed to stop impersonation:', e);
            throw e;
        }
    }
    
    /**
     * Check if user is authenticated
     * @returns {boolean} True if authenticated
     */
    isAuthenticated() { 
        return !!this.getToken(); 
    }

    /**
     * Make an HTTP request to the API
     * @param {string} endpoint - API endpoint to call
     * @param {Object} options - Request options
     * @returns {Promise<any>} Response data
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = { 
            'Content-Type': 'application/json', 
            ...(options.headers || {}) 
        };
        
        // Add auth token if available and not explicitly skipped
        if (this.getToken() && !options.skipAuth) {
            headers['Authorization'] = `Bearer ${this.getToken()}`;
        }
        
        const config = {
            ...options,
            headers,
        };
        
        if (this.debug) {
            console.log(`[api.js] ${options.method || 'GET'} request to: ${url}`);
            console.log(`[api.js] Headers:`, headers);
            if (options.body) {
                console.log(`[api.js] Request body:`, options.body);
            }
        }
        
        // Set up timeout with AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            if (this.debug) console.error(`[api.js] Request timed out after ${API_CONFIG.TIMEOUT}ms`);
        }, API_CONFIG.TIMEOUT);
        
        try {
            // Make the actual request with timeout handling
            const response = await fetch(url, { 
                ...config, 
                signal: controller.signal 
            });
            clearTimeout(timeoutId);
            
            if (this.debug) {
                console.log(`[api.js] Response status: ${response.status} ${response.statusText}`);
            }
            
            // For file downloads, return the raw response
            if (options.responseType === 'blob' || options.rawResponse) {
                return response;
            }
            
            // Parse JSON for all other requests
            let data;
            try {
                data = await response.json();
            } catch (e) {
                if (this.debug) console.warn(`[api.js] Failed to parse response as JSON:`, e);
                data = { message: 'Invalid response format from server' };
            }
            
            if (this.debug && data) {
                console.log(`[api.js] Response data:`, data);
            }
            
            if (!response.ok) {
                const error = new Error(data?.detail || data?.message || 'API request failed');
                error.status = response.status;
                error.data = data;
                throw error;
            }
            
            return data;
        } catch (err) {
            clearTimeout(timeoutId);
            
            // Handle specific errors more gracefully
            if (err.name === 'AbortError') {
                throw new Error(`Request timeout after ${API_CONFIG.TIMEOUT}ms`);
            }
            
            // Forward other errors
            throw err;
        }
    }

    /**
     * Make a GET request to the API
     * @param {string} endpoint - API endpoint to call
     * @param {Object} options - Request options
     * @returns {Promise<any>} Response data
     */
    async get(endpoint, options = {}) { 
        return this.request(endpoint, {
            ...options,
            method: 'GET',
        });
    }
    
    /**
     * Make a POST request to the API
     * @param {string} endpoint - API endpoint to call
     * @param {Object} data - Request body data
     * @param {Object} options - Request options
     * @returns {Promise<any>} Response data
     */
    async post(endpoint, data, options = {}) { 
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
    
    /**
     * Make a PUT request to the API
     * @param {string} endpoint - API endpoint to call
     * @param {Object} data - Request body data
     * @param {Object} options - Request options
     * @returns {Promise<any>} Response data
     */
    async put(endpoint, data, options = {}) { 
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }
    
    /**
     * Make a DELETE request to the API
     * @param {string} endpoint - API endpoint to call
     * @param {Object} options - Request options
     * @returns {Promise<any>} Response data
     */
    async delete(endpoint, options = {}) { 
        return this.request(endpoint, {
            ...options,
            method: 'DELETE',
        });
    }
    
    /**
     * Authenticate user with email/username and password
     * @param {string} email - User email or username
     * @param {string} password - User password
     * @returns {Promise<Object>} Authentication response with token
     */
    async login(email, password) {
        if (this.debug) console.log('[api.js] Attempting user login for:', email);
        
        try {
            // For OAuth2PasswordRequestForm we must use form-urlencoded format
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);
            
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Handle 422 validation errors more gracefully
                if (response.status === 422 && data.detail) {
                    let errorMessage = 'Login validation failed';
                    
                    // Handle pydantic validation errors which come as an array
                    if (Array.isArray(data.detail)) {
                        errorMessage = data.detail
                            .map(err => `${err.loc.join('.')}: ${err.msg}`)
                            .join('; ');
                    } else if (typeof data.detail === 'string') {
                        errorMessage = data.detail;
                    }
                    
                    const error = new Error(errorMessage);
                    error.status = response.status;
                    error.data = data;
                    throw error;
                }
                
                const error = new Error(data.detail || 'Login failed');
                error.status = response.status;
                error.data = data;
                throw error;
            }
            
            this.setToken(data.access_token);
            if (this.debug) console.log('[api.js] Login successful, token saved');
            
            return data;
        } catch (error) {
            console.error('[api.js] Login error:', error);
            throw error;
        }
    }

    /**
     * Admin login endpoint
     * @param {string} email - Admin email
     * @param {string} password - Admin password
     * @returns {Promise<Object>} Authentication response
     */
    async adminLogin(email, password) {
        if (this.debug) console.log('[api.js] Attempting admin login for:', email);
        
        try {
            // For OAuth2PasswordRequestForm we must use form-urlencoded format
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);
            
            const response = await fetch(`${this.baseURL}/auth/admin/login`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                const error = new Error(data.detail || 'Admin login failed');
                error.status = response.status;
                error.data = data;
                throw error;
            }
            
            this.setToken(data.access_token);
            if (this.debug) console.log('[api.js] Admin login successful, token saved');
            
            return data;
        } catch (error) {
            console.error('[api.js] Admin login error:', error);
            throw error;
        }
    }
    
    /**
     * Logout user by removing token
     */
    logout() {
        this.removeToken();
        if (this.debug) console.log('[api.js] User logged out');
    }
    
    // User-related methods
    
    /**
     * Get current user profile
     * @returns {Promise<Object>} User profile
     */
    async getProfile() {
        return this.request('/users/me');
    }
    
    /**
     * Update user profile
     * @param {Object} data - Profile data to update
     * @returns {Promise<Object>} Updated user profile
     */
    async updateProfile(data) {
        return this.request('/users/me', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * Update or create bank details for the current user
     * @param {Object} data - { bank_name, account_name, account_number }
     * @returns {Promise<Object>} Updated bank details
     */
    async updateBankDetails(data) {
        return this.request('/users/me/bank-details', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * Change current user's password
     * @param {string} currentPassword
     * @param {string} newPassword
     * @returns {Promise<Object>} Change password response
     */
    async changePassword(currentPassword, newPassword) {
        return this.post('/users/me/change-password', {
            current_password: currentPassword,
            new_password: newPassword
        });
    }
    
    /**
     * Get all available tasks
     * @returns {Promise<Array>} List of available tasks
     */
    async getTasks() {
        try {
            // First try the standard tasks endpoint
            try {
                return await this.get('/tasks/');
            } catch (endpointError) {
                console.log('[api.js] Standard tasks endpoint not available, trying click-to-earn endpoint');
                
                // If standard endpoint fails, try the click-to-earn endpoint used by admin panel
                try {
                    const clickToEarnTask = await this.get('/admin/click-to-earn');
                    
                    // Convert the click-to-earn task format to the standard task format
                    // The admin panel's click-to-earn task has a different structure
                    if (clickToEarnTask) {
                        console.log('[api.js] Using click-to-earn task from admin panel:', clickToEarnTask);
                        
                        // Return as an array with the single task, formatted to match the expected structure
                        return [{
                            id: clickToEarnTask.id || 1,
                            title: "Click-to-Earn Task",
                            description: "Complete this task to earn rewards",
                            amount: clickToEarnTask.amount || 500,
                            reward_type: "activity",
                            time_estimate: 5,
                            task_type: clickToEarnTask.task_type || "click_to_earn",
                            status: "active",
                            availability: "daily",
                            link: clickToEarnTask.link || "#"
                        }];
                    }
                } catch (adminError) {
                    console.log('[api.js] Admin click-to-earn endpoint not available, using mock data');
                }
                
                // If both endpoints fail, use mock data
                console.log('[api.js] All task endpoints unavailable, using mock data');
                return this.getMockTasks();
            }
        } catch (error) {
            console.error('[api.js] Error fetching tasks:', error);
            
            // Fallback to mock data
            console.log('[api.js] Falling back to mock task data due to error');
            return this.getMockTasks();
        }
    }
    
    /**
     * Get user's tasks
     * @returns {Promise<Array>} List of user's tasks
     */
    async getMyTasks() {
        try {
            return await this.get('/tasks/my-tasks');
        } catch (error) {
            console.error('[api.js] Error fetching user tasks:', error);
            
            // Generate mock data if endpoint is not available
            if (error.status === 404) {
                console.log('[api.js] User tasks endpoint not available, using mock data');
                return this.getMockUserTasks();
            }
            
            throw error;
        }
    }
    
    /**
     * Take a task
     * @param {number} taskId - Task ID to take
     * @returns {Promise<Object>} Task take response
     */
    async takeTask(taskId) {
        try {
            return await this.post(`/tasks/${taskId}/take`);
        } catch (error) {
            console.error('[api.js] Error taking task:', error);
            
            // Simulate success if endpoint doesn't exist
            if (error.status === 404) {
                console.log('[api.js] Task take endpoint not available, simulating success');
                return { 
                    success: true, 
                    message: 'Task taken successfully (simulated)', 
                    user_task_id: Math.floor(Math.random() * 1000),
                    task: this.getMockTasks().find(t => t.id === taskId)
                };
            }
            
            throw error;
        }
    }
    
    /**
     * Claim task reward
     * @param {number} taskId - Task ID to claim
     * @returns {Promise<Object>} Task claim response
     */
    async claimTask(taskId) {
        try {
            return await this.post(`/tasks/${taskId}/claim`);
        } catch (error) {
            console.error('[api.js] Error claiming task:', error);
            
            // Simulate success if endpoint doesn't exist
            if (error.status === 404) {
                console.log('[api.js] Task claim endpoint not available, simulating success');
                return { 
                    success: true, 
                    message: 'Task reward claimed successfully (simulated)',
                    amount: Math.floor(Math.random() * 100) + 10,
                    balance_type: 'activity',
                    task: this.getMockUserTasks().find(t => t.task_id === taskId || t.id === taskId)?.task
                };
            }
            
            throw error;
        }
    }
    
    /**
     * Generate mock tasks data if the real endpoint is unavailable
     * @private
     * @returns {Array} Mock tasks
     */
    getMockTasks() {
        return [
            {
                id: 1,
                title: "WhatsApp Group Task",
                description: "Join the WhatsApp group and earn rewards",
                amount: 2000,
                reward_type: "activity",
                time_estimate: 5,
                task_type: "alpha",
                status: "active",
                availability: "daily",
                link: "https://chat.whatsapp.com/KUa9YFBd7D3AHwsTukdGx8"
            },
            {
                id: 2,
                title: "Millionaires Hub",
                description: "Join and earn daily",
                amount: 3000,
                reward_type: "activity",
                time_estimate: 3,
                task_type: "mega",
                status: "active",
                availability: "daily",
                link: "https://chat.whatsapp.com/CcXMzxqP3IDGaC5IKAmae3"
            },
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
    }
    
    /**
     * Generate mock user tasks data if the real endpoint is unavailable
     * @private
     * @returns {Array} Mock user tasks
     */
    getMockUserTasks() {
        return [
            {
                id: 101,
                user_id: 1,
                task_id: 1,
                status: "completed",
                taken_at: "2025-10-22T08:30:00",
                completed_at: "2025-10-22T08:35:00",
                claimed_at: "2025-10-22T08:35:30",
                task: {
                    id: 1,
                    title: "Read Daily Article",
                    description: "Read today's featured article and earn rewards",
                    reward: 10,
                    reward_type: "activity",
                    time_estimate: 5,
                    task_type: "read_article",
                    status: "active",
                    availability: "daily"
                }
            },
            {
                id: 102,
                user_id: 1,
                task_id: 2,
                status: "taken",
                taken_at: "2025-10-23T09:15:00",
                completed_at: null,
                claimed_at: null,
                task: {
                    id: 2,
                    title: "Complete Quiz",
                    description: "Take a short quiz about financial literacy",
                    reward: 15,
                    reward_type: "activity",
                    time_estimate: 3,
                    task_type: "quiz",
                    status: "active",
                    availability: "daily"
                }
            }
        ];
    }

    /**
     * Get top earners for the leaderboard
     * @param {number} limit - Maximum number of earners to return
     * @returns {Promise<Array>} List of top earners
     */
    async getTopEarners(limit = 20) {
        try {
            // Try the specific top earners endpoint
            return await this.get(`/users/top-earners?limit=${limit}`);
        } catch (error) {
            if (this.debug) {
                console.log('[api.js] Could not fetch from /users/top-earners, trying alternative endpoint');
            }
            
            try {
                // Try the alternative endpoint
                return await this.get(`/leaderboard?limit=${limit}`);
            } catch (secondError) {
                if (this.debug) {
                    console.log('[api.js] Failed to fetch from alternative endpoint, generating mock data');
                }
                
                // If both fail, return mock data for development purposes
                return this._generateMockTopEarners(limit);
            }
        }
    }
    
    /**
     * Get dashboard statistics and user data
     * @returns {Promise<Object>} Dashboard statistics
     */
    async getDashboardStats() {
        try {
            // Prefer the dedicated dashboard endpoint which returns structured stats
            return await this.get('/users/dashboard');
        } catch (err) {
            console.error('[api.js] Failed to load dashboard data from /users/dashboard:', err);
            throw err;
        }
    }

    /**
     * Get referral information for the current user
     * @returns {Promise<Object>} Referral info (e.g., { referral_code, total_referrals })
     */
    async getReferralInfo() {
        return this.get('/users/referrals');
    }
    
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Registration response
     */
    async register(userData) {
        return await this.post('/auth/register', userData, { skipAuth: true });
    }
    
    /**
     * Create a new withdrawal request
     * @param {number} amount - Amount to withdraw
     * @param {string} balanceType - Type of balance to withdraw from ('activity', 'referral', etc.)
     * @returns {Promise<Object>} Withdrawal response
     */
    async createWithdrawal(amount, balanceType) {
        try {
            return await this.post('/withdrawals/', {
                amount: Number(amount),
                balance_type: balanceType
            });
        } catch (error) {
            console.error('[api.js] Failed to create withdrawal request:', error);
            
            // Mock successful withdrawal for development/testing
            if (this.debug && (error.status === 404 || error.message.includes('Not Found'))) {
                console.log('[api.js] Using mock withdrawal response');
                return {
                    id: 'mock-' + Date.now(),
                    amount: Number(amount),
                    balance_type: balanceType,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                    message: 'Withdrawal request submitted successfully (Mock)'
                };
            }
            
            throw error;
        }
    }
    
    /**
     * Get withdrawal history
     * @param {number} skip - Number of records to skip (pagination)
     * @param {number} limit - Maximum number of records to return
     * @returns {Promise<Array>} List of withdrawals
     */
    async getWithdrawals(skip = 0, limit = 50) {
        try {
            return await this.get(`/withdrawals/?skip=${skip}&limit=${limit}`);
        } catch (error) {
            console.error('[api.js] Failed to get withdrawals:', error);
            
            // Return mock data for development/testing
            if (this.debug && (error.status === 404 || error.message.includes('Not Found'))) {
                console.log('[api.js] Using mock withdrawal history');
                return this._getMockWithdrawals(limit);
            }
            
            throw error;
        }
    }
    
    /**
     * Generate mock withdrawal history data for development purposes
     * @private
     * @param {number} count - Number of mock withdrawals to generate
     * @returns {Array} Array of mock withdrawal data
     */
    _getMockWithdrawals(count = 5) {
        const statuses = ['pending', 'approved', 'pending', 'approved', 'pending', 'rejected'];
        const balanceTypes = ['activity', 'referral', 'activity', 'activity', 'referral'];
        const mockWithdrawals = [];
        
        for (let i = 0; i < count; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i); // Each entry is a day older
            
            mockWithdrawals.push({
                id: 'mock-' + (1000 + i),
                amount: Math.floor((5000 + Math.random() * 15000) * 100) / 100, // Random amount between 5000-20000
                balance_type: balanceTypes[i % balanceTypes.length],
                status: statuses[i % statuses.length],
                created_at: date.toISOString(),
                processed_at: statuses[i % statuses.length] !== 'pending' ? 
                              new Date(date.getTime() + 1000*60*60*3).toISOString() : null // 3 hours later if processed
            });
        }
        
        return mockWithdrawals;
    }
    
    /**
     * Generate mock top earners data for development purposes
     * @private
     * @param {number} limit - Number of mock users to generate
     * @returns {Array} Array of mock top earner data
     */
    _generateMockTopEarners(limit = 20) {
        if (this.debug) {
            console.log('[api.js] Generating mock top earners data for development');
        }
        
        const mockUsers = [];
        const usernames = ['afrozen', 'bitcoin_king', 'cryptoqueen', 'affluencer22', 'dailyearner', 
                         'toptrader', 'incomeguru', 'megaearner', 'wealthbuilder', 'hustler365',
                         'affluence_pro', 'smart_earner', 'top_affiliate', 'money_maker', 'crypto_guru',
                         'passiveincome', 'digital_nomad', 'freedom_seeker', 'early_adopter', 'wealth_creator',
                         'future_millionaire', 'daily_hustle', 'consistent_earner', 'finance_expert', 'affluence_master'];
                         
        const names = ['John Smith', 'Mary Johnson', 'David Williams', 'Sarah Brown', 'Michael Davis',
                     'Jennifer Miller', 'Robert Wilson', 'Jessica Moore', 'Thomas Taylor', 'Lisa Anderson',
                     'Daniel Thomas', 'Patricia Jackson', 'Christopher White', 'Elizabeth Harris', 'Matthew Martin',
                     'Linda Thompson', 'Andrew Garcia', 'Susan Martinez', 'Joseph Robinson', 'Margaret Clark',
                     'Ryan Rodriguez', 'Kimberly Lewis', 'Kevin Lee', 'Deborah Walker', 'Edward Hall'];
        
        // Create mock data with decreasing balances
        for (let i = 0; i < Math.min(limit, usernames.length); i++) {
            const baseAmount = Math.floor(1000000 - (i * 45000 + Math.random() * 10000));
            mockUsers.push({
                username: usernames[i],
                full_name: names[i],
                referral_code: 'REF' + (1000 + i),
                affiliate_balance: baseAmount / 100,
                referral_count: Math.floor(100 - (i * 4.5 + Math.random() * 5))
            });
        }
        
        return mockUsers;
    }
    
    /**
     * Test connection to API
     * @returns {Promise<boolean>} True if connection successful
     */
    async testConnection() {
        try {
            const data = await this.request('/health', { skipAuth: true });
            console.log('[api.js] API connection test successful:', data);
            return true;
        } catch (err) {
            console.error('[api.js] API connection test failed:', err);
            return false;
        }
    }
}

// Create global API instance
const api = new AffluenceAPI();

// Make sure it's available globally
if (typeof window !== 'undefined') {
    window.api = api;
    console.log('[api.js] Global API instance created and attached to window');
}

// Small UI helpers
function formatCurrency(amount) { try { return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount).replace('NGN', '₦'); } catch (_) { return amount; } }
function formatDate(dateString) { try { const d = new Date(dateString); return d.toLocaleString(); } catch (_) { return dateString; } }

// Toast helper
function showToast(message, type = 'info') {
    const t = document.createElement('div'); t.className = `toast toast-${type}`; t.textContent = message;
    t.style.cssText = 'position:fixed;top:20px;right:20px;padding:10px 15px;color:#fff;border-radius:6px;z-index:10000;';
    t.style.background = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    document.body.appendChild(t); setTimeout(() => t.remove(), 3000);
}

// Auth check for non-admin pages
function checkAuth() {
    const publicPages = ['/index.html', '/login.html', '/register.html', '/', '/login-test.html'];
    const adminPages = ['/admin-login.html', '/admin-dashboard.html', '/admin-users.html'];
    const current = window.location.pathname || '/';
    if (adminPages.some(p => current.includes('admin-'))) return; // admin pages handle auth separately
    if (!publicPages.includes(current) && !api.isAuthenticated()) window.location.href = '/login.html';
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', checkAuth); else checkAuth();