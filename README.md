# Automated Media Management System

This project provides a complete, automated pipeline for managing a large personal media library. It uses a Linux server to automatically download all photos and videos from an iCloud Photos account, deduplicates them against a central database, applies age-based compression, archives the originals to a local NAS, and uploads the processed versions to a separate, reliable cloud archive (Google Drive).

## Features ✨

*   **Web UI Dashboard:** A modern Next.js interface to view the status of all files, see logs, and monitor processing.
*   **Server-Side Sync:** Automatically pulls all media directly from iCloud Photos.
*   **Database-Driven:** Uses an SQLite database to track every file, its metadata, and processing status.
*   **Bulletproof Deduplication:** Calculates a unique hash for each file to prevent duplicates from ever entering your archive.
*   **Tiered Compression:** Intelligently compresses older photos and videos to save cloud storage space while keeping originals safe.
*   **Robust Automation:** Leverages `systemd` timers for reliable, scheduled execution of the entire download-and-process workflow.
*   **Reliable Cloud Archive:** Uploads processed media to Google Drive, which has a stable, official API for management.

## Prerequisites

*   A Linux server (physical or virtual). This guide is tailored for **Ubuntu 22.04 LTS**.
*   A NAS or storage location accessible from the server.
*   `git` installed on the server to clone this repository.
*   Node.js (for the Next.js UI) and Python 3 + `pip` (for the backend scripts).

## Installation ⚙️

1.  **Clone the Repository**
    ```bash
    git clone <your-repository-url>
    cd automated-media-server
    ```

2.  **Mount Your NAS**
    Before running the setup, ensure your main NAS storage is mounted on the server. The scripts assume it is mounted at `/data/nas` (as an example).

3.  **Create Your Configuration**
    Copy the example config file and edit it to match your environment. **You must add your Apple ID to this file.**
    ```bash
    cp config.conf.example config.conf
    nano config.conf
    ```

4.  **Run the Setup Script**
    This script will install all required software (`rclone`, `ffmpeg`, `icloudpd`, etc.), create directories, and initialize the database.
    ```bash
    chmod +x setup_media_server.sh
    sudo ./setup_media_server.sh
    ```

5.  **Install Next.js Dependencies**
    ```bash
    npm install
    ```

6.  **Initial iCloud Authentication (CRITICAL STEP)**
    You must log in to iCloud interactively once to create a session cookie.
    ```bash
    # Run this command and follow the prompts for your password and 2FA code.
    # Use the staging directory path from your config.conf
    icloudpd --directory /data/nas/staging --username your_apple_id@email.com
    ```
    Once it starts downloading, you can press `Ctrl+C`. The session is now saved.

    **Note:** This session will expire after a few weeks/months. You will need to run this command again when the automated script fails due to authentication errors.

7.  **Configure Rclone**
    Run `rclone config` to set up your Google Drive remote (e.g., `gdrive`). Make sure the `RCLONE_REMOTE` value in your `config.conf` matches the name you give it.

## Automation with `systemd`

1.  **Copy the Scripts and Units**
    Move the scripts to a system path and copy the service/timer files to the `systemd` directory. Make sure to edit the `.service` file to point to the correct script path.
    ```bash
    sudo cp run_all.sh process_media.sh /usr/local/bin/
    sudo chmod +x /usr/local/bin/run_all.sh /usr/local/bin/process_media.sh
    sudo cp systemd/media_processor.* /etc/systemd/system/
    sudo nano /etc/systemd/system/media_processor.service # Edit the ExecStart path if needed
    ```

2.  **Enable and Start the Timer**
    This will start the timer and ensure it automatically runs on boot. By default, it runs 5 minutes after boot and then every hour.
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable media_processor.timer
    sudo systemctl start media_processor.timer
    ```

## Usage Workflow 🚀

1.  **Run the Next.js UI:**
    In a separate terminal, start the dashboard.
    ```bash
    npm run dev
    ```
    Open your browser to `http://localhost:9002`.

2.  **Let the Backend Run:** The `systemd` timer will automatically trigger the `run_all.sh` script on its schedule.
    *   **Phase 1 (Download):** `icloudpd` runs, downloading any new photos from iCloud into your `staging` directory.
    *   **Phase 2 (Process):** `process_media.sh` runs. It scans the staging directory, adds new files to the database, processes them, and archives them.
    *   **Phase 3 (Upload):** `rclone` uploads the queue to your Google Drive archive.

3.  **Monitor the Dashboard:** Refresh the web UI to see new files appear and their statuses change from `pending` to `success`. Check the logs page for detailed output.
