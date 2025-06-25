#!/bin/bash
set -e
echo "--- Starting Media Server Setup ---"

echo "--- Updating system and installing required packages... ---"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get upgrade -y
apt-get install -y \
    ffmpeg \
    imagemagick \
    exiftool \
    sqlite3 \
    git \
    python3-pip \
    bc \
    npm

echo "--- Installing PM2 globally via npm... ---"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    export PATH=$(npm prefix -g)/bin:$PATH
    pm2 startup
fi

echo "--- Setup Complete! ---"
echo "Next steps:"
echo "1. Deploy the Web UI using the 'deploy_ui.sh' script."
echo "2. Configure all settings within the Web UI."
echo "3. Place media in your staging directory."
echo "4. Go to the dashboard and click 'Run Processing'."
