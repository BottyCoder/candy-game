# Create the Candy Game GitHub repo and push

The project is ready at `c:\Repo\candy-game` with a fresh git history. To put it on GitHub:

1. **Create a new repo on GitHub**
   - Go to https://github.com/new
   - Repository name: **candy-game**
   - Public, no README / no .gitignore (we already have them)
   - Create repository

2. **Add remote and push** (run from `c:\Repo\candy-game`):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/candy-game.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your GitHub username (or org).

3. **New database**
   - Create a new PostgreSQL database for Candy Game (e.g. on Replit, Railway, Neon, or local).
   - Set `DATABASE_URL` in the deployment environment (Replit Secrets or `.env`).
   - Run migrations / `db:push` as in the main README.

This clone is identical to the Valentine's game except: package name "candy-game", README title, and no shared DB or secrets.
