# 📝 GitHub Repository Setup Instructions

Follow these steps to create a GitHub repository and push your code.

## 🌟 Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the **"+"** icon in the top-right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `whatsapp-broadcast-saas`
   - **Description**: Multi-tenant WhatsApp Broadcast System with Desktop Agent & Waha Cloud
   - **Visibility**: Choose **Private** (recommended) or **Public**
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

## 🔗 Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/whatsapp-broadcast-saas.git

# Rename branch to main (if needed)
git branch -M main

# Push code to GitHub
git push -u origin main
```

## ✅ Step 3: Verify Upload

1. Refresh your GitHub repository page
2. You should see all your files:
   - `server.js`
   - `package.json`
   - `README.md`
   - `DEPLOYMENT.md`
   - `database-schema.sql`
   - `config/`, `routes/`, `middleware/`, `public/` folders
   - `.gitignore`
   - `.env.example` (NOT .env - that's ignored!)

## 🔐 Important Security Notes

✅ **Files that SHOULD be in GitHub:**
- All code files
- `.env.example` (template)
- `README.md`
- `package.json`

❌ **Files that should NOT be in GitHub:**
- `.env` (actual credentials) - protected by `.gitignore`
- `node_modules/` - protected by `.gitignore`
- Any files with API keys or passwords

## 🚀 Alternative: Using GitHub CLI

If you prefer command-line:

```bash
# Install GitHub CLI (if not already installed)
# Windows: winget install GitHub.cli
# Or download from: https://cli.github.com/

# Login to GitHub
gh auth login

# Create repository and push
gh repo create whatsapp-broadcast-saas --private --source=. --remote=origin --push
```

## 🔄 Future Updates

When you make changes:

```bash
# Check what changed
git status

# Stage changes
git add .

# Commit with message
git commit -m "Description of changes"

# Push to GitHub
git push
```

## 📋 Quick Commands Reference

```bash
# Check current status
git status

# View commit history
git log --oneline

# View remote repository
git remote -v

# Pull latest changes (when working from different computers)
git pull

# View branches
git branch

# Create new branch
git checkout -b feature-name

# Switch branch
git checkout main
```

## 🆘 Troubleshooting

### "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/whatsapp-broadcast-saas.git
```

### Authentication issues
```bash
# Use personal access token instead of password
# Create token at: https://github.com/settings/tokens
# Use token as password when prompted
```

### Accidentally committed .env file
```bash
# Remove from Git but keep locally
git rm --cached .env
git commit -m "Remove .env from tracking"
git push

# Then add .env to .gitignore (already done!)
```

---

## ✨ Next Steps After GitHub Upload

1. ✅ Repository created on GitHub
2. ✅ Code pushed successfully
3. 🚀 Ready to deploy to EC2
4. 📖 Follow `DEPLOYMENT.md` for EC2 setup

---

## 🎯 Quick Start Summary

```bash
# 1. Create repo on GitHub.com (as described above)

# 2. Run these commands in your terminal:
git remote add origin https://github.com/YOUR_USERNAME/whatsapp-broadcast-saas.git
git branch -M main
git push -u origin main

# Done! Your code is now on GitHub 🎉
```
