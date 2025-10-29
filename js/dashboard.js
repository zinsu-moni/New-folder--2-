// Dashboard Page Integration

let dashboardData = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Load dashboard data
    await loadDashboardData();
    
    // Load user profile
    await loadUserProfile();
    
    // Wire up withdraw links to check bank details first
    setupWithdrawLinks();
    
    // Hide notifications on the user dashboard as requested
    try {
        const notifEls = document.querySelectorAll('.notification-icon');
        notifEls.forEach(el => el.style.display = 'none');
    } catch (e) {
        console.warn('[dashboard.js] Could not hide notifications:', e);
    }

    // Set up referral link copy
    setupReferralLinkCopy();
    
    // Set up logout
    setupLogout();
});

async function loadDashboardData() {
    try {
        // Show loading state
        showLoadingState();
        
        // Fetch dashboard stats
        dashboardData = await api.getDashboardStats();
        console.log('[dashboard.js] Raw dashboardData:', dashboardData);

    // Debug panel removed: raw dashboard data toggle intentionally hidden in production
        
        // Update balance cards
        updateBalanceCards(dashboardData);
        
        // Update stats cards
        updateStatsCards(dashboardData);
        
        // Load referral info
        await loadReferralInfo();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

/**
 * Intercept clicks to any link that navigates to withdraw.html and
 * ensure the user has bank details. If not, redirect to profile page
 * so they can add bank details.
 */
function setupWithdrawLinks() {
    try {
        // Match links that point to withdraw.html or have class 'balance-btn' linking to withdraw
        const withdrawAnchors = Array.from(document.querySelectorAll('a[href$="withdraw.html"]'));

        withdrawAnchors.forEach(a => {
            a.addEventListener('click', async (e) => {
                try {
                    // Prevent immediate navigation while we check
                    e.preventDefault();
                    const href = a.getAttribute('href') || 'withdraw.html';

                    // Fetch fresh profile to check bank details
                    let profile = null;
                    try {
                        profile = await api.getProfile();
                    } catch (err) {
                        console.warn('[dashboard.js] Could not fetch profile before withdraw navigation:', err);
                        // If we can't fetch profile, allow navigation
                        window.location.href = href;
                        return;
                    }

                    const hasBank = !!(profile && profile.bank_details && profile.bank_details.account_number);
                    if (!hasBank) {
                        showToast('Please add your bank details before requesting a withdrawal. Redirecting to your profile...', 'warning');
                        // Redirect to profile where bank details form exists
                        setTimeout(() => {
                            // Optionally jump to bank details area
                            window.location.href = 'profile.html';
                        }, 900);
                        return;
                    }

                    // Bank details exist — proceed to withdraw page
                    window.location.href = href;
                } catch (err) {
                    console.error('[dashboard.js] Error handling withdraw link click:', err);
                    // Fallback: navigate normally
                    try { window.location.href = a.getAttribute('href'); } catch (e) {}
                }
            });
        });
    } catch (e) {
        console.warn('[dashboard.js] setupWithdrawLinks failed:', e);
    }
}

// Debug helper removed: raw dashboard data panel disabled

async function loadUserProfile() {
    try {
        const profile = await api.getProfile();
        
        // Update user name in sidebar
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            // Show username explicitly as requested
            el.textContent = profile.username || '';
        });
        
        // Update username displays
        const usernameElements = document.querySelectorAll('.username-display');
        usernameElements.forEach(el => {
            el.textContent = `@${profile.username}`;
        });
        
        // Update avatar initial from username
        const avatarEl = document.querySelector('.user-avatar');
        if (avatarEl) {
            const initial = (profile.username || 'U').charAt(0).toUpperCase();
            avatarEl.textContent = initial;
        }

        // Show Vendor Lounge menu item for subadmins and admins
        const role = (profile.role || '').toLowerCase();
        if (role === 'subadmin' || role === 'admin') {
            const vendorMenuItem = document.getElementById('vendorLoungeMenuItem');
            if (vendorMenuItem) {
                vendorMenuItem.style.display = 'block';
            }
        }
        
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function updateBalanceCards(data) {
    // Handle both old and new data structures
    const balance = data.balance || data || {};

    // Helper: safe number coercion
    const safeNum = (v) => {
        if (v === null || typeof v === 'undefined') return 0;
        if (typeof v === 'number') return v;
        const n = Number(v);
        return Number.isNaN(n) ? 0 : n;
    };
    
    // Coupon bonus display removed by request — do not show coupon bonus on dashboard
    const couponBonus = 0;
    const couponType = null;
    
    // Total Balance (including coupon bonus)
    const totalBalanceEl = document.getElementById('totalBalance');
    if (totalBalanceEl) {
        const baseBalanceRaw = (typeof balance.total !== 'undefined') ? balance.total : (data.total_balance || 0);
        const baseBalance = safeNum(baseBalanceRaw);
        // Standard display (coupon bonuses are not shown)
        const totalBalance = baseBalance;
        totalBalanceEl.textContent = formatCurrency(totalBalance);
    }
    
    // Activity Balance (where coupon bonus would typically go)
    const activityBalanceEl = document.getElementById('activityBalance');
    if (activityBalanceEl) {
            const activityRaw = (typeof balance.activity !== 'undefined') ? balance.activity : (data.activity_balance || 0);
        const activityBalance = safeNum(activityRaw);
        activityBalanceEl.textContent = formatCurrency(activityBalance);
    }
    
    // Referral/Affiliate Balance
    const referralBalanceEl = document.getElementById('referralBalance');
    if (referralBalanceEl) {
    const referralRaw = (typeof balance.affiliate !== 'undefined') ? balance.affiliate : (data.referral_balance || data.affiliate_balance || 0);
    const referralBalance = safeNum(referralRaw);
    referralBalanceEl.textContent = formatCurrency(referralBalance);
    }

    // Modal amounts (if present)
    const modalReferral = document.getElementById('modalReferralAmount');
    if (modalReferral) {
        const referralRaw = (typeof balance.affiliate !== 'undefined') ? balance.affiliate : (data.referral_balance || data.affiliate_balance || 0);
        modalReferral.textContent = formatCurrency(safeNum(referralRaw));
    }
    const modalActivity = document.getElementById('modalActivityAmount');
    if (modalActivity) {
        const activityRaw = (typeof balance.activity !== 'undefined') ? balance.activity : (data.activity_balance || 0);
        modalActivity.textContent = formatCurrency(safeNum(activityRaw));
    }
    
    console.log('[dashboard.js] Balances updated:', balance);
}

function updateStatsCards(data) {
    // Handle both old and new data structures
    const stats = data.stats || data || {};
    const user = data.user || data || {};
    
    // Total Earned
    const totalEarnedEl = document.getElementById('totalEarned');
    if (totalEarnedEl) {
        const totalEarned = stats.totalEarned || data.total_earned || 0;
        totalEarnedEl.textContent = formatCurrency(totalEarned);
    }
    
    // Total Tasks/Articles
    const totalTasksEl = document.getElementById('totalTasks');
    if (totalTasksEl) {
        const completedTasks = stats.completedArticles || data.completed_tasks || data.completed_articles || 0;
        totalTasksEl.textContent = completedTasks;
    }
    
    // Total Referrals
    const totalReferralsEl = document.getElementById('totalReferrals');
    if (totalReferralsEl) {
        // Prefer the structured stats.totalReferrals, fallback to older shapes
        totalReferralsEl.textContent = (stats.totalReferrals ?? data.total_referrals ?? data.totalReferrals) || 0;
    }
    
    // Pending Withdrawals
    const pendingWithdrawalsEl = document.getElementById('pendingWithdrawals');
    if (pendingWithdrawalsEl) {
        pendingWithdrawalsEl.textContent = data.pending_withdrawals || 0;
    }
}

async function loadReferralInfo() {
    try {
        const referralInfo = await api.getReferralInfo();
        
        // Prefer username-based referral links
        let username = null;
        try {
            const profile = await api.getProfile();
            username = profile?.username || null;
        } catch (_) {
            // ignore and fallback
        }
        
        // Referral debug panel removed: debug info hidden in production

        // Update referral link
        const referralLinkEl = document.getElementById('referralLink');
        if (referralLinkEl) {
            const baseUrl = window.location.origin;
            const refValue = username || referralInfo?.referral_code;
            const copyBtn = document.getElementById('copyBtn');

            if (refValue && String(refValue).toLowerCase() !== 'undefined' && String(refValue).toLowerCase() !== 'null') {
                referralLinkEl.value = `${baseUrl}/register.html?ref=${refValue}`;
                if (copyBtn) copyBtn.disabled = false;
            } else {
                referralLinkEl.value = 'Referral link unavailable';
                if (copyBtn) copyBtn.disabled = true;
            }
        }
        
        // Update referral count
        const referralCountEl = document.getElementById('referralCount');
        if (referralCountEl) {
            referralCountEl.textContent = referralInfo?.total_referrals || 0;
        }
        
    } catch (error) {
        console.error('Error loading referral info:', error);
    }
}

// Referral debug panel removed

function setupReferralLinkCopy() {
    // The dashboard HTML uses id="copyBtn" for the copy button
    const copyBtn = document.getElementById('copyBtn');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const referralLinkEl = document.getElementById('referralLink');
        if (!referralLinkEl) return showToast('No referral link available', 'error');

        const value = referralLinkEl.value || referralLinkEl.getAttribute('value') || '';

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(value);
            } else {
                // Fallback for older browsers
                referralLinkEl.select();
                document.execCommand('copy');
            }

            showToast('Referral link copied!', 'success');
        } catch (err) {
            console.error('Failed to copy referral link:', err);
            showToast('Failed to copy referral link', 'error');
        }
    });
}

function setupLogout() {
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                api.logout();
            }
        });
    });
}

function showLoadingState() {
    // Add loading spinners to balance cards
    const balanceElements = document.querySelectorAll('[id$="Balance"]');
    balanceElements.forEach(el => {
        if (el) el.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    });
}

// Auto-refresh dashboard every 30 seconds
setInterval(async () => {
    await loadDashboardData();
}, 30000);
