# MediaFlow - Automated Media Management System

This project provides a complete, automated pipeline for managing a large personal media library. It combines a powerful set of backend shell scripts with a modern Next.js web interface for monitoring and configuration.

The system uses a Linux server to automatically download photos and videos from an iCloud Photos account, deduplicates them against a central database, archives the originals to a local NAS, and uploads processed versions to a separate, reliable cloud archive (Google Drive).

## Features ✨

*   **Web UI Dashboard:** A modern Next.js interface to view the status of all files, see logs, and monitor processing in real-time.
*   **Centralized Configuration:** Manage all backend script settings directly from the web UI.
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

#### 2. Run the Backend Environment Setup Script
Execute the `setup_media_server.sh` script. This script installs all required software for media processing (`rclone`, `ffmpeg`, `icloudpd`, etc.) and initializes the database.
```bash
# Clone the repository first if you haven't already
# git clone <your-repository-url>
# cd your-repository-folder

chmod +x setup_media_server.sh
sudo ./setup_media_server.sh
```

#### 3. Initial iCloud Authentication (CRITICAL STEP)
Before the automated scripts can work, you must log in to iCloud interactively **once** to create a session cookie. You will need to know your iCloud staging directory path, which you will configure in the Web UI in Part 2.
```bash
# Run this command and follow the prompts for your password and 2FA code.
# Use the staging directory path you plan to set in the UI (e.g., /data/nas/staging)
icloudpd --directory /path/to/your/staging_dir --username your_apple_id@email.com
```
Once it starts downloading, you can press `Ctrl+C`. The authentication session is now saved, and the automated scripts will be able to run non-interactively.

**Note:** This session may expire after a few weeks or months. You will need to run this command again when the automated script fails due to authentication errors.

#### 4. Configure Rclone
Run `rclone config` to set up your Google Drive remote (or any other cloud provider). Give it a name (e.g., `gdrive`). You will enter this name in the Web UI settings.

---

### **Part 2: Frontend Setup & Configuration (Web UI)**

This section describes how to deploy the Next.js web application and configure the entire system.

#### 1. Quick Start: Initial Deployment
To set up the Web UI on a fresh server, you can use the following command. It downloads the deployment script from your repository, makes it executable, and starts the automated setup process.

```bash
# Ensure you are in the directory where you want to clone the project
wget https://raw.githubusercontent.com/<your_github_user>/<your_repo>/main/deploy_ui.sh
chmod +x deploy_ui.sh
sudo ./deploy_ui.sh
```

The script will handle system updates, Node.js installation, cloning the repository, building the app, and running it with `pm2`. It will prompt you once to add the server's SSH key to your GitHub repository as a "Deploy Key". Follow the on-screen instructions.

#### 2. Configure the System via the Web UI
Once the script is finished, the application will be running.
*   **Access the UI:** Open your browser to `http://<your_server_ip>:3000`.
*   **Navigate to Settings:** Go to the "Settings" page in the application.
*   **Fill Out All Fields:** Carefully fill out all the settings, especially the "Backend Paths" and "Sync Services" sections. The paths you enter here **must** match the directories available on your server.
*   **Save Settings:** Click "Save Storage & Backend Settings". This will create the `config.conf` file in your project directory that the backend scripts need to run.

#### 3. Automate Backend Jobs with `systemd`
Now that the `config.conf` has been generated by the UI, you can enable the automated backend scripts.

```bash
# Copy systemd service/timer files from your project directory
# (Assuming you add them to your repo)
# sudo cp systemd/media_processor.* /etc/systemd/system/

# Enable and start the timer
sudo systemctl daemon-reload
sudo systemctl enable media_processor.timer
sudo systemctl start media_processor.timer
```

---

### **Part 3: Updating the Application**
When you make changes to the application code and push them to your GitHub repository, you need to update the running application on your server.

> **Important Note:** Your server runs a local copy of the code. Pushing changes to GitHub does **not** automatically update the live application. You must run the restart command below to see your changes.

1.  **Push your code changes** to your main branch on GitHub.
2.  **Connect to your server** via SSH.
3.  **Navigate to the project location** (`/root/mediaflow`).
4.  **Run the restart command:**
    ```bash
    sudo ./deploy_ui.sh --restart
    ```
This command safely pulls the latest code from GitHub, reinstalls any new dependencies, rebuilds the Next.js application, and gracefully restarts it using `pm2`.

---

## Project Structure

The entire application is installed in `/root/mediaflow/` on your server. This folder acts as the project root. All application code, backend scripts, and configuration files live here.

```
/root/mediaflow/
├── src/                      # Source code for the Next.js Web UI
│   ├── app/                  # All UI pages and routes (Dashboard, Files, etc.)
│   ├── components/           # Reusable UI components (e.g., cards, buttons)
│   ├── lib/                  # Core application logic (database queries, settings management)
│   └── ai/                   # AI-related code (Genkit flows)
│
├── config.conf               # !!! IMPORTANT: Auto-generated by the UI for the backend scripts to use.
├── settings.json             # !!! IMPORTANT: The master file where the UI saves your settings.
│
├── deploy_ui.sh              # The main script to deploy or restart the Web UI.
├── run_all.sh                # The master script to run the full backend job (download + process).
├── process_media.sh          # The script that handles media compression, archiving, etc.
├── setup_media_server.sh     # The script for initial server setup.
│
├── media_library.sqlite      # The default location for the SQLite database file.
├── package.json              # Defines the project and its Node.js dependencies.
└── README.md                 # This documentation file.
```

### Configuration & Execution Flow

The configuration process is designed to be managed entirely from the web interface:

1.  You change settings in the **Web UI**.
2.  Saving those settings updates the `settings.json` file.
3.  Saving "Storage & Backend" settings also regenerates the `config.conf` file.
4.  When you click "Run Manual Sync" or when the automated timer runs, the backend scripts (`run_all.sh`, `process_media.sh`) read their instructions directly from that `config.conf` file. The UI executes the scripts located within its own project directory (`/root/mediaflow`).
