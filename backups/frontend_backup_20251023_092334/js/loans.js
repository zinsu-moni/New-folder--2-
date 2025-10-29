// Loans Page Integration

document.addEventListener('DOMContentLoaded', async () => {
    await loadLoanHistory();
    setupLoanForm();
});

async function loadLoanHistory() {
    try {
        const loans = await api.getLoans(0, 20);
        renderLoanHistory(loans);
    } catch (error) {
        console.error('Error loading loan history:', error);
    }
}

function renderLoanHistory(loans) {
    const historyContainer = document.getElementById('loanHistory');
    if (!historyContainer) return;
    
    if (loans.length === 0) {
        historyContainer.innerHTML = `
            <div class="no-data">
                <i class="fas fa-hand-holding-usd" style="font-size: 48px; color: var(--gray); margin-bottom: 15px;"></i>
                <p>No loan history yet</p>
            </div>
        `;
        return;
    }
    
    historyContainer.innerHTML = loans.map(loan => `
        <div class="loan-item">
            <div class="loan-info">
                <div class="loan-amount">₦${loan.amount.toFixed(2)}</div>
                <div class="loan-details">
                    <span>${loan.duration_months} months</span>
                    <span>Interest: ${loan.interest_rate}%</span>
                    <span>Total: ₦${loan.total_amount.toFixed(2)}</span>
                </div>
                <div class="loan-date">${formatDate(loan.created_at)}</div>
            </div>
            <div class="loan-status status-${loan.status}">
                ${getLoanStatusIcon(loan.status)} ${loan.status}
            </div>
        </div>
    `).join('');
}

function getLoanStatusIcon(status) {
    switch (status) {
        case 'pending': return '<i class="fas fa-clock"></i>';
        case 'approved': return '<i class="fas fa-check-circle"></i>';
        case 'rejected': return '<i class="fas fa-times-circle"></i>';
        case 'repaid': return '<i class="fas fa-check-double"></i>';
        default: return '';
    }
}

function setupLoanForm() {
    const loanForm = document.getElementById('loanForm');
    if (loanForm) {
        loanForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleLoanApplication();
        });
    }
    
    // Calculate total amount on input change
    const amountInput = document.getElementById('loanAmount');
    const durationInput = document.getElementById('loanDuration');
    
    if (amountInput && durationInput) {
        [amountInput, durationInput].forEach(input => {
            input.addEventListener('input', updateLoanCalculation);
        });
    }
}

function updateLoanCalculation() {
    const amount = parseFloat(document.getElementById('loanAmount').value) || 0;
    const duration = parseInt(document.getElementById('loanDuration').value) || 0;
    const interestRate = 5; // 5% interest
    
    const interest = (amount * interestRate) / 100;
    const total = amount + interest;
    
    const calculationEl = document.getElementById('loanCalculation');
    if (calculationEl && amount > 0 && duration > 0) {
        calculationEl.innerHTML = `
            <div style="padding: 15px; background: rgba(37, 99, 235, 0.1); border-radius: 10px; margin-top: 15px;">
                <p><strong>Loan Amount:</strong> ₦${amount.toFixed(2)}</p>
                <p><strong>Interest (5%):</strong> ₦${interest.toFixed(2)}</p>
                <p><strong>Total Repayment:</strong> ₦${total.toFixed(2)}</p>
                <p><strong>Duration:</strong> ${duration} month${duration > 1 ? 's' : ''}</p>
            </div>
        `;
    } else {
        calculationEl.innerHTML = '';
    }
}

async function handleLoanApplication() {
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const duration = parseInt(document.getElementById('loanDuration').value);
    const purpose = document.getElementById('loanPurpose').value.trim();
    const submitBtn = document.querySelector('#loanForm button[type="submit"]');
    const btnText = submitBtn.textContent;
    
    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    
    if (!duration || duration < 1 || duration > 12) {
        showToast('Duration must be between 1 and 12 months', 'error');
        return;
    }
    
    if (!purpose) {
        showToast('Please specify the loan purpose', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    
    try {
        await api.applyForLoan(amount, duration, purpose);
        
        showToast('Loan application submitted successfully!', 'success');
        
        // Reset form
        document.getElementById('loanForm').reset();
        document.getElementById('loanCalculation').innerHTML = '';
        
        // Reload history
        await loadLoanHistory();
        
    } catch (error) {
        showToast(error.message || 'Failed to submit loan application', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = btnText;
    }
}
