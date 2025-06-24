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

## Prerequisites

*   A Linux server (physical or virtual). This guide is tailored for **Ubuntu 22.04 LTS**.
*   A NAS or storage location accessible from the server.
*   `git` installed on the server to clone this repository.
*   Node.js (v18+) and `npm` (for the Next.js UI).
*   Python 3 and `pip` (for the `icloudpd` backend script).

## Installation ⚙️

Follow these steps on your Linux server.

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd automated-media-server
```

### 2. Mount Your NAS
Before running the setup, ensure your main NAS storage is mounted on the server. The scripts assume it is mounted at a stable path (e.g., `/data/nas`).

### 3. Create Your Configuration
Copy the example config file and edit it to match your environment. **You must add your Apple ID and configure your directory paths.**
```bash
cp config.conf.example config.conf
nano config.conf
```

### 4. Run the Setup Script
This script will install all required software (`rclone`, `ffmpeg`, `icloudpd`, etc.), create directories, and initialize the database.
```bash
chmod +x setup_media_server.sh
sudo ./setup_media_server.sh
```

### 5. Install Next.js Dependencies
This installs the packages needed for the web interface.
```bash
npm install
```

### 6. Initial iCloud Authentication (CRITICAL STEP)
You must log in to iCloud interactively **once** to create a session cookie for the backend scripts.
```bash
# Run this command and follow the prompts for your password and 2FA code.
# Use the staging directory path from your config.conf
icloudpd --directory /data/nas/staging --username your_apple_id@email.com
```
Once it starts downloading, you can press `Ctrl+C`. The authentication session is now saved, and the automated scripts will be able to run non-interactively.

**Note:** This session will expire after a few weeks or months. You will need to run this command again when the automated script fails due to authentication errors.

### 7. Configure Rclone
Run `rclone config` to set up your Google Drive remote (or any other cloud provider). Give it a name (e.g., `gdrive`). Make sure the `RCLONE_REMOTE` value in your `config.conf` matches the name you chose.

## Automation with `systemd`

1.  **Copy Scripts and Service Files**
    Move the scripts to a system path and copy the service/timer files to the `systemd` directory. Make sure to edit the `.service` file to point to the correct script path if you change it.
    ```bash
    sudo cp run_all.sh process_media.sh /usr/local/bin/
    sudo chmod +x /usr/local/bin/run_all.sh /usr/local/bin/process_media.sh
    sudo cp systemd/media_processor.* /etc/systemd/system/
    sudo nano /etc/systemd/system/media_processor.service # Edit ExecStart path if needed
    ```

2.  **Enable and Start the Timer**
    This will start the timer and ensure it automatically runs on boot. By default, it runs 5 minutes after boot and then every hour.
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable media_processor.timer
    sudo systemctl start media_processor.timer
    ```

## Usage Workflow 🚀

### 1. Run the Web UI
In a separate terminal on your server, start the Next.js dashboard.
```bash
# This will start the UI on port 9002 by default
npm run dev
```
Open a browser and navigate to `http://<your_server_ip>:9002`.

### 2. Let the Backend Run
The `systemd` timer will automatically trigger the `run_all.sh` script on its schedule.
*   **Phase 1 (Download):** `icloudpd` runs, downloading any new photos from iCloud into your `staging` directory.
*   **Phase 2 (Process):** `process_media.sh` runs. It scans the staging directory, adds new files to the database, processes them (simulated compression), and archives them.
*   **Phase 3 (Upload):** `rclone` uploads the queue to your Google Drive archive.

### 3. Monitor the Dashboard
Refresh the web UI to see new files appear and their statuses change from `pending` to `success`. Check the **Logs** page for detailed, aggregated output from the database.
