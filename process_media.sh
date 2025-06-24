#!/bin/bash
# ==============================================================================
#  process_media.sh
#  Processes media from a staging directory, updates a central SQLite DB,
#  archives originals, and queues processed files for upload.
# ==============================================================================
set -e

# --- Default Config Path ---
CONFIG_FILE_PATH="config.conf"

# --- Parse Command-Line Arguments ---
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --config-file) CONFIG_FILE_PATH="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

# --- Load Configuration File ---
if [ -f "$CONFIG_FILE_PATH" ]; {
    source "$CONFIG_FILE_PATH"
} else {
    echo "FATAL: Config file not found at $CONFIG_FILE_PATH. Exiting."
    exit 1
}
fi

# --- Log Function ---
log() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_DIR/processing_$(date +%Y-%m-%d).log"
}

log "--- Starting media processing run with limit: $PROCESS_LIMIT ---"
processed_count=0

# --- Main Processing Loop ---
# Find all media files in the staging directory, limit the number processed per run.
find "$STAGING_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.heic" -o -iname "*.mp4" -o -iname "*.mov" \) | head -n "$PROCESS_LIMIT" | while read -r file_path; do

    log "--- Processing file: $file_path ---"
    
    # 1. Deduplication Check
    file_hash=$(sha1sum "$file_path" | awk '{print $1}')
    file_name=$(basename "$file_path")

    existing_id=$(sqlite3 "$DB_PATH" "SELECT id FROM files WHERE file_hash = '$file_hash';")
    if [ -n "$existing_id" ]; then
        log "DUPLICATE: Hash $file_hash for file $file_name already exists. Deleting new file."
        sqlite3 "$DB_PATH" "UPDATE stats SET value = value + 1 WHERE key = 'duplicates_found';"
        rm "$file_path"
        continue
    fi

    # 2. Get metadata and insert into DB as 'pending'
    created_iso=$(exiftool -s -s -s -d "%Y-%m-%dT%H:%M:%S" -DateTimeOriginal "$file_path" || date -r "$file_path" -u +"%Y-%m-%dT%H:%M:%S")
    camera_model=$(exiftool -s -s -s -Model "$file_path" || echo "Unknown")
    original_size_mb=$(du -m "$file_path" | cut -f1)
    
    extension="${file_path##*.}"
    file_type="Image"
    if [[ "$extension" == "mov" || "$extension" == "mp4" ]]; then
        file_type="Video"
    fi

    log "NEW FILE: Inserting $file_name into database as pending."
    sqlite3 "$DB_PATH" "INSERT INTO files (file_hash, file_name, file_type, original_size_mb, status, camera, created_date, staging_path) VALUES ('$file_hash', '$file_name', '$file_type', $original_size_mb, 'pending', '$camera_model', '$created_iso', '$file_path');"
    file_id=$(sqlite3 "$DB_PATH" "SELECT last_insert_rowid();")
    
    # 3. Mark as processing
    sqlite3 "$DB_PATH" "UPDATE files SET status = 'processing' WHERE id = $file_id;"
    
    # 4. Simulate processing (compression, cloud syncs etc.)
    # In a real script, replace this section with your actual ffmpeg/rclone commands
    log "Simulating compression and cloud sync for file ID $file_id..."
    sleep 1 # Simulate work
    
    # Check if simulation should fail (e.g., 5% chance)
    if [ $(($RANDOM % 20)) -eq 0 ]; then
        log "ERROR: Simulated processing FAILED for file ID $file_id."
        sqlite3 "$DB_PATH" "UPDATE files SET status = 'failed' WHERE id = $file_id;"
        continue
    fi
    
    # 5. On success, update DB with final details
    compressed_size=$(echo "$original_size_mb * 0.6" | bc)
    now_iso=$(date -u +"%Y-%m-%dT%H:%M:%S")
    next_year_iso=$(date -d "+1 year" -u +"%Y-%m-%dT%H:%M:%S")
    
    log "SUCCESS: Marking file ID $file_id as successfully processed."
    sqlite3 "$DB_PATH" "
        UPDATE files 
        SET 
            status = 'success',
            compressed_size_mb = $compressed_size,
            last_compressed_date = '$now_iso',
            next_compression_date = '$next_year_iso',
            nas_backup_status = 1,
            gphotos_backup_status = 1,
            icloud_upload_status = 1
        WHERE id = $file_id;
    "
    
    # 6. Archive the processed file from staging
    mkdir -p "$ARCHIVE_DIR"
    mv "$file_path" "$ARCHIVE_DIR/"

    processed_count=$((processed_count + 1))
done

# --- Upload Step (Optional) ---
log "--- Starting cloud upload of processed files ---"
if [ -n "$(ls -A $PROCESSED_DIR 2>/dev/null)" ]; then
    # In a real script, you'd populate PROCESSED_DIR with compressed files
    # rclone copy "$PROCESSED_DIR" "$RCLONE_REMOTE:$RCLONE_DEST_PATH" --log-file="$LOG_DIR/rclone_$(date +%Y-%m-%d).log" -vv
    log "Simulating rclone upload. In a real script, files in $PROCESSED_DIR would be uploaded."
else
    log "No new files to upload."
fi

log "--- Media processing run finished ---"
