<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Affluence</title>
    <!-- Default API base for this frontend (points to deployed backend) -->
    <meta name="api-base" content="https://affluence-backends-noae.vercel.app/api">
    <link rel="icon" type="image/png" href="favicon.png">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-primary: #f7f8fa;
            --bg-secondary: #ffffff;
            --text-primary: #222222;
            --text-secondary: #666666;
            --accent-color: #2563eb;
            --accent-hover: #1d4ed8;
            --border-color: #e5e7eb;
            --shadow: rgba(0, 0, 0, 0.1);
        }

        [data-theme="dark"] {
            --bg-primary: #1a1a1a;
            --bg-secondary: #2d2d2d;
            --text-primary: #ffffff;
            --text-secondary: #b0b0b0;
            --accent-color: #3b82f6;
            --accent-hover: #60a5fa;
            --border-color: #404040;
            --shadow: rgba(0, 0, 0, 0.5);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Montserrat', Arial, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            transition: background 0.3s, color 0.3s;
        }

        .theme-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-secondary);
            border: 2px solid var(--border-color);
            color: var(--text-primary);
            padding: 10px 20px;
            border-radius: 24px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
            box-shadow: 0 2px 8px var(--shadow);
            z-index: 1000;
        }

        .theme-toggle:hover {
            border-color: var(--accent-color);
            transform: scale(1.05);
        }

        .login-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 16px;
        }

        .login-card {
            background: var(--bg-secondary);
            border-radius: 16px;
            box-shadow: 0 4px 24px var(--shadow);
            padding: 48px;
            width: 100%;
            max-width: 450px;
            transition: background 0.3s;
        }

        .login-header {
            text-align: center;
            margin-bottom: 32px;
        }

        .login-header h2 {
            color: var(--accent-color);
            font-size: 2em;
            margin-bottom: 8px;
        }

        .login-header p {
            color: var(--text-secondary);
            font-size: 0.95em;
        }

        .form-group {
            margin-bottom: 24px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .form-group input {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            font-size: 1em;
            font-family: 'Montserrat', Arial, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            transition: border 0.3s, background 0.3s;
        }

        .form-group input:focus {
            outline: none;
            border-color: var(--accent-color);
        }

        .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            font-size: 0.9em;
        }

        .remember-me {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-secondary);
        }

        .remember-me input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: var(--accent-color);
        }

        .forgot-password {
            color: var(--accent-color);
            text-decoration: none;
            font-weight: 600;
        }

        .forgot-password:hover {
            text-decoration: underline;
        }

        .login-btn {
            width: 100%;
            padding: 14px;
            background: var(--accent-color);
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 1.1em;
            font-weight: 700;
            font-family: 'Montserrat', Arial, sans-serif;
            cursor: pointer;
            transition: background 0.3s;
            margin-bottom: 24px;
        }

        .login-btn:hover {
            background: var(--accent-hover);
        }

        .register-link {
            text-align: center;
            color: var(--text-secondary);
            font-size: 0.95em;
        }

        .register-link a {
            color: var(--accent-color);
            text-decoration: none;
            font-weight: 700;
        }

        .register-link a:hover {
            text-decoration: underline;
        }

        footer {
            background: var(--bg-secondary);
            color: var(--text-secondary);
            text-align: center;
            padding: 24px;
            margin-top: auto;
            border-top: 1px solid var(--border-color);
        }

        @media (max-width: 768px) {
            .login-card {
                padding: 32px 24px;
            }

            .login-header h2 {
                font-size: 1.6em;
            }
        }
    </style>
    <!-- Affluence config: points frontend to deployed backend -->
    <script src="js/affluence-config.js"></script>
</head>
<body>
    <button class="theme-toggle" onclick="toggleTheme()">
        <span id="theme-icon">🌙 Dark Mode</span>
    </button>

    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <h2>Login</h2>
                <p>Sign in to your account and begin your journey.</p>
            </div>

            <form id="loginForm">
                <div class="form-group">
                    <label for="username">Username or Email</label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        placeholder="Enter your username or email" 
                        required
                    >
                </div>

                <div class="form-group password-group">
                    <label for="password">Password</label>
                    <div style="position: relative;">
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            placeholder="Enter your password" 
                            required
                        >
                        <span class="toggle-password" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer;">
                            <i class="fas fa-eye"></i>
                        </span>
                    </div>
                </div>

                <div class="form-options">
                    <label class="remember-me">
                        <input type="checkbox" id="remember" name="remember">
                        <span>Remember me</span>
                    </label>
                    <a href="#" class="forgot-password">Forgot Password?</a>
                </div>

                <button type="submit" class="login-btn">Login Account</button>
            </form>

            <div class="register-link">
                Don't have an account? <a href="register.html">Register</a>
            </div>


        </div>
    </div>

    <footer>
        <p>&copy; 2025 Affluence. All Rights Reserved.</p>
    </footer>

    <!-- Toast notification container -->
    <div id="toast-container" style="position: fixed; top: 20px; right: 20px; z-index: 10000;"></div>

    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <script>
        // Theme toggle functionality
        function toggleTheme() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            const themeIcon = document.getElementById('theme-icon');
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            if (newTheme === 'dark') {
                themeIcon.textContent = '☀️ Light Mode';
            } else {
                themeIcon.textContent = '🌙 Dark Mode';
            }
        }

        // Load saved theme on page load
        function loadTheme() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            const html = document.documentElement;
            const themeIcon = document.getElementById('theme-icon');
            
            html.setAttribute('data-theme', savedTheme);
            
            if (savedTheme === 'dark') {
                themeIcon.textContent = '☀️ Light Mode';
            } else {
                themeIcon.textContent = '🌙 Dark Mode';
            }
        }

        // Toast notification function
        function showToast(message, type = 'info') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.style.cssText = `
                padding: 15px 20px;
                margin-bottom: 10px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease-out;
                min-width: 250px;
            `;
            
            // Set background color based on type
            const colors = {
                success: '#10b981',
                error: '#ef4444',
                info: '#3b82f6',
                warning: '#f59e0b'
            };
            toast.style.backgroundColor = colors[type] || colors.info;
            
            toast.textContent = message;
            container.appendChild(toast);
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // Initialize theme on page load
        loadTheme();
    </script>

    <!-- API and Login Scripts -->
    <script src="js/api.js"></script>
    <script>
        // Debug API configuration
        console.log('API Base URL:', window.api.baseURL);
        console.log('Auth token exists:', !!window.api.getToken());
        
        // Function to test API connection with retry option
        async function checkApiConnection(retry = false) {
            console.log('Testing API connection...');
            
            try {
                // Use the new API test function
                const isConnected = await window.api.testConnection();
                
                if (!isConnected) {
                    if (retry) {
                        const retryDiv = document.createElement('div');
                        retryDiv.id = 'api-retry';
                        retryDiv.style.cssText = `
                            padding: 15px;
                            background: #fff3cd;
                            color: #856404;
                            border: 1px solid #ffeeba;
                            border-radius: 8px;
                            margin: 20px auto;
                            text-align: center;
                            max-width: 400px;
                        `;
                        retryDiv.innerHTML = `
                            <p><strong>Warning:</strong> Cannot connect to the API server.</p>
                            <p>Please make sure the backend server is running.</p>
                            <button onclick="checkApiConnection(true)" style="
                                background: #007bff;
                                color: white;
                                border: none;
                                padding: 8px 15px;
                                border-radius: 4px;
                                cursor: pointer;
                                margin-top: 10px;
                            ">Retry Connection</button>
                        `;
                        
                        // Remove existing retry div if it exists
                        const existingRetryDiv = document.getElementById('api-retry');
                        if (existingRetryDiv) existingRetryDiv.remove();
                        
                        // Add the retry div before the login form
                        const loginForm = document.getElementById('loginForm');
                        if (loginForm && loginForm.parentNode) {
                            loginForm.parentNode.insertBefore(retryDiv, loginForm);
                        } else {
                            document.body.appendChild(retryDiv);
                        }
                    }
                    
                    showToast('Warning: API connection failed. Backend might be unavailable.', 'warning');
                    console.error('API connection test failed - backend might be down');
                } else {
                    console.log('API connection test succeeded');
                    // Remove retry div if it exists
                    const retryDiv = document.getElementById('api-retry');
                    if (retryDiv) retryDiv.remove();
                }
            } catch (err) {
                console.error('Error running API connection test:', err);
                showToast('Warning: API connection failed. Backend might be unavailable.', 'warning');
            }
        }
        
        // Run the API connection test when page loads
        window.addEventListener('DOMContentLoaded', () => {
            checkApiConnection(true);
        });
    </script>
    <script src="js/login.js"></script>

    <style>
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    </style>
        loadTheme();
    </script>
</body>
</html>
