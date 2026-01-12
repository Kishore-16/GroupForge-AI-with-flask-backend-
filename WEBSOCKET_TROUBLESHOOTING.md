# WebSocket Connection Troubleshooting Guide

## Quick Test Steps

### 1. Check Backend is Running
Make sure your Flask backend is running with SocketIO:
```bash
cd backend
python run.py
```

You should see output like:
```
 * Running on http://0.0.0.0:5000
```

### 2. Check Environment Variables
Create or update `.env` file in the project root:
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Check Browser Console
Open browser console (F12) and look for these logs:
- ✅ "User authenticated, connecting WebSocket..."
- ✅ "🔌 Initializing WebSocket connection..."
- ✅ "📡 Backend URL: http://localhost:5000"
- ✅ "🔑 Token length: xxx"
- ✅ "🚀 Socket.IO client initialized"
- ✅ "✅ WebSocket connected"

### 4. Common Issues & Fixes

#### Issue: "No authentication token available"
**Solution:** 
- Log out and log back in
- Check if token is in localStorage: `localStorage.getItem('accessToken')`
- If no token, register/login again

#### Issue: "Invalid token"
**Solution:**
- Token might be expired
- Log out and log back in
- Check backend JWT_SECRET_KEY matches

#### Issue: "Connection refused" or "CORS error"
**Solution:**
- Make sure backend is running on port 5000
- Check VITE_BACKEND_URL in .env file
- Verify Flask-CORS is properly configured

#### Issue: WebSocket shows "Disconnected" but no error
**Solution:**
- Check backend logs for errors
- Verify Flask-SocketIO is installed: `pip install Flask-SocketIO`
- Check if socketio.run() is used instead of app.run()

## Manual Testing

### Test 1: Check Token in Console
```javascript
// Open browser console and run:
localStorage.getItem('accessToken')
// Should return a JWT token string
```

### Test 2: Test WebSocket Connection Manually
```javascript
// Open browser console and run:
import { webSocketService } from './src/services/websocketService';
const token = localStorage.getItem('accessToken');
webSocketService.connect(token).then(success => {
  console.log('Connection success:', success);
}).catch(error => {
  console.error('Connection error:', error);
});
```

### Test 3: Check Backend WebSocket Handler
```bash
# Backend should log when connection is attempted:
# "WebSocket connection attempt from <session_id>"
# "Token found in query args" or "Token found in Socket.IO auth"
# "Attempting to authenticate user with token"
# "User <user_id> authenticated successfully"
```

## Debug Mode

Enable verbose logging:

### Frontend:
Already enabled in the code - check browser console

### Backend:
Add to run.py:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Expected Flow

1. **User logs in** → Token saved to localStorage
2. **AuthContext loads** → Token set in state
3. **WebSocketProvider mounts** → Sees user + token
4. **WebSocket connects** → Passes token to backend
5. **Backend authenticates** → Decodes JWT, validates user
6. **Connection established** → User joins rooms
7. **Status shows "Connected"** → Green indicator in sidebar

## Verification Checklist

- [ ] Backend is running with `socketio.run()` not `app.run()`
- [ ] Flask-SocketIO is installed in requirements.txt
- [ ] User is logged in with valid token
- [ ] Token exists in localStorage
- [ ] .env file has correct VITE_BACKEND_URL
- [ ] No CORS errors in console
- [ ] Backend logs show connection attempts
- [ ] Sidebar shows green "Real-time Connected" status

## Still Not Working?

1. Clear browser cache and localStorage
2. Restart backend server
3. Restart frontend dev server
4. Try different browser
5. Check firewall/antivirus settings
6. Verify port 5000 is not blocked

## Success Indicators

✅ Sidebar shows green wifi icon with "Real-time Connected"
✅ Console logs show successful connection
✅ Backend logs show authenticated user
✅ Real-time notifications appear when events occur