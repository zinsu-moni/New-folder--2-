// Dashboard Page Integration

let dashboardData = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Load dashboard data
    await loadDashboardData();
    
    // Load user profile
    await loadUserProfile();
    
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
    // Total Balance
    const totalBalanceEl = document.getElementById('totalBalance');
    if (totalBalanceEl) {
        totalBalanceEl.textContent = formatCurrency(data.total_balance || 0);
    }
    
    // Activity Balance
    const activityBalanceEl = document.getElementById('activityBalance');
    if (activityBalanceEl) {
        activityBalanceEl.textContent = formatCurrency(data.activity_balance || 0);
    }
    
    // Referral Balance
    const referralBalanceEl = document.getElementById('referralBalance');
    if (referralBalanceEl) {
        referralBalanceEl.textContent = formatCurrency(data.referral_balance || 0);
    }

    // Modal amounts (if present)
    const modalReferral = document.getElementById('modalReferralAmount');
    if (modalReferral) {
        modalReferral.textContent = formatCurrency(data.referral_balance || 0);
    }
    const modalActivity = document.getElementById('modalActivityAmount');
    if (modalActivity) {
        modalActivity.textContent = formatCurrency(data.activity_balance || 0);
    }
}

function updateStatsCards(data) {
    // Total Earned
    const totalEarnedEl = document.getElementById('totalEarned');
    if (totalEarnedEl) {
        totalEarnedEl.textContent = formatCurrency(data.total_earned || 0);
    }
    
    // Total Tasks
    const totalTasksEl = document.getElementById('totalTasks');
    if (totalTasksEl) {
        totalTasksEl.textContent = data.completed_tasks || 0;
    }
    
    // Total Referrals
    const totalReferralsEl = document.getElementById('totalReferrals');
    if (totalReferralsEl) {
        totalReferralsEl.textContent = data.total_referrals || 0;
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
        
        // Update referral link
        const referralLinkEl = document.getElementById('referralLink');
        if (referralLinkEl) {
            const baseUrl = window.location.origin;
            const refValue = username || referralInfo.referral_code;
            referralLinkEl.value = `${baseUrl}/register.html?ref=${refValue}`;
        }
        
        // Update referral count
        const referralCountEl = document.getElementById('referralCount');
        if (referralCountEl) {
            referralCountEl.textContent = referralInfo.total_referrals;
        }
        
    } catch (error) {
        console.error('Error loading referral info:', error);
    }
}

function setupReferralLinkCopy() {
    const copyBtn = document.getElementById('copyReferralLink');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const referralLinkEl = document.getElementById('referralLink');
            if (referralLinkEl) {
                referralLinkEl.select();
                document.execCommand('copy');
                showToast('Referral link copied!', 'success');
            }
        });
    }
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
