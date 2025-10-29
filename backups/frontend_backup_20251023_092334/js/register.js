// Register Page Integration

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    
    // Pre-fill referral from URL parameter (?ref=<username or code>)
    try {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        const refInput = document.getElementById('referralCode');
        if (ref && refInput) {
            refInput.value = ref;
        }
    } catch (_) {}
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const fullName = document.getElementById('fullName').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const referralCode = document.getElementById('referralCode')?.value.trim() || null;
            const couponType = document.getElementById('couponType')?.value.trim() || null;
            const couponCode = document.getElementById('couponCode')?.value.trim() || null;
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const btnText = submitBtn.textContent;
            
            // Validation
            if (!username || !email || !fullName || !password) {
                showToast('Please fill in all required fields', 'error');
                return;
            }

            if (!couponType) {
                showToast('Please select a coupon type', 'error');
                return;
            }

            if (!couponCode) {
                showToast('Coupon code is required for registration', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            
            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
            
            try {
                // Prepare registration data
                const userData = {
                    username,
                    email,
                    full_name: fullName,
                    password,
                    phone: phone || null,
                    referral_code: referralCode,
                    coupon_code: couponCode,
                };
                
                // Call registration API
                await api.register(userData);
                
                // Show success message
                showToast('Registration successful! Please login.', 'success');
                
                // Redirect to login page
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1500);
                
            } catch (error) {
                // Show error message
                showToast(error.message || 'Registration failed. Please try again.', 'error');
                
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.textContent = btnText;
            }
        });
    }
    
    // Password visibility toggles
    const togglePasswordElements = document.querySelectorAll('.toggle-password');
    togglePasswordElements.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const inputId = toggle.dataset.target;
            const passwordInput = document.getElementById(inputId);
            const icon = toggle.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            const strength = calculatePasswordStrength(password);
            updatePasswordStrengthIndicator(strength);
        });
    }
});

function calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
}

function updatePasswordStrengthIndicator(strength) {
    // You can add a strength indicator UI here
    // For now, just log it
    const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    console.log('Password strength:', strengthLevels[strength] || 'Very Weak');
}
