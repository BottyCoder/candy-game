# Security Guidelines

## Environment Variables & Secrets

**NEVER commit the following to version control:**
- `JWT_SECRET` - Must be a random 32+ character string
- `ADMIN_USERNAME` - Admin login username
- `ADMIN_PASSWORD` - Admin login password (will be hashed in database)
- `DATABASE_URL` - PostgreSQL connection string with credentials

## Replit Setup

1. **Set secrets in Replit Secrets panel** (not in `.replit` file):
   - Go to Replit → Secrets (lock icon)
   - Add each environment variable as a secret
   - These will be automatically available as `process.env.VARIABLE_NAME`

2. **`.replit` file**:
   - Should NOT contain actual credentials
   - Use `.replit.example` as a template
   - Only commit non-sensitive configuration

## Local Development

1. Copy `.env.example` to `.env`
2. Fill in your actual values in `.env` (which is gitignored)
3. Never commit `.env` file

## If Credentials Are Exposed

If credentials are accidentally committed:

1. **Immediately rotate/change the exposed credentials**
2. Remove from git history (if needed):
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .replit" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. Force push (if already pushed to remote)
4. Update credentials in all environments

## Best Practices

- ✅ Use environment variables for all secrets
- ✅ Use `.example` files for templates
- ✅ Review `.gitignore` before committing
- ✅ Use GitGuardian or similar tools to scan commits
- ❌ Never hardcode credentials in source code
- ❌ Never commit `.env` or `.replit` with real credentials
