// Bonus Tracker - Helps track and display coupon bonuses
// This script will help identify and track bonuses from coupons

// Store information about the user's coupon and bonus
let userCouponInfo = {
    appliedCoupon: null,
    couponType: null,
    bonusAmount: 0,
    bonusApplied: false,
    timestamp: null
};

// Function to check for stored coupon bonus information
function checkStoredCouponBonus() {
    try {
        const storedInfo = localStorage.getItem('affluence_coupon_bonus');
        if (storedInfo) {
            userCouponInfo = JSON.parse(storedInfo);
            console.log('Found stored coupon info:', userCouponInfo);
            return true;
        }
    } catch (e) {
        console.error('Error reading stored coupon data:', e);
    }
    return false;
}

// Function to save coupon bonus information
function saveCouponBonus(couponCode, couponType) {
    try {
        // Determine bonus amount based on coupon type
        let bonusAmount = 0;
        if (couponType === 'mega') {
            bonusAmount = 500;
        } else if (couponType === 'alpha') {
            bonusAmount = 2000;
        }

        userCouponInfo = {
            appliedCoupon: couponCode,
            couponType: couponType,
            bonusAmount: bonusAmount,
            bonusApplied: false,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('affluence_coupon_bonus', JSON.stringify(userCouponInfo));
        console.log('Saved coupon bonus information:', userCouponInfo);
    } catch (e) {
        console.error('Error saving coupon data:', e);
    }
}

// Function to mark bonus as applied
function markBonusAsApplied() {
    try {
        if (userCouponInfo.appliedCoupon) {
            userCouponInfo.bonusApplied = true;
            localStorage.setItem('affluence_coupon_bonus', JSON.stringify(userCouponInfo));
            console.log('Marked bonus as applied');
        }
    } catch (e) {
        console.error('Error marking bonus as applied:', e);
    }
}

// Function to display bonus information on dashboard
function displayBonusInfo() {
    if (!userCouponInfo.appliedCoupon) {
        return;
    }

    // If the current page was accessed via a referral link (e.g. ?ref=someone)
    // do not show coupon bonus UI — the user came via referral and we shouldn't
    // surface coupon banners in that flow.
    try {
        if (window.location && window.location.search && window.location.search.indexOf('ref=') !== -1) {
            console.log('Referral parameter detected in URL — suppressing coupon bonus display');
            return;
        }
    } catch (e) {
        // ignore and continue if any issue reading location
    }

    // Also do not show coupon banners on the main user dashboard page.
    try {
        const path = (window.location && window.location.pathname) ? window.location.pathname.toLowerCase() : '';
        const isDashboardPage = path === '/' || path.indexOf('index.html') !== -1 || path.indexOf('dashboard') !== -1;
        if (isDashboardPage) {
            console.log('Dashboard page detected — suppressing coupon bonus display on dashboard');
            // Remove any existing bonus area if present
            const existing = document.getElementById('coupon-bonus-area');
            if (existing) existing.remove();
            return;
        }
    } catch (e) {
        console.warn('Error checking dashboard path for bonus suppression:', e);
    }

    // Check if we're on a dashboard-type page
    const isDashboardPage = window.location.pathname.includes('dashboard') || 
                          window.location.pathname === '/' || 
                          window.location.pathname === '/index.html';

    if (!isDashboardPage) {
        return;
    }
    
    // ENHANCE BALANCE DISPLAY: Add bonus to balance card section
    enhanceBalanceWithBonus();
    
    // Create notification banner
    createBonusBanner();
}

// Function to add bonus display directly to balance card
function enhanceBalanceWithBonus() {
    // Find the balance card
    const balanceCard = document.querySelector('.balance-card');
    if (!balanceCard) return;
    
    // Check if we already added the bonus display
    if (document.getElementById('bonus-display')) return;
    
    // Create bonus display
    const bonusDisplay = document.createElement('div');
    bonusDisplay.id = 'bonus-display';
    bonusDisplay.className = 'bonus-display';
    bonusDisplay.style.cssText = `
        background: linear-gradient(135deg, #4ade80, #10b981);
        color: white;
        padding: 8px 15px;
        border-radius: 8px;
        font-weight: 500;
        margin-top: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        animation: pulseGlow 2s infinite;
    `;
    
    bonusDisplay.innerHTML = `
        <div>
            <i class="fas fa-gift" style="margin-right: 8px;"></i>
            <strong>Coupon Bonus: ₦${userCouponInfo.bonusAmount.toLocaleString()}</strong>
        </div>
        <div style="font-size: 0.85rem; opacity: 0.9;">
            ${userCouponInfo.couponType.toUpperCase()} coupon
        </div>
    `;
    
    // Add to balance card (after the balance amount)
    const balanceAmount = balanceCard.querySelector('.balance-amount');
    if (balanceAmount) {
        balanceAmount.insertAdjacentElement('afterend', bonusDisplay);
    } else {
        balanceCard.appendChild(bonusDisplay);
    }
    
    // Add animation for the bonus display
    if (!document.getElementById('bonus-animations')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'bonus-animations';
        styleEl.textContent = `
            @keyframes pulseGlow {
                0% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
                50% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.8); }
                100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(styleEl);
    }
}

// Function to create the bonus notification banner
function createBonusBanner() {
    // Create or find the bonus notification area
    let bonusArea = document.getElementById('coupon-bonus-area');
    if (!bonusArea) {
        const mainContent = document.querySelector('.main-content') || document.querySelector('main');
        if (!mainContent) return;

        bonusArea = document.createElement('div');
        bonusArea.id = 'coupon-bonus-area';
        bonusArea.className = 'bonus-notification';
        bonusArea.style.cssText = `
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 12px;
            background: linear-gradient(135deg, #4ade80, #10b981);
            color: white;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
            font-weight: 500;
            animation: fadeIn 0.6s ease-out;
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;

        // Insert at the top of the main content
        mainContent.insertBefore(bonusArea, mainContent.firstChild);
    }

    // Update the bonus area content
    bonusArea.innerHTML = `
        <div>
            <i class="fas fa-gift" style="margin-right: 8px;"></i>
            <strong>Coupon Bonus: ₦${userCouponInfo.bonusAmount.toLocaleString()}</strong>
            <span style="margin-left: 8px;">from ${userCouponInfo.couponType.toUpperCase()} coupon</span>
        </div>
        <button id="dismiss-bonus-btn" style="background: white; color: #10b981; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">
            Dismiss
        </button>
    `;

    // Add dismiss button handler
    document.getElementById('dismiss-bonus-btn').addEventListener('click', function() {
        markBonusAsApplied();
        bonusArea.style.animation = 'fadeOut 0.6s ease-out forwards';
        setTimeout(() => {
            bonusArea.remove();
        }, 600);
    });

    // Add animation styles if not already present
    if (!document.getElementById('bonus-animations')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'bonus-animations';
        styleEl.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(styleEl);
    }
}

// Main initialization function
function initBonusTracker() {
    console.log('Initializing bonus tracker...');
    
    // Check for stored bonus information
    const hasStoredBonus = checkStoredCouponBonus();
    
    // If we're on the register page, hook into the registration process
    if (window.location.pathname.includes('register')) {
        console.log('On register page, setting up coupon bonus tracking');
        
        // Wait for registration form to be ready
        const formCheckInterval = setInterval(() => {
            const form = document.getElementById('registerForm');
            if (form) {
                clearInterval(formCheckInterval);
                
                // Add a hook to the registration form submission
                const originalSubmit = form.onsubmit;
                form.onsubmit = function(e) {
                    const couponCode = document.getElementById('couponCode')?.value.trim();
                    const couponType = document.getElementById('couponType')?.value.trim();
                    
                    if (couponCode && couponType) {
                        console.log('Saving coupon information for tracking:', couponType, couponCode);
                        saveCouponBonus(couponCode, couponType);
                    }
                    
                    // Call original handler if it exists
                    if (typeof originalSubmit === 'function') {
                        return originalSubmit.call(this, e);
                    }
                };
            }
        }, 500);
    } 
    // Otherwise, if we have bonus info, display it
    else if (hasStoredBonus && !userCouponInfo.bonusApplied) {
        // Wait for page to be fully loaded
        if (document.readyState === 'complete') {
            displayBonusInfo();
        } else {
            window.addEventListener('load', displayBonusInfo);
        }
    }
}

// Start the bonus tracker when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBonusTracker);
} else {
    initBonusTracker();
}