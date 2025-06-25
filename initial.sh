shell
#!/bin/bash

# --- Configuration ---
# Replace with your GitHub repository URL
REPO_URL="https://github.com/sfdcai/studio.git"
# Define the directory where the project will be cloned
PROJECT_DIR="studio-media-management"
# --- End Configuration ---

GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}---> Starting project setup...${NC}"

# 1. CLONE OR UPDATE THE REPOSITORY
echo -e "\n${GREEN}---> 1. Cloning or updating the repository...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    echo "Project directory '$PROJECT_DIR' already exists."
    read -p "Do you want to update the existing repository? (y/n): " update_repo
    if [[ "$update_repo" =~ ^[Yy]$ ]]; then
        echo "Updating repository..."
        cd "$PROJECT_DIR"
        git reset --hard HEAD || { echo "Error: git reset failed"; exit 1; }
        git clean -fd || { echo "Error: git clean failed"; exit 1; }
        git pull || { echo "Error: git pull failed"; exit 1; }
    else
        echo "Skipping repository update."
        cd "$PROJECT_DIR" || { echo "Error: Could not change directory to $PROJECT_DIR"; exit 1; }
    fi
else
    echo "Cloning new repository into '$PROJECT_DIR'..."
    git clone "$REPO_URL" "$PROJECT_DIR" || { echo "Error: git clone failed"; exit 1; }
    cd "$PROJECT_DIR" || { echo "Error: Could not change directory to $PROJECT_DIR"; exit 1; }
fi

# 2. MAKE SCRIPTS EXECUTABLE
echo -e "\n${GREEN}---> 2. Making scripts executable...${NC}"
chmod +x setup_media_server.sh || { echo "Error: chmod failed for setup_media_server.sh"; exit 1; }
chmod +x process_media.sh || { echo "Error: chmod failed for process_media.sh"; exit 1; }
chmod +x run_all.sh || { echo "Error: chmod failed for run_all.sh"; exit 1; }
chmod +x process_queue.sh || { echo "Error: chmod failed for process_queue.sh"; exit 1; }
# Add chmod for other scripts if necessary

# 3. RUN SETUP SCRIPT
echo -e "\n${GREEN}---> 3. Running setup script...${NC}"
./setup_media_server.sh || { echo "Error: setup_media_server.sh failed"; exit 1; }

echo -e "\n${GREEN}---> Project setup complete!${NC}"

echo -e "\n${GREEN}---> Next steps:${NC}"
echo "1. Ensure you have configured rclone by running 'rclone config' if prompted during setup."
echo "2. Start the Next.js development server by running 'npm run dev' in the '$PROJECT_DIR' directory."
echo "3. Access the rclone web GUI at http://localhost:5572 (or the address you configured)."
echo "4. Check PM2 status with 'pm2 status'."