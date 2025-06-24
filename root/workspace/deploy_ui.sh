#!/bin/bash

# --- Enhanced Configuration ---
LOG_FILE="/root/mediaflow-setup-$(date +%F-%T).log"
# Redirect all output (stdout and stderr) to a log file and the console
# This ensures that even if the shell closes, logs are saved.
exec > >(tee -a "${LOG_FILE}") 2>&1

# --- Debugging and Error Handling ---
# 'e' exits immediately if a command exits with a non-zero status.
# 'x' prints each command and its arguments to the terminal before execution.
# 'o pipefail' ensures that a pipeline's exit status is the value of the last command to exit with a non-zero status.
set -exo pipefail

# --- Error Trapping ---
# This function will be called whenever a command fails.
error_handler() {
  local exit_code="$?"
  local line_number="$1"
  echo -e "\n\033[0;31m==================== SCRIPT FAILED ====================\033[0m"
  echo -e "\033[0;31mError on line ${line_number} with exit code ${exit_code}\033[0m"
  echo -e "\033[0;31mFull log available at: ${LOG_FILE}\033[0m"
  echo -e "\033[0;31m=====================================================\033[0m"
}
# Register the error handler
trap 'error_handler $LINENO' ERR

# --- Script Configuration ---
REPO_URL="git@github.com:your_username/your_repo.git" # <-- UPDATE THIS!
APP_DIR="/root/mediaflow"
PM2_APP_NAME="mediaflow-app"
SSH_CONFIRM_FILE="$HOME/.ssh/github_key_verified"

# --- Style Functions ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# --- Cleanup Functions ---
# A safe restart that FORCES an update from Git
safe_restart() {
  echo -e "\n${BLUE}---> Performing a safe restart of the application...${NC}"
  cd "$APP_DIR"
  echo "Forcefully discarding any local changes..."
  git reset --hard HEAD
  git clean -fd
  echo "Pulling latest code from GitHub..."
  git pull
  echo "Installing dependencies..."
  npm install
  echo "Building application for production..."
  npm run build
  echo "Restarting PM2 process..."
  pm2 restart "$PM2_APP_NAME" || echo "App not running, will start it in main script flow."
  echo -e "${GREEN}---> Safe restart finished.${NC}"
}

# A full, destructive cleanup
full_cleanup() {
  echo -e "\n${BLUE}---> Performing FULL cleanup... Deleting all app files and PM2 config.${NC}"
  pm2 delete all || echo "PM2 was not running."
  pm2 unstartup || echo "PM2 startup was not configured."
  npm uninstall -g pm2 || echo "PM2 was not installed."
  rm -rf "$APP_DIR" || echo "App directory not found."
  rm -f "$SSH_CONFIRM_FILE" || echo "SSH confirmation file not found."
  echo -e "${GREEN}---> Full cleanup finished.${NC}"
}

# --- Main Script Logic ---

# Check for flags
if [[ "$1" == "--full-restart" ]]; then
  full_cleanup
fi
if [[ "$1" == "--restart" ]]; then
  safe_restart
  exit 0 # Exit after the safe restart is done
fi

echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE}    🚀 Starting MediaFlow UI Setup & Deployment     ${NC}"
echo -e "${BLUE}=====================================================${NC}"

# 1. UPDATE SYSTEM & INSTALL DEPENDENCIES
echo -e "\n${GREEN}---> 1. Updating system and installing essential packages...${NC}"
apt-get update
apt-get upgrade -y
apt-get install -y git curl wget build-essential

# 2. INSTALL NODE.JS USING NVM
echo -e "\n${GREEN}---> 2. Installing Node.js (LTS version)...${NC}"
export NVM_DIR="$HOME/.nvm"
if ! command -v nvm &> /dev/null; then
    echo -e "NVM not found, installing..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

# Source NVM to make it available
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
echo -e "Installing or verifying LTS version of Node.js..."
nvm install --lts
nvm use --lts
nvm alias default 'lts/*'

# 3. SETUP GITHUB SSH DEPLOY KEY (ONLY PROMPTS ONCE)
echo -e "\n${GREEN}---> 3. Setting up GitHub SSH Key...${NC}"
if [ ! -f ~/.ssh/id_rsa ]; then
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
fi

if [ ! -f "$SSH_CONFIRM_FILE" ]; then
    echo -e "\n${BLUE}========================= ACTION REQUIRED ==========================${NC}"
    echo -e "You must add the following SSH public key to your GitHub repository."
    echo -e "1. Copy the entire block of text below (from 'ssh-rsa' to 'root@...'):\n"
    echo -e "${GREEN}"
    cat ~/.ssh/id_rsa.pub
    echo -e "${NC}"
    echo -e "\n2. Go to your GitHub repository: $REPO_URL"
    echo -e "3. Navigate to 'Settings' > 'Deploy Keys' > 'Add deploy key'."
    echo -e "4. Give it a title (e.g., 'Production-Server')."
    echo -e "5. Paste the key. DO NOT check 'Allow write access'."
    echo -e "${BLUE}======================================================================${NC}"
    read -p "Press [Enter] to continue once you have added the key to GitHub..."
    # After user confirms, create the confirmation file to prevent this block from running again
    touch "$SSH_CONFIRM_FILE"
else
    echo -e "GitHub deploy key prompt already completed. Skipping."
fi

# 4. CLONE OR UPDATE THE REPOSITORY
echo -e "\n${GREEN}---> 4. Cloning or updating the repository...${NC}"
if [ -d "$APP_DIR/.git" ]; then
    echo "Repository already exists. Discarding local changes and pulling..."
    cd "$APP_DIR"
    git reset --hard HEAD
    git clean -fd
    git pull
else
    echo "Cloning new repository..."
    ssh-keyscan github.com >> ~/.ssh/known_hosts 2>/dev/null
    git clone $REPO_URL $APP_DIR
fi

# 5. INSTALL DEPENDENCIES & BUILD
echo -e "\n${GREEN}---> 5. Installing npm dependencies...${NC}"
cd $APP_DIR
npm install

echo -e "\n${GREEN}---> 6. Building Next.js app for production...${NC}"
npm run build

# 7. INSTALL PM2 & START APPLICATION
echo -e "\n${GREEN}---> 7. Installing PM2 and starting application...${NC}"
npm install pm2 -g
export PATH=$(npm prefix -g)/bin:$PATH
# This will restart the app if it exists, or start it if it doesn't.
# Note: `npm start` runs `next start` which serves the production build on port 3000.
pm2 restart "$PM2_APP_NAME" || pm2 start npm --name "$PM2_APP_NAME" -- start

# 8. CONFIGURE PM2 TO START ON BOOT
echo -e "\n${GREEN}---> 8. Configuring PM2 to start on system boot...${NC}"
pm2 startup ubuntu -u root --hp /root
pm2 save

echo -e "\n${BLUE}=====================================================${NC}"
echo -e "${BLUE}            ✅ Setup Complete!                        ${NC}"
echo -e "${BLUE}=====================================================${NC}"
echo -e "Your application is now running."
echo -e "You can check its status with the command: ${GREEN}pm2 list${NC}"
echo -e "You can view the application logs with: ${GREEN}pm2 logs $PM2_APP_NAME${NC}"
echo -e "The full installation log is located at: ${GREEN}${LOG_FILE}${NC}"

    