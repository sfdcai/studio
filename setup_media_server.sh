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
pip install icloudpd

# Get the directory of the script to reliably find the config file.
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
CONFIG_FILE="$SCRIPT_DIR/config.conf"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "WARNING: config.conf not found. Copying example. Please edit it."
    cp config.conf.example config.conf
fi

source "$CONFIG_FILE"

echo "--- Creating directory structure from config... ---"
mkdir -p "$STAGING_DIR" "$ARCHIVE_DIR" "$PROCESSED_DIR" "$LOG_DIR"
mkdir -p "$(dirname "$DB_PATH")"

echo "--- Initializing SQLite Database ---"
if [ ! -f "$DB_PATH" ]; then
    echo "Database not found. Creating schema at $DB_PATH..."
    sqlite3 "$DB_PATH" "
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_hash TEXT NOT NULL UNIQUE,
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        original_size_mb REAL NOT NULL,
        compressed_size_mb REAL,
        status TEXT NOT NULL DEFAULT 'pending',
        camera TEXT,
        created_date TEXT NOT NULL,
        last_compressed_date TEXT,
        next_compression_date TEXT,
        nas_backup_status INTEGER DEFAULT 0,
        gphotos_backup_status INTEGER DEFAULT 0,
        icloud_upload_status INTEGER DEFAULT 0,
        staging_path TEXT
      );
      CREATE TABLE IF NOT EXISTS stats (
        key TEXT PRIMARY KEY,
        value INTEGER NOT NULL DEFAULT 0
      );
      INSERT OR IGNORE INTO stats (key, value) VALUES ('duplicates_found', 0);
    "
else
    echo "Database already exists. Skipping creation."
fi


echo "--- Setup Complete! ---"
echo "Next steps:"
echo "1. Edit 'config.conf' with your actual paths and Apple ID."
echo "2. Run 'rclone config' to set up your Google Drive remote."
echo "3. Run the initial 'icloudpd' command to authenticate with Apple."
