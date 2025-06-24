# Automated Media Management System

This project provides a complete, automated pipeline for managing a large personal media library. It combines a powerful set of backend shell scripts with a modern Next.js web interface for monitoring.

The system uses a Linux server to automatically download all photos and videos from an iCloud Photos account, deduplicates them against a central database, archives the originals to a local NAS, and uploads processed versions to a separate, reliable cloud archive (Google Drive).

## Features ✨

*   **Web UI Dashboard:** A modern Next.js interface to view the status of all files, see logs, and monitor processing in real-time.
*   **Server-Side Sync:** Backend scripts automatically pull all media directly from iCloud Photos.
*   **Database-Driven:** Uses an SQLite database as the single source of truth, tracking every file, its metadata, and processing status.
*   **Bulletproof Deduplication:** Calculates a unique hash for each file to prevent duplicates from ever entering your archive.
*   **Robust Automation:** Leverages `systemd` timers for reliable, scheduled execution of the entire download-and-process workflow.
*   **Reliable Cloud Archive:** Uploads processed media to Google Drive using `rclone`.

---

## Installation and Setup

The setup is divided into two parts: setting up the backend processing engine and deploying the frontend web UI.

### **Part 1: Backend Setup (Media Processing)**

These steps configure the server to automatically download and process your media files.

#### 1. Prerequisites

*   A Linux server (physical or virtual). This guide is tailored for **Ubuntu 22.04 LTS**.
*   A NAS or storage location accessible from the server.
*   `git` installed on the server to clone this repository.
*   Python 3 and `pip` (for the `icloudpd` backend script).

#### 2. Clone the Repository
```bash
git clone <your-repository-url>
cd your-repository-folder # e.g., cd automated-media-server
```

#### 3. Mount Your NAS
Before running the setup, ensure your main NAS storage is mounted on the server. The scripts assume it is mounted at a stable path (e.g., `/data/nas`).

#### 4. Create Your Configuration
Copy the example config file and edit it to match your environment. **You must add your Apple ID and configure your directory paths.**
```bash
cp config.conf.example config.conf
nano config.conf
```

#### 5. Run the Backend Environment Setup Script
This script installs all required software for media processing (`rclone`, `ffmpeg`, `icloudpd`, etc.) and initializes the database.
```bash
chmod +x setup_media_server.sh
sudo ./setup_media_server.sh
```

#### 6. Initial iCloud Authentication (CRITICAL STEP)
You must log in to iCloud interactively **once** to create a session cookie for the backend scripts.
```bash
# Run this command and follow the prompts for your password and 2FA code.
# Use the staging directory path from your config.conf
icloudpd --directory /data/nas/staging --username your_apple_id@email.com
```
Once it starts downloading, you can press `Ctrl+C`. The authentication session is now saved, and the automated scripts will be able to run non-interactively.

**Note:** This session will expire after a few weeks or months. You will need to run this command again when the automated script fails due to authentication errors.

#### 7. Configure Rclone
Run `rclone config` to set up your Google Drive remote (or any other cloud provider). Give it a name (e.g., `gdrive`). Make sure the `RCLONE_REMOTE` value in your `config.conf` matches the name you chose.

#### 8. Automate with `systemd`
This will configure the backend scripts to run automatically every hour.
```bash
# Move scripts to a system path
sudo cp run_all.sh process_media.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/run_all.sh /usr/local/bin/process_media.sh

# Copy systemd service/timer files
sudo cp systemd/media_processor.* /etc/systemd/system/
sudo nano /etc/systemd/system/media_processor.service # Edit ExecStart path if you changed it

# Enable and start the timer
sudo systemctl daemon-reload
sudo systemctl enable media_processor.timer
sudo systemctl start media_processor.timer
```

---

### **Part 2: Frontend Setup (Web UI Deployment)**

This section describes how to deploy the Next.js web application using the provided `deploy_ui.sh` script. This script automates the installation of Node.js, dependencies, and configures the `pm2` process manager to run the app in a production environment.

#### 1. Configure the Deployment Script
Before running the script, you must edit it to point to your repository.
```bash
nano deploy_ui.sh
```
Find the `REPO_URL` variable and change it to your repository's SSH URL.
```sh
# Before
REPO_URL="git@github.com:your_username/your_repo.git"

# After (example)
REPO_URL="git@github.com:your-name/automated-media-server.git"
```

#### 2. Run the Deployment Script
Execute the script as root. It will handle system updates, Node.js installation, cloning the repo, building the app, and running it with `pm2`.
```bash
chmod +x deploy_ui.sh
sudo ./deploy_ui.sh
```
The script will prompt you once to add the server's SSH key to your GitHub repository as a "Deploy Key". Follow the on-screen instructions.

#### 3. Accessing the UI
Once the script is finished, the application will be running on port 3000 by default (the standard for `npm start`). You can access it at `http://<your_server_ip>:3000`.

To manage the running application, you can use these `pm2` commands:
*   Check status: `sudo pm2 list`
*   View logs: `sudo pm2 logs mediaflow-app`
*   Restart the app: `sudo pm2 restart mediaflow-app`

---

## Usage Workflow 🚀

1.  **Let it Run:** The `systemd` timer will automatically trigger the backend scripts on its schedule to download and process new media.
2.  **Monitor the Dashboard:** Open the web UI in your browser (`http://<your_server_ip>:3000`) to see new files appear and their statuses change from `pending` to `success`. Check the **Logs** page for a live-aggregated view of the processing logs from the database.
