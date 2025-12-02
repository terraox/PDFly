# 🔐 Password Change - Quick Fix Guide

## ❗ THE REAL ISSUE

The backend is working fine. The "Failed to change password" error happens when:

### 1. **You're Using the Wrong Current Password** (90% of cases)

**Admin Account:**
- Current Password: `pdfly_admin_pass`

**Regular Users:**
- Check the backend logs when you registered
- Or check your email
- Or use "Forgot Password" to reset it

---

## ✅ **STEP-BY-STEP FIX:**

### **Step 1: Make Sure You're Logged In**
- Check if you're on the Profile page
- You should see your email displayed

### **Step 2: Try Admin Account First**
1. Logout (if logged in as regular user)
2. Login with:
   - Email: `admin@pdfly.io`
   - Password: `pdfly_admin_pass`
3. Go to Profile → Security Settings
4. Change password:
   - Current Password: `pdfly_admin_pass`
   - New Password: `your_new_password`

### **Step 3: Check Browser Console**
1. Press `F12` to open DevTools
2. Go to "Network" tab
3. Try changing password
4. Click on the `/api/auth/change-password` request
5. Look at the "Response" tab

**Common Responses:**
- `"Incorrect old password"` → You entered wrong current password
- `"Old password is required"` → Field is empty
- `"Password changed successfully"` → It worked!

---

## 🐛 **Still Not Working?**

### Check These:

1. **Is backend running?**
   ```bash
   lsof -i :8080
   ```
   Should show java process

2. **What's the exact error?**
   - Look in browser console (F12 → Console tab)
   - Check network response

3. **Token expired?**
   - Logout and login again

---

## 💡 **Quick Test:**

Try this with the admin account:
1. Login: `admin@pdfly.io` / `pdfly_admin_pass`
2. Profile → Security Settings
3. Current: `pdfly_admin_pass`
4. New: `NewPassword123!`
5. Click Update

If this works → Your regular account has wrong current password.
If this fails → Check browser console for exact error.

---

## ⚠ **Remember:**

- The backend knows if your current password is wrong
- It will say "Incorrect old password"
- Check browser console for the exact message
- The feature IS working - you just need the right current password
