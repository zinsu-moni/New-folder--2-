// Profile Page Integration

document.addEventListener('DOMContentLoaded', async () => {
    await loadProfileData();
    setupProfileHandlers();
    setupTabSwitching();
});

async function loadProfileData() {
    try {
        const profile = await api.getProfile();
        
        // Account Tab
        document.getElementById('profileUsername').value = profile.username;
        document.getElementById('profileEmail').value = profile.email;
        document.getElementById('profileFullName').value = profile.full_name;
        document.getElementById('profilePhone').value = profile.phone || '';
        
        // Header summary
        const displayName = (profile.full_name && profile.full_name.trim()) ? profile.full_name : profile.username;
        const nameEl = document.getElementById('profileNameText');
        const userEl = document.getElementById('profileUsernameText');
        const avatarEl = document.getElementById('avatarInitial');
        if (nameEl) nameEl.textContent = displayName;
        if (userEl) userEl.textContent = '@' + profile.username;
        if (avatarEl) avatarEl.textContent = (displayName || 'U').trim().charAt(0).toUpperCase();
        
        // Bank Details Tab
        if (profile.bank_details) {
            document.getElementById('bankName').value = profile.bank_details.bank_name || '';
            document.getElementById('accountName').value = profile.bank_details.account_name || '';
            document.getElementById('accountNumber').value = profile.bank_details.account_number || '';
        } else {
            document.getElementById('bankName').value = '';
            document.getElementById('accountName').value = '';
            document.getElementById('accountNumber').value = '';
        }
        
    } catch (error) {
        console.error('Error loading profile:', error);
        if (typeof showToast === 'function') {
            showToast('Failed to load profile data', 'error');
        } else {
            alert('Failed to load profile data');
        }
    }
}

function setupProfileHandlers() {
    // Account Update Form
    const accountForm = document.getElementById('accountForm');
    if (accountForm) {
        accountForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleUpdateAccount();
        });
    }
    
    // Bank Details Form
    const bankForm = document.getElementById('bankForm');
    if (bankForm) {
        bankForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleUpdateBankDetails();
        });
    }
    
    // Password Change Form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleChangePassword();
        });
    }
}

async function handleUpdateAccount() {
    const email = document.getElementById('profileEmail').value.trim();
    const fullName = document.getElementById('profileFullName').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();
    const submitBtn = document.querySelector('#accountForm button[type="submit"]');
    const btnText = submitBtn.textContent;
    
    if (!email || !fullName) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    
    try {
        await api.updateProfile({
            email,
            full_name: fullName,
            phone: phone || null
        });
        
        showToast('Profile updated successfully!', 'success');
        await loadProfileData();
        
    } catch (error) {
        showToast(error.message || 'Failed to update profile', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = btnText;
    }
}

async function handleUpdateBankDetails() {
    const bankName = document.getElementById('bankName').value.trim();
    const accountName = document.getElementById('accountName').value.trim();
    const accountNumber = document.getElementById('accountNumber').value.trim();
    const submitBtn = document.querySelector('#bankForm button[type="submit"]');
    const btnText = submitBtn.textContent;
    
    if (!bankName || !accountName || !accountNumber) {
        showToast('Please fill in all bank details', 'error');
        return;
    }
    
    if (accountNumber.length !== 10 || !/^\d+$/.test(accountNumber)) {
        showToast('Account number must be exactly 10 digits', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    
    try {
        await api.updateBankDetails({
            bank_name: bankName,
            account_name: accountName,
            account_number: accountNumber
        });
        
        showToast('Bank details updated successfully!', 'success');
        
    } catch (error) {
        showToast(error.message || 'Failed to update bank details', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = btnText;
    }
}

async function handleChangePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    const submitBtn = document.querySelector('#passwordForm button[type="submit"]');
    const btnText = submitBtn.textContent;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Please fill in all password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Changing...';
    
    try {
        await api.changePassword(currentPassword, newPassword);
        
        showToast('Password changed successfully!', 'success');
        
        // Clear form
        document.getElementById('passwordForm').reset();
        
    } catch (error) {
        showToast(error.message || 'Failed to change password', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = btnText;
    }
}

function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${targetTab}Tab`).classList.add('active');
        });
    });
}
