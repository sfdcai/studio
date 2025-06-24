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
    bc

echo "--- Installing iCloudPD via pip... ---"
pip install --break-system-packages icloudpd

echo "--- Setup Complete! ---"
echo "Next steps:"
echo "1. Deploy the Web UI using the 'deploy_ui.sh' script."
echo "2. Configure all settings within the Web UI."
echo "3. Run 'rclone config' to set up your cloud storage remote."
echo "4. Run the initial 'icloudpd' command to authenticate with Apple."
echo "5. Enable the systemd timer to start the automated backend."
