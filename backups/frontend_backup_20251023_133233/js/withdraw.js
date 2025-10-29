// Withdrawal Page Integration

document.addEventListener('DOMContentLoaded', async () => {
    await loadBalances();
    await loadWithdrawalHistory();
    setupWithdrawalForm();
    setupBalanceDropdown();
});

async function loadBalances() {
    try {
        const stats = await api.getDashboardStats();
        
        // Store balances globally for dropdown handler
        window.userBalances = {
            activity: stats.activity_balance,
            referral: stats.referral_balance,
            total: stats.total_balance
        };
        
        // Update balance in dropdown options
        const balanceTypeSelect = document.getElementById('balanceType');
        if (balanceTypeSelect) {
            balanceTypeSelect.innerHTML = `
                <option value="activity">Activity Balance (Tasks & Streaming) - ₦${stats.activity_balance.toFixed(2)}</option>
                <option value="referral">Affiliate Balance (Referral Income) - ₦${stats.referral_balance.toFixed(2)}</option>
                <option value="total">Total Balance - ₦${stats.total_balance.toFixed(2)}</option>
            `;
            
            // Set initial balance display
            const balanceAmount = document.getElementById('balanceAmount');
            if (balanceAmount) {
                balanceAmount.textContent = formatCurrency(stats.activity_balance);
            }
        }
        
        // Update wallet select if it exists
        const walletSelect = document.getElementById('wallet');
        if (walletSelect) {
            walletSelect.innerHTML = `
                <option value="" selected disabled>Select balance</option>
                <option value="activity">Activity Balance (Tasks & Streaming) ₦${stats.activity_balance.toFixed(2)}</option>
                <option value="referral">Affiliate Balance (Referral Income) ₦${stats.referral_balance.toFixed(2)}</option>
            `;
        }
        
        // Display balances
        const activityBalanceEl = document.getElementById('displayActivityBalance');
        const referralBalanceEl = document.getElementById('displayReferralBalance');
        const totalBalanceEl = document.getElementById('displayTotalBalance');
        
        if (activityBalanceEl) activityBalanceEl.textContent = formatCurrency(stats.activity_balance);
        if (referralBalanceEl) referralBalanceEl.textContent = formatCurrency(stats.referral_balance);
        if (totalBalanceEl) totalBalanceEl.textContent = formatCurrency(stats.total_balance);
        
    } catch (error) {
        console.error('Error loading balances:', error);
    }
}

function setupBalanceDropdown() {
    const balanceTypeSelect = document.getElementById('balanceType');
    const balanceAmount = document.getElementById('balanceAmount');
    const walletSelect = document.getElementById('wallet');
    
    if (balanceTypeSelect && balanceAmount) {
        balanceTypeSelect.addEventListener('change', function() {
            const balanceType = this.value;
            
            if (window.userBalances) {
                const amount = window.userBalances[balanceType] || 0;
                balanceAmount.textContent = formatCurrency(amount);
                
                // Auto-select in wallet dropdown if not "total"
                if (walletSelect && balanceType !== 'total') {
                    walletSelect.value = balanceType;
                }
            }
        });
    }
}

async function loadWithdrawalHistory() {
    try {
        const withdrawals = await api.getWithdrawals(0, 20);
        renderWithdrawalHistory(withdrawals);
    } catch (error) {
        console.error('Error loading withdrawal history:', error);
    }
}

function renderWithdrawalHistory(withdrawals) {
    const historyContainer = document.getElementById('withdrawalHistory');
    if (!historyContainer) return;
    
    if (withdrawals.length === 0) {
        historyContainer.innerHTML = `
            <div class="no-data">
                <i class="fas fa-inbox" style="font-size: 48px; color: var(--gray); margin-bottom: 15px;"></i>
                <p>No withdrawal history yet</p>
            </div>
        `;
        return;
    }
    
    historyContainer.innerHTML = withdrawals.map(w => `
        <div class="withdrawal-item">
            <div class="withdrawal-info">
                <div class="withdrawal-amount">₦${w.amount.toFixed(2)}</div>
                <div class="withdrawal-type">${w.balance_type} balance</div>
                <div class="withdrawal-date">${formatDate(w.created_at)}</div>
            </div>
            <div class="withdrawal-status status-${w.status}">
                ${getStatusIcon(w.status)} ${w.status}
            </div>
        </div>
    `).join('');
}

function getStatusIcon(status) {
    switch (status) {
        case 'pending': return '<i class="fas fa-clock"></i>';
        case 'approved': return '<i class="fas fa-check-circle"></i>';
        case 'rejected': return '<i class="fas fa-times-circle"></i>';
        default: return '';
    }
}

function setupWithdrawalForm() {
    const withdrawalForm = document.getElementById('withdrawalForm');
    if (withdrawalForm) {
        withdrawalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleWithdrawal();
        });
    }
}

async function handleWithdrawal() {
    const amount = parseFloat(document.getElementById('withdrawalAmount').value);
    const balanceType = document.getElementById('balanceType').value;
    const submitBtn = document.querySelector('#withdrawalForm button[type="submit"]');
    const btnText = submitBtn.textContent;
    
    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    
    if (amount < 1000) {
        showToast('Minimum withdrawal amount is ₦1,000', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
        await api.createWithdrawal(amount, balanceType);
        
        showToast('Withdrawal request submitted successfully!', 'success');
        
        // Reset form
        document.getElementById('withdrawalForm').reset();
        
        // Reload data
        await loadBalances();
        await loadWithdrawalHistory();
        
        // Refresh dashboard if function exists
        if (typeof loadDashboardData === 'function') {
            loadDashboardData();
        }
        
    } catch (error) {
        showToast(error.message || 'Failed to process withdrawal', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = btnText;
    }
}
