# Replit Secrets Configuration

## Required Secrets for Valentine's Game

Set these in **Replit → Secrets** (lock icon in sidebar):

### 1. DATABASE_URL
```
postgresql://username:password@host:port/database
```
**Example:**
```
postgresql://user:pass123@db.example.com:5432/valentines_game
```
**Note:** Get this from your PostgreSQL provider (Supabase, Neon, Railway, etc.)

---

### 2. JWT_SECRET
```
[Generate a random 32+ character string]
```
**Example:**
```
valentines-game-jwt-secret-2024-minimum-32-chars-long-random-string
```
**How to generate:**
- Use a password generator
- Or run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

### 3. ADMIN_USERNAME
```
admin
```
**Or your preferred admin username**

---

### 4. ADMIN_PASSWORD
```
[Choose a strong password]
```
**Example:**
```
YourSecurePassword123!
```
**Note:** This will be hashed in the database, but choose a strong password.

---

### 5. CORS_ORIGIN (Optional - defaults to *)
```
*
```
**Or specific origin:**
```
https://your-domain.com
```

---

### 6. NODE_ENV (Optional - defaults to development)
```
production
```
**Or:**
```
development
```

---

### 7. PORT (Optional - Replit usually sets this automatically)
```
3001
```

---

## Quick Setup Instructions for Jason

1. Open Replit project
2. Click the **lock icon** (Secrets) in the left sidebar
3. Click **"New secret"** for each item above
4. Enter the **Key** (exactly as shown) and **Value** (your actual value)
5. Save each secret
6. Restart the Replit project

## Secret Names (Keys) - Copy These Exactly:

```
DATABASE_URL
JWT_SECRET
ADMIN_USERNAME
ADMIN_PASSWORD
CORS_ORIGIN
NODE_ENV
PORT
```

## After Setting Secrets

1. The server will automatically read these from environment variables
2. The admin user will be created automatically on first server start
3. You can access the admin panel at: `https://your-replit-url/admin`
4. Login with the `ADMIN_USERNAME` and `ADMIN_PASSWORD` you set

---

## Security Notes

- ✅ These secrets are encrypted in Replit
- ✅ They are NOT visible in code or logs
- ✅ Each team member can have different values in their own Replit
- ❌ Never commit these values to git
- ❌ Never share these in chat or documentation (except this setup doc)
