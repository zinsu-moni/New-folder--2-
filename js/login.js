// Login Page Integration

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const btnText = submitBtn.textContent;
            
            // Validation
            if (!username || !password) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            
            try {
                // Make sure API is available
                if (!window.api) {
                    console.error('Global API instance not found');
                    throw new Error('Login service is unavailable. Please refresh the page and try again.');
                }
                
                // Call login API
                await window.api.login(username, password);
                
                // Show success message
                showToast('Login successful! Redirecting...', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1000);
                
            } catch (error) {
                console.error('Login error:', error);
                
                // Handle different types of errors
                let errorMessage = 'Login failed. Please try again.';
                
                if (error.data && error.data.detail) {
                    errorMessage = error.data.detail;
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                // Special handling for common errors
                if (errorMessage.toLowerCase().includes('not found')) {
                    errorMessage = 'Account not found. Please check your username/email.';
                } else if (errorMessage.toLowerCase().includes('password') || 
                           errorMessage.toLowerCase().includes('credentials')) {
                    errorMessage = 'Invalid password. Please try again.';
                }
                
                // Show error message
                showToast(errorMessage, 'error');
                
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.textContent = btnText;
            }
        });
    }
    
    // Password visibility toggle
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            const icon = togglePassword.querySelector('i');
            
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
    }
});
