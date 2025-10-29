# Affluence API Path Resolution Documentation

This document explains how API paths are constructed and resolved in the Affluence application, with particular emphasis on the admin panel functionality.

## API Base URL Resolution

The frontend application dynamically resolves the API base URL using the following approach:

### Base URL Detection Logic

The API base URL is determined using the following priority order:

1. **Global Override**: If `window.AFFLUENCE_API_BASE` is defined, it's used as the API base
2. **Meta Tag**: If a meta tag with name="api-base" exists in the page's head, its content is used
3. **LocalStorage**: If `localStorage.getItem('affluence_api_base')` has a value, it's used
4. **Default**: If all else fails, the default `http://localhost:8000/api` is used

This logic is implemented in the `detectApiBase()` function in `js/api.js`.

### API Health Check

The API client tests for backend availability using a multi-endpoint approach:

- Tries an OPTIONS request first to test for CORS issues
- Then tries several known endpoints in sequence:
  - `/api` (base endpoint)
  - `/api/auth/test` (auth availability)
  - `/api/health` (health status)
  - `/api/ping` (ping endpoint)
  - `/api/users?limit=1` (users endpoint with limit)

For admin pages, it will also accept 401 responses as valid (indicating the API is working but authentication is required).

## Admin API Path Resolution

The admin panel uses a special path resolution system to ensure all admin API requests go to the correct endpoints.

### Admin Path Function

The `adminPath()` function in `js/admin.js` prepares API paths for admin endpoints:

```javascript
/**
 * Format an admin API path to include proper prefixes
 * @param {string} path - The admin API path (without leading slash)
 * @returns {string} Properly formatted admin API path
 */
function adminPath(path) {
    // Strip leading slash if present
    if (path.startsWith('/')) {
        path = path.substring(1);
    }
    
    // Always prefix with /admin unless it's already there
    if (!path.startsWith('admin/')) {
        path = `admin/${path}`;
    }
    
    return path;
}
```

### How Admin Paths Are Used

When making API requests from admin pages:

1. The `adminPath()` function is called to format the path
2. The path is passed to the API client
3. The API client appends it to the API base URL

Example:
```javascript
// In an admin page:
const users = await api.get(adminPath('users'));

// This will call:
// http://localhost:8000/api/admin/users
```

## Path Types

The application uses three types of paths:

1. **Regular API Paths**: Used for normal user functionality
   - Example: `/auth/login`, `/users/me`, `/tasks`
   - URL: `http://localhost:8000/api/auth/login`

2. **Admin API Paths**: Used for administrative functionality
   - Example: `admin/users`, `admin/dashboard`
   - URL: `http://localhost:8000/api/admin/users`

3. **Public Paths**: Used for non-authenticated public endpoints
   - Example: `/auth/register`, `/auth/test`
   - URL: `http://localhost:8000/api/auth/register`

## Authentication Header

The API client automatically adds authentication headers to all requests unless explicitly skipped:

```javascript
// Add auth token if available and not explicitly skipped
if (this.getToken() && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${this.getToken()}`;
}
```

Public endpoints like login and registration use the `skipAuth` option:

```javascript
return this.post('/auth/register', userData, { skipAuth: true });
```

## Common API Issues and Solutions

### CORS Issues

CORS issues are typically resolved by ensuring the backend has the correct CORS middleware configuration. The backend includes:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)
```

### Authentication Errors

If you receive 401 errors:
- Check that the token is being correctly set and sent
- Verify the token hasn't expired
- Make sure you're using the right endpoint (admin vs regular)

### API Connection Issues

If the API connection test fails:
- Make sure the backend server is running
- Check that the API base URL is correctly configured
- Verify the presence of health check endpoints

## Endpoint Testing

The application includes several tools for testing API connectivity:

1. `login-test.html` - Tests login functionality
2. `api-diagnostic.html` - General API diagnostics
3. `check_backend_api.py` - Command-line backend health check

## Additional Resources

- FastAPI Documentation: https://fastapi.tiangolo.com/
- JWT Authentication: https://jwt.io/
- CORS Explanation: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS