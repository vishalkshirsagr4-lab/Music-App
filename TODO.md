# Backend Deployment Fix - Render Error Resolution

## Status: In Progress

**Current Step: 1/6 ✅** Create TODO.md

**Pending Steps:**

2. **Edit** `backend/package.json` 
### 2. [x] Update package.json ✅

### 3. [x] Install dependencies
- `cd backend && npm install` (user action)

### 4. [x] Backend Model Updates ✅
- Updated backend/src/models/user.model.js


### 6. [x] Update Auth Controller ✅
- Rewrote backend/src/controllers/auth.controller.js (removed register/login/OTP verify, added googleCallback/generateToken, kept forgot-password/profile)

### 7. [x] Update App.js ✅
- Rewrote backend/src/app.js (added session/passport middleware, /auth at root for OAuth, /api/* kept)

### 8. [x] Frontend Updates ✅
- Updated Login.jsx: Google OAuth button + redirect handling
- Updated Register.jsx: Redirects to login
- Updated App.jsx: Removed register/verify-email routes
- Deleted VerifyEmail.jsx

### 8. Frontend Updates
- Edit frontend/src/pages/Login.jsx (Google button only)
- Edit frontend/src/pages/Register.jsx (redirect to login or remove)
- Edit frontend/src/App.jsx (remove register/verify-email routes)
- Delete frontend/src/pages/VerifyEmail.jsx

### 9. Test & Followup
- User adds GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET to backend/.env
- Run backend dev server
- Test Google login flow
- Migrate existing users if needed
- Update TODO.md with completion

**Next: Dependencies → Model**

