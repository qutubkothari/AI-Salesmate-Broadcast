# Automated Deployment Script - Windows to EC2
param(
    [string]$Message = "Auto deploy from Windows"
)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  EC2 Deployment Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$EC2_IP = "43.205.192.171"
$EC2_USER = "ubuntu"
$EC2_KEY = "$HOME\Downloads\salesmate.pem"
$EC2_APP_DIR = "/home/ubuntu/apps/AI-Salesmate-Broadcast"
$REPO_URL = "https://github.com/qutubkothari/AI-Salesmate-Broadcast.git"

# Step 1: Git Status
Write-Host "[1/5] Checking Git status..." -ForegroundColor Yellow
git status --short

# Step 2: Add all changes
Write-Host ""
Write-Host "[2/5] Adding changes to Git..." -ForegroundColor Yellow
git add .

# Step 3: Commit changes
Write-Host ""
Write-Host "[3/5] Committing changes..." -ForegroundColor Yellow
git commit -m "$Message"

if ($LASTEXITCODE -ne 0) {
    Write-Host "No changes to commit or commit failed" -ForegroundColor Yellow
}

# Step 4: Push to GitHub
Write-Host ""
Write-Host "[4/5] Pushing to GitHub..." -ForegroundColor Yellow
git push

if ($LASTEXITCODE -ne 0) {
    Write-Host "Git push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Code pushed to GitHub successfully!" -ForegroundColor Green

# Step 5: Deploy to EC2
Write-Host ""
Write-Host "[5/5] Deploying to EC2..." -ForegroundColor Yellow

$deployCommand = @"
cd $EC2_APP_DIR || (mkdir -p /home/ubuntu/apps && cd /home/ubuntu/apps && git clone $REPO_URL && cd AI-Salesmate-Broadcast) && \
echo '🔄 Pulling latest changes...' && \
git pull origin main && \
echo '📦 Installing dependencies...' && \
npm install --production && \
echo '🔥 Restarting application...' && \
pm2 restart whatsapp-broadcast-saas || pm2 start server.js --name whatsapp-broadcast-saas && \
pm2 save && \
echo '✅ Deployment complete!' && \
pm2 status
"@

ssh -i $EC2_KEY -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" $deployCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "  Deployment Successful! ✅" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Your app is live at: http://$EC2_IP" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Red
    Write-Host "  Deployment Failed! ❌" -ForegroundColor Red
    Write-Host "================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
}
