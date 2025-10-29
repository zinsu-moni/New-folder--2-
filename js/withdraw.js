// Withdrawal Page Integration

document.addEventListener('DOMContentLoaded', async () => {
    // Ensure user has bank details before allowing withdrawals
    try {
        const profile = await api.getProfile();
        if (!profile || !profile.bank_details || !profile.bank_details.account_number) {
            showToast('Please add your bank details before requesting withdrawals. Redirecting to profile...', 'warning');
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 900);
            return;
        }
    } catch (err) {
        console.warn('[withdraw.js] Failed to fetch profile for bank check:', err);
        // If profile fetch fails, fall back to loading balances — backend will still reject if bank missing
    }

    await loadBalances();
    await loadWithdrawalHistory();
    setupWithdrawalForm();
    setupBalanceDropdown();
});

async function loadBalances() {
    try {
        const dashboardData = await api.getDashboardStats();
        console.log('[withdraw.js] Dashboard data received:', dashboardData);
        
        // Extract balance data from the new structure
        const balance = dashboardData.balance || {};
        
        // For backward compatibility, check both new and old structures
        const activityBalance = balance.activity || dashboardData.activity_balance || 0;
        const referralBalance = balance.affiliate || dashboardData.referral_balance || 0;
        const totalBalance = balance.total || dashboardData.total_balance || 0;
        
        // Store balances globally for dropdown handler
        window.userBalances = {
            activity: activityBalance,
            referral: referralBalance,
            total: totalBalance
        };
        
        console.log('[withdraw.js] Extracted balances:', window.userBalances);
        
        // Update balance in dropdown options
        const balanceTypeSelect = document.getElementById('balanceType');
        if (balanceTypeSelect) {
            balanceTypeSelect.innerHTML = `
                <option value="activity">Activity Balance (Tasks & Streaming) - ₦${activityBalance.toFixed(2)}</option>
                <option value="referral">Affiliate Balance (Referral Income) - ₦${referralBalance.toFixed(2)}</option>
                <option value="total">Total Balance - ₦${totalBalance.toFixed(2)}</option>
            `;
            
            // Set initial balance display
            const balanceAmount = document.getElementById('balanceAmount');
            if (balanceAmount) {
                balanceAmount.textContent = formatCurrency(activityBalance);
            }
        }
        
        // Update wallet select if it exists
        const walletSelect = document.getElementById('wallet');
        if (walletSelect) {
            walletSelect.innerHTML = `
                <option value="" selected disabled>Select balance</option>
                <option value="activity">Activity Balance (Tasks & Streaming) ₦${activityBalance.toFixed(2)}</option>
                <option value="referral">Affiliate Balance (Referral Income) ₦${referralBalance.toFixed(2)}</option>
            `;
        }
        
        // Display balances
        const activityBalanceEl = document.getElementById('displayActivityBalance');
        const referralBalanceEl = document.getElementById('displayReferralBalance');
        const totalBalanceEl = document.getElementById('displayTotalBalance');
        
        if (activityBalanceEl) activityBalanceEl.textContent = formatCurrency(activityBalance);
        if (referralBalanceEl) referralBalanceEl.textContent = formatCurrency(referralBalance);
        if (totalBalanceEl) totalBalanceEl.textContent = formatCurrency(totalBalance);
        
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

    if (!Array.isArray(withdrawals) || withdrawals.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>No withdrawal history found</p>
            </div>
        `;
        return;
    }

    historyContainer.innerHTML = withdrawals.map(w => `
        <div class="withdrawal-item" style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.04);">
            <div>
                <div style="font-weight:700;color:var(--primary-color);">₦${(w.amount||0).toFixed(2)}</div>
                <div style="font-size:13px;color:var(--gray);">${w.balance_type || '-'} • ${formatDate(w.created_at)}</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
                <div style="font-weight:600;color:var(--gray);text-transform:capitalize;">${w.status}</div>
                <button class="view-receipt-btn btn-primary" data-id="${w.id}" style="padding:8px 12px;border-radius:8px;">View</button>
            </div>
        </div>
    `).join('');

    // Attach click handlers for view buttons
    const viewButtons = historyContainer.querySelectorAll('.view-receipt-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            const match = withdrawals.find(x => String(x.id) === String(id));
            if (match) {
                showReceipt(match);
                return;
            }

            // Fallback: try fetching a single withdrawal if API provides it
            try {
                const specific = await api.get(`/withdrawals/${id}`);
                showReceipt(specific);
            } catch (err) {
                showToast('Could not load receipt details', 'error');
            }
        });
    });
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
    // Support form id used in withdraw.html (#withdrawForm)
    const withdrawalForm = document.getElementById('withdrawForm') || document.getElementById('withdrawalForm');
    if (withdrawalForm) {
        withdrawalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleWithdrawal();
        });
    }
}

async function handleWithdrawal() {
    // Support input ids used in withdraw.html
    const amountEl = document.getElementById('amount') || document.getElementById('withdrawalAmount');
    const walletEl = document.getElementById('wallet') || document.getElementById('balanceType');
    const amount = parseFloat(amountEl ? amountEl.value : 0);
    const balanceType = walletEl ? walletEl.value : (document.getElementById('balanceType')?.value || 'activity');
    const submitBtn = document.querySelector('#withdrawForm button[type="submit"]') || document.querySelector('#withdrawalForm button[type="submit"]');
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
        const resp = await api.createWithdrawal(amount, balanceType);

        showToast('Withdrawal request submitted successfully!', 'success');

        // Show receipt modal using response (if available)
        try { if (resp) showReceipt(resp); } catch (e) { console.warn('Receipt display failed', e); }

        // Reset form
        const formEl = document.getElementById('withdrawForm') || document.getElementById('withdrawalForm');
        if (formEl) formEl.reset();

        // Reload data
        await loadBalances();
        await loadWithdrawalHistory();

        // Refresh dashboard if function exists
        if (typeof loadDashboardData === 'function') loadDashboardData();

    } catch (error) {
        showToast(error.message || 'Failed to process withdrawal', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = btnText;
    }
}

// Show a receipt modal with withdrawal details
function showReceipt(withdrawal) {
    const modal = document.getElementById('withdrawReceiptModal');
    if (!modal) return;

    const ref = withdrawal.reference || withdrawal.id || ('ref-' + Date.now());
    document.getElementById('receiptRef').textContent = ref;
    document.getElementById('receiptAmount').textContent = formatCurrency(withdrawal.amount || 0);
    document.getElementById('receiptBalanceType').textContent = (withdrawal.balance_type || withdrawal.balanceType || '-');
    document.getElementById('receiptStatus').textContent = (withdrawal.status || 'pending');
    document.getElementById('receiptRequestedAt').textContent = formatDate(withdrawal.created_at || new Date().toISOString());

    (async () => {
        try {
            const profile = await api.getProfile();
            const bank = profile?.bank_details || {};
            document.getElementById('receiptBank').textContent = bank.bank_name || 'Not provided';
            document.getElementById('receiptAccountName').textContent = bank.account_name || 'Not provided';
            document.getElementById('receiptAccountNumber').textContent = bank.account_number || 'Not provided';
        } catch (err) {
            console.warn('Could not fetch profile for receipt bank info:', err);
        }
    })();

    modal.style.display = 'flex';

    const close = () => { modal.style.display = 'none'; };
    const closeBtn = document.getElementById('closeReceiptBtn');
    const closePrimary = document.getElementById('closeReceiptPrimary');
    if (closeBtn) closeBtn.onclick = close;
    if (closePrimary) closePrimary.onclick = close;

        const downloadBtn = document.getElementById('downloadReceiptBtn');
        if (downloadBtn) {
                downloadBtn.onclick = () => {
                        // Build printable HTML with inline styles to look like a bank receipt
                        const printable = `
                                <!doctype html>
                                <html>
                                <head>
                                    <meta charset="utf-8">
                                    <title>Withdrawal Receipt - ${ref}</title>
                                    <style>
                                        body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:24px}
                                        .receipt{max-width:680px;margin:0 auto;border:1px solid #e6e9ef;padding:18px;border-radius:6px}
                                        .header{display:flex;align-items:center;justify-content:space-between}
                                        .brand{display:flex;gap:12px;align-items:center}
                                        .badge{width:48px;height:48px;background:#2563eb;color:#fff;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800}
                                        h1{font-size:18px;margin:0;color:#111}
                                        .muted{color:#6b7280;font-size:13px}
                                        table{width:100%;margin-top:16px;border-collapse:collapse}
                                        td{padding:8px 6px;border-bottom:1px dashed #eef2f7}
                                        .label{color:#6b7280;width:38%}
                                        .value{font-weight:700}
                                        .benef{background:#fbfdff;padding:10px;border-radius:6px;margin-left:6px}
                                        .footer{margin-top:18px;text-align:center;color:#6b7280;font-size:13px}
                                        @media print{body{margin:0} .receipt{border:none}}
                                    </style>
                                </head>
                                <body>
                                    <div class="receipt">
                                        <div class="header">
                                            <div class="brand"><div class="badge">A</div><div><h1>Affluence</h1><div class="muted">Withdrawal Receipt</div></div></div>
                                            <div style="text-align:right"><div class="muted">${new Date().toLocaleString()}</div></div>
                                        </div>

                                        <table>
                                            <tr><td class="label">Reference</td><td class="value">${escapeHtml(ref)}</td></tr>
                                            <tr><td class="label">Amount</td><td class="value">${escapeHtml(formatCurrency(withdrawal.amount || 0))}</td></tr>
                                            <tr><td class="label">Balance Type</td><td class="value">${escapeHtml(withdrawal.balance_type || '-')}</td></tr>
                                            <tr><td class="label">Status</td><td class="value">${escapeHtml(withdrawal.status || 'pending')}</td></tr>
                                            <tr><td class="label">Requested At</td><td class="value">${escapeHtml(formatDate(withdrawal.created_at || new Date().toISOString()))}</td></tr>
                                        </table>

                                        <div style="display:flex;gap:12px;margin-top:14px;align-items:flex-start">
                                            <div style="flex:1">
                                                <div class="muted">Beneficiary</div>
                                                <div class="benef">
                                                    <div style="font-weight:700">${escapeHtml(document.getElementById('receiptAccountName')?.textContent || '-')}</div>
                                                    <div class="muted">${escapeHtml(document.getElementById('receiptAccountNumber')?.textContent || '-')}</div>
                                                    <div class="muted">${escapeHtml(document.getElementById('receiptBank')?.textContent || '-')}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="footer">Affluence • Keep this receipt for your records.</div>
                                    </div>
                                </body>
                                </html>
                        `;

                        const w = window.open('', '_blank', 'width=900,height=800');
                        if (!w) return showToast('Popup blocked. Please allow popups to download receipt.', 'warning');
                        w.document.open();
                        w.document.write(printable);
                        w.document.close();
                        w.focus();
                        // Give the window a moment to render before printing to improve layout reliability
                        setTimeout(() => w.print(), 300);
                };
        }
}

// Helper function to format currency
function formatCurrency(amount) {
    return `₦${parseFloat(amount).toFixed(2)}`;
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Basic HTML escape to be safe when injecting into printable receipt
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Function to show toast messages
function showToast(message, type = 'info') {
    // Check if toast container exists
    let toastContainer = document.querySelector('.toast-container');
    
    // Create toast container if it doesn't exist
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="toast-icon fas ${getToastIcon(type)}"></i>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
        toast.classList.add('toast-hiding');
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300); // Match the CSS transition time
    }, 5000);
    
    // Close button functionality
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.add('toast-hiding');
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    });
}

// Helper function to get toast icon based on type
function getToastIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-times-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}
