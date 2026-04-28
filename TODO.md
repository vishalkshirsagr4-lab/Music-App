# Forgot Password Feature Implementation

## Backend Tasks
- [x] 1. Update `backend/src/models/otp.model.js` — add `type` field
- [x] 2. Update `backend/src/services/email.service.js` — add `sendPasswordResetOTPEmail()`
- [x] 3. Update `backend/src/controllers/auth.controller.js` — add forgot password controllers
- [x] 4. Update `backend/src/routes/auth.routes.js` — add forgot password routes

## Frontend Tasks
- [x] 5. Create `frontend/src/pages/ForgotPassword.jsx`
- [x] 6. Update `frontend/src/App.jsx` — add `/forgot-password` route
- [x] 7. Update `frontend/src/pages/Login.jsx` — add "Forgot Password?" link

## Implementation Summary

### Backend Changes
1. **OTP Model** — Added `type` field (`email_verification` | `password_reset`) with index to prevent OTP conflicts between features.
2. **Email Service** — Added `sendPasswordResetOTPEmail()` with a password-reset themed HTML email template.
3. **Auth Controller** — Added 3 new functions:
   - `sendForgotPasswordOTP` — Sends a 6-digit OTP to user's email for password reset
   - `verifyForgotPasswordOTP` — Verifies the OTP and returns a short-lived JWT `resetToken` (10 min expiry)
   - `resetPassword` — Validates `resetToken` and updates the user's password with bcrypt hashing
   - Also updated existing `sendOTP` and `verifyOTP` to use `type: 'email_verification'` for consistency
4. **Auth Routes** — Added 3 new public routes:
   - `POST /auth/forgot-password/send-otp`
   - `POST /auth/forgot-password/verify-otp`
   - `POST /auth/forgot-password/reset`

### Frontend Changes
5. **ForgotPassword.jsx** — New 3-step wizard page (Email → OTP → New Password) with:
   - Consistent dark theme matching Login/VerifyEmail pages
   - 6-digit OTP inputs with auto-focus
   - Countdown timer (5 min) and attempt tracker (3 max)
   - Password confirmation validation
   - Redirects to login after successful reset
6. **App.jsx** — Added `/forgot-password` route
7. **Login.jsx** — Added "Forgot Password?" link below the Sign In button

### Security Features
- OTPs are hashed with bcrypt before storage
- OTPs expire after 5 minutes (MongoDB TTL index)
- Maximum 3 verification attempts per OTP
- Reset token is a short-lived JWT (10 minutes)
- Password minimum length of 6 characters enforced on both frontend and backend
- Email verification and password reset OTPs are isolated via the `type` field

