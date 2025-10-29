// API Configuration and Helper Functions for Affluence Frontend

// Determine API base URL dynamically
function detectApiBase() {
    try {
        console.log('Detecting API base URL...');

        // 1) Explicit global override
        if (typeof window !== 'undefined' && window.AFFLUENCE_API_BASE) {
            return String(window.AFFLUENCE_API_BASE).replace(/\/$/, '');
        }

        // 2) Meta tag
        if (typeof document !== 'undefined') {
            const meta = document.querySelector('meta[name="api-base"]');
            if (meta && meta.content) return String(meta.content).replace(/\/$/, '');
        }

        // 3) Local storage override
        const stored = (typeof localStorage !== 'undefined') ? localStorage.getItem('affluence_api_base') : null;
        if (stored) return String(stored).replace(/\/$/, '');

        // 4) Default to local backend (include /api because backend router uses /api/admin)
        return 'http://localhost:8000/api';
    } catch (e) {
        console.warn('API base detection failed, falling back to http://localhost:8000/api', e);
        return 'http://localhost:8000/api';
    }
}

const detectedApiBase = detectApiBase();
console.log('DETECTED API BASE:', detectedApiBase);

const API_CONFIG = {
    BASE_URL: detectedApiBase,
    TIMEOUT: 30000,
};

class AffluenceAPI {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        try { this.token = localStorage.getItem('affluence_token'); } catch (_) { this.token = null; }
    }

    setToken(token) { this.token = token; try { localStorage.setItem('affluence_token', token); } catch (_) {} }
    getToken() { try { return this.token || localStorage.getItem('affluence_token'); } catch (_) { return this.token; } }
    removeToken() { this.token = null; try { localStorage.removeItem('affluence_token'); } catch (_) {} }
    isAuthenticated() { return !!this.getToken(); }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
        if (this.getToken() && !options.skipAuth) headers['Authorization'] = `Bearer ${this.getToken()}`;

        const config = { ...options, headers };
        console.log(`[api] ${config.method || 'GET'} ${url}`, headers);

        // Timeout via AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
        try {
            const resp = await fetch(url, { ...config, signal: controller.signal });
            clearTimeout(timeoutId);

            const contentType = resp.headers.get('content-type') || '';
            let data = null;
            if (contentType.includes('application/json')) {
                const text = await resp.text();
                try { data = JSON.parse(text); } catch (e) { data = { message: text }; }
            } else {
                data = { message: await resp.text() };
            }

            if (!resp.ok) {
                if (resp.status === 401) {
                    this.removeToken();
                    const isAdmin = window.location.pathname.includes('admin-');
                    window.location.href = isAdmin ? '/admin-login.html' : '/login.html';
                }
                const errDetail = (data && data.detail) ? data.detail : (data && data.message) ? data.message : 'Request failed';
                const e = new Error(errDetail);
                e.status = resp.status;
                throw e;
            }

            return data;
        } catch (err) {
            if (err.name === 'AbortError') throw new Error('Request timed out');
            throw err;
        }
    }

    async get(endpoint, options = {}) { return this.request(endpoint, { ...options, method: 'GET' }); }
    async post(endpoint, data, options = {}) { return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }); }
    async put(endpoint, data, options = {}) { return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }); }
    async delete(endpoint, options = {}) { return this.request(endpoint, { ...options, method: 'DELETE' }); }

    // Lightweight auth helpers
    async login(username, password) {
        const form = new URLSearchParams(); form.append('username', username); form.append('password', password);
        const resp = await fetch(`${this.baseURL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.detail || 'Login failed');
        this.setToken(data.access_token);
        return data;
    }

    async adminLogin(username, password) {
        const form = new URLSearchParams(); form.append('username', username); form.append('password', password);
        const resp = await fetch(`${this.baseURL}/auth/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.detail || 'Admin login failed');
        this.setToken(data.access_token);
        return data;
    }
}

// Create global API instance and expose it
const api = new AffluenceAPI();
try { window.api = api; } catch (_) {}

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
    const publicPages = ['/index.html', '/login.html', '/register.html', '/'];
    const adminPages = ['/admin-login.html', '/admin-dashboard.html', '/admin-users.html'];
    const current = window.location.pathname || '/';
    if (adminPages.some(p => current.includes('admin-'))) return; // admin pages handle auth separately
    if (!publicPages.includes(current) && !api.isAuthenticated()) window.location.href = '/login.html';
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', checkAuth); else checkAuth();
