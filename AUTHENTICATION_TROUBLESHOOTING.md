# Troubleshooting Authentication Issues

This guide helps you diagnose and fix common authentication problems in the Affluence application.

## Common Error Codes

### 422 Unprocessable Content

**What it means:** The request data doesn't match the expected format or validation rules.

**Common causes:**
- Email format is invalid (missing @ symbol)
- Required fields are missing (email or password)
- Data format doesn't match what the API expects

**How to fix:**
1. Check that your email is in a valid format (example@domain.com)
2. Make sure both email and password fields are filled
3. Check the browser console for specific validation errors

### 401 Unauthorized

**What it means:** Authentication failed or token is invalid/expired.

**Common causes:**
- Incorrect email/username or password
- Expired JWT token
- User account is disabled or locked

**How to fix:**
1. Verify your credentials are correct
2. Try logging out and logging back in
3. Check if your account is active (contact admin if needed)

### 404 Not Found

**What it means:** The API endpoint you're trying to reach doesn't exist.

**Common causes:**
- API path is incorrect
- Backend server is not running
- API routes have changed

**How to fix:**
1. Check that the backend server is running
2. Verify the API path is correct
3. Ensure you're using the latest frontend version

## Testing Authentication

Use the `login-test.html` tool to diagnose authentication issues:

1. Open `login-test.html` in your browser
2. Enter your credentials and click "Test Login"
3. Check the detailed error messages and suggestions

## Backend Health Check

To verify the backend is working correctly:

1. Run `start_backend.bat` to start the backend server
2. Check that the health endpoints return 200 OK:
   - GET /api
   - GET /api/health
   - GET /api/ping

## Common Account Issues

### Can't log in with correct credentials

1. **Check account status:** Your account might be disabled
2. **Reset password:** Use the password reset feature if available
3. **Clear browser data:** Try clearing cookies and cache
4. **Browser issues:** Try a different browser

### New registration doesn't work

1. **Email already registered:** Try logging in instead
2. **Validation issues:** Check for specific validation errors
3. **Server errors:** Check if the backend is responding

## For Developers

### Debugging Tips

1. **Check browser console:** Look for API errors and failed requests
2. **Examine request payload:** Verify the data being sent to the API
3. **Review server logs:** Check for validation errors and exceptions
4. **Test with Postman:** Try direct API calls to isolate frontend issues

### Common Code Issues

1. **CORS errors:** Ensure backend CORS settings allow your frontend origin
2. **Token issues:** Check how token is stored and sent in requests
3. **API path problems:** Verify paths are constructed correctly
4. **Validation mismatch:** Ensure frontend validation matches backend requirements

For more details on API path resolution and authentication, see [API_PATH_RESOLUTION.md](API_PATH_RESOLUTION.md).