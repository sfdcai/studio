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
    python3-pip \
    bc \
    npm

echo "--- Installing iCloudPD via pip... ---"
pip install --break-system-packages icloudpd

echo "--- Installing PM2 globally via npm... ---"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    export PATH=$(npm prefix -g)/bin:$PATH
    pm2 startup
fi

echo "--- Starting rclone remote control daemon with web GUI using PM2... ---"
pm2 start "rclone rcd --rc-web-gui --rc-addr localhost:5572" --name rclone-web-gui
pm2 save

echo "--- Setup Complete! ---"
echo "Next steps:"
echo "1. Deploy the Web UI using the 'deploy_ui.sh' script."
echo "2. Configure all settings within the Web UI."
echo "3. Run 'rclone config' to set up your cloud storage remote."
echo "4. Run the initial 'icloudpd' command to authenticate with Apple."
echo "5. Enable the systemd timer to start the automated backend."
