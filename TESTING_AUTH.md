# Testing Authentication Guide

Quick guide to test phone authentication without SMS costs.

## 🧪 **Option 1: Use Test Phone Numbers (Recommended)**

This avoids SMS costs and reCAPTCHA issues during development.

### **Setup Test Phone Numbers**

1. **Go to Firebase Console**: https://console.firebase.google.com/project/razor-decor/authentication/providers

2. **Click on "Phone" provider**

3. **Scroll down to "Phone numbers for testing"**

4. **Add test numbers**:
   ```
   Phone: +97688887777
   Code: 123456
   
   Phone: +97699998888
   Code: 654321
   ```

5. **Click "Save"**

### **Test Registration**

1. **Go to**: http://localhost:3000/en/auth/register

2. **Enter**:
   - Phone: `88887777` (without +976)
   - PIN: `1234`
   - Confirm PIN: `1234`

3. **Click "Register"**
   - You should NOT see any reCAPTCHA challenge
   - It will directly ask for SMS code

4. **Enter verification code**: `123456` (the test code)

5. **Success!** You should be registered and logged in

### **Test Login**

1. **Go to**: http://localhost:3000/en/auth/login

2. **Enter**:
   - Phone: `88887777`
   - PIN: `1234`

3. **Click "Send Code"**

4. **Enter verification code**: `123456`

5. **Success!** You should be logged in

---

## 🔐 **Option 2: Use Real Phone Numbers**

If you want to test with real phone numbers and SMS:

### **Prerequisites**

1. **Add authorized domain**:
   - Go to: https://console.firebase.google.com/project/razor-decor/authentication/settings
   - Ensure `localhost` is in "Authorized domains"

2. **Restart dev server**:
   ```bash
   npm run dev
   ```

### **Test with Real Phone**

1. **Go to**: http://localhost:3000/en/auth/register

2. **Enter your Mongolian phone number**:
   - Format: `88887777` (8 digits, without country code)
   - App automatically adds +976

3. **Solve reCAPTCHA** (visible checkbox)

4. **Click "Register"**
   - SMS will be sent to your phone
   - Check your SMS messages

5. **Enter the 6-digit code from SMS**

6. **Success!** You're registered

**Note**: Firebase free tier includes 10,000 phone verifications/month

---

## 🐛 **Troubleshooting**

### **Error: "auth/invalid-app-credential"**

**Solution 1**: Use test phone numbers (see Option 1)

**Solution 2**: Check authorized domains
1. Go to: https://console.firebase.google.com/project/razor-decor/authentication/settings
2. Make sure `localhost` is listed under "Authorized domains"
3. Restart dev server

### **Error: "reCAPTCHA verification failed"**

**Solution**: Add your domain to reCAPTCHA whitelist
1. Go to: https://console.cloud.google.com/security/recaptcha
2. Select your site key
3. Add `localhost` to domains
4. Or use test phone numbers (no reCAPTCHA needed)

### **Error: "Phone number already exists"**

This user is already registered. Try:
- Use a different phone number
- Or go to login page instead
- Or use the `update-user-role.js` script to make existing user an admin

### **SMS not received**

1. Check phone number format: Should be 8 digits
2. Make sure Phone Authentication is enabled in Firebase Console
3. Check Firebase Console > Authentication > Usage for any errors
4. Verify you're not hitting SMS quota limits

### **reCAPTCHA not showing**

This is normal with test phone numbers! Test numbers bypass reCAPTCHA.

For real numbers:
1. Check browser console for errors
2. Try clearing browser cache
3. Restart dev server

---

## 📊 **Testing Checklist**

- [ ] Phone authentication enabled in Firebase Console
- [ ] Test phone numbers added (+97688887777 → 123456)
- [ ] `localhost` in authorized domains
- [ ] Dev server running (`npm run dev`)
- [ ] Can register with test number
- [ ] Can login with test number
- [ ] User document created in Firestore
- [ ] Can set user as admin in Firestore
- [ ] Admin panel accessible after setting role

---

## 🎯 **Quick Test Script**

```bash
# 1. Restart dev server
npm run dev

# 2. Open browser
open http://localhost:3000/en/auth/register

# 3. Test registration
#    Phone: 88887777
#    PIN: 1234
#    Code: 123456

# 4. Check Firestore
#    Go to: https://console.firebase.google.com/project/razor-decor/firestore
#    Verify user document exists in 'users' collection

# 5. Make user admin
#    - Click on user document
#    - Add field: role = "admin"
#    - Save

# 6. Test admin access
open http://localhost:3000/en/admin
```

---

## 💡 **Pro Tips**

1. **Always use test numbers during development** - no SMS costs, no reCAPTCHA hassle

2. **Multiple test users**: Add multiple test phone numbers for testing different scenarios

3. **Admin testing**: Create one test user, set as admin, use for all admin testing

4. **Real SMS testing**: Only test with 1-2 real numbers before deploying

5. **Production**: Remove test phone numbers before deploying to production

---

## 📞 **Test Phone Numbers Cheatsheet**

| Phone | Code | Use Case |
|-------|------|----------|
| +97688887777 | 123456 | Regular customer |
| +97699998888 | 654321 | Admin user |
| +97677776666 | 111111 | Test user 3 |

Add these in Firebase Console for easy testing!

---

Need help? Check:
- Firebase Console: https://console.firebase.google.com/project/razor-decor
- Test numbers: Authentication > Providers > Phone > Testing section
- Authorized domains: Authentication > Settings > Authorized domains
