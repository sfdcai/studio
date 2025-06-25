#!/bin/bash
set -e
echo "--- Starting Media Server Setup ---"

echo "--- Updating system and installing required packages... ---"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get upgrade -y
apt-get install -y \
    rclone \
    ffmpeg \
    imagemagick \
    exiftool \
    sqlite3 \
    git \
    npm \
    python3-pip \
    bc

echo "--- Installing iCloudPD via pip... ---"
pip install --break-system-packages icloudpd

echo "--- Creating necessary media directories... ---"
mkdir -p media/nas_archive
mkdir -p media/icloud_source
mkdir -p media/processing_queue
mkdir -p media/ready_to_sync
mkdir -p media/logs
echo "--- Media directories created. ---"

echo "--- Installing rclone if not already present... ---"
if ! command -v rclone &> /dev/null; then
    curl https://rclone.org/install.sh | sudo bash
fi

echo "--- Installing PM2 globally if not already present... ---"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    # Ensure PM2 is in the PATH for the rest of the script
    export PATH="$PATH:$(npm bin -g)"
fi

echo "--- Setup Complete! ---"
echo "Next steps:"

echo "--- Starting rclone remote control with web GUI using PM2... ---"
pm2 start "rclone rcd --rc-web-gui --rc-addr localhost:5572" --name rclone-web-gui
pm2 save
echo "1. Run `deploy_ui.sh` to build and deploy the web UI."
echo "2. Configure the settings in the web UI, including iCloud credentials and folder paths."

echo "--- Starting process_queue.sh script using PM2... ---"
pm2 start process_queue.sh --name media-processor
pm2 save

echo "3. **Configure rclone:** Run `rclone config` in your terminal to set up your cloud storage remote (e.g., Google Drive). Follow the interactive prompts."
echo "3. Run 'rclone config' to set up your cloud storage remote."
echo "4. Initiate an iCloud download from the web UI to authenticate `icloudpd` with your Apple ID."
echo "5. (Optional) Enable the systemd timer for automated processing and syncing."


