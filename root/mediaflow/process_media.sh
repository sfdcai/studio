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
if [ -f "$CONFIG_FILE_PATH" ]; then
    source "$CONFIG_FILE_PATH"
else
    echo "FATAL: Config file not found at $CONFIG_FILE_PATH. Exiting."
    exit 1
fi

# --- DB Log Function ---
db_log() {
    # Usage: db_log "INFO" "This is a message" $file_id
    local level="$1"
    local message="$2"
    local file_id_arg="$3" # This can be null for system-wide logs
    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S")

    # Escape single quotes in the message to prevent SQL errors
    local safe_message
    safe_message="${message//\'/\'\'}"

    if [ -n "$file_id_arg" ]; then
        sqlite3 "$DB_PATH" "INSERT INTO logs (file_id, timestamp, level, message) VALUES ($file_id_arg, '$timestamp', '$level', '$safe_message');"
    else
        sqlite3 "$DB_PATH" "INSERT INTO logs (timestamp, level, message) VALUES ('$timestamp', '$level', '$safe_message');"
    fi
}

db_log "INFO" "--- Starting media processing run with limit: $PROCESS_LIMIT ---"
db_log "INFO" "Config loaded. COMPRESSION_ENABLED is set to: '$COMPRESSION_ENABLED'"
processed_count=0

# Ensure directories exist
mkdir -p "$STAGING_DIR" "$ARCHIVE_DIR" "$PROCESSED_DIR" "$LOG_DIR" "$ERROR_DIR"
# Create parent directory for database if it doesn't exist
mkdir -p "$(dirname "$DB_PATH")"


# --- Main Processing Loop ---
# Find all media files in the staging directory, limit the number processed per run.
find "$STAGING_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.heic" -o -iname "*.mov" -o -iname "*.mp4" \) -print0 | head -z -n "$PROCESS_LIMIT" | while IFS= read -r -d $'\0' file_path; do

    db_log "INFO" "--- Found file: $file_path ---"
    
    # 1. Deduplication Check
    file_hash=$(sha1sum "$file_path" | awk '{print $1}')
    file_name=$(basename "$file_path")

    existing_id=$(sqlite3 "$DB_PATH" "SELECT id FROM files WHERE file_hash = '$file_hash';")
    if [ -n "$existing_id" ]; then
        db_log "WARN" "DUPLICATE: Hash $file_hash for file $file_name already exists. Deleting new file."
        sqlite3 "$DB_PATH" "UPDATE stats SET value = value + 1 WHERE key = 'duplicates_found';"
        rm "$file_path"
        continue
    fi

    # 2. Get metadata and insert into DB as 'pending'
    # Use a more robust method to get the creation date, trying multiple EXIF tags before falling back to the file's modification date.
    created_iso=$(exiftool -q -p '$CreateDate' -d "%Y-%m-%dT%H:%M:%S" "$file_path" 2>/dev/null || exiftool -q -p '$ModifyDate' -d "%Y-%m-%dT%H:%M:%S" "$file_path" 2>/dev/null || exiftool -q -p '$DateTimeOriginal' -d "%Y-%m-%dT%H:%M:%S" "$file_path" 2>/dev/null || date -r "$file_path" -u +"%Y-%m-%dT%H:%M:%S")
    camera_model=$(exiftool -q -p '$Model' "$file_path" 2>/dev/null || echo "Unknown")
    original_size_mb=$(du -m "$file_path" | cut -f1)
    
    extension="${file_path##*.}"
    lower_ext=$(echo "$extension" | tr '[:upper:]' '[:lower:]')
    file_type="Image"
    if [[ "$lower_ext" == "mov" || "$lower_ext" == "mp4" ]]; then
        file_type="Video"
    fi

    db_log "INFO" "NEW FILE: Inserting $file_name into database as pending."
    sqlite3 "$DB_PATH" "INSERT INTO files (file_hash, file_name, file_type, original_size_mb, status, camera, created_date, staging_path, archive_path, processed_path, error_log) VALUES ('$file_hash', '$file_name', '$file_type', $original_size_mb, 'pending', '$camera_model', '$created_iso', '$file_path', '', '', NULL);"
    file_id=$(sqlite3 "$DB_PATH" "SELECT last_insert_rowid();")
    
    # 3. Mark as processing
    sqlite3 "$DB_PATH" "UPDATE files SET status = 'processing' WHERE id = $file_id;"
    db_log "INFO" "Starting processing." "$file_id"
    db_log "INFO" "Checking compression setting. COMPRESSION_ENABLED='${COMPRESSION_ENABLED}'" "$file_id"
    
    # Check if compression is enabled
    if [ "$COMPRESSION_ENABLED" = "true" ]; then
        db_log "INFO" "Compression is enabled. Starting compression logic." "$file_id"
        # 4. Tiered Compression Logic
        capture_year=$(echo "$created_iso" | cut -d'-' -f1)
        current_year=$(date +'%Y')
        age=0 # Default age to 0 (highest quality)

        # Check if capture_year is a valid number before calculating age
        if [[ "$capture_year" =~ ^[0-9]+$ ]] && [ "$capture_year" -gt 1900 ] && [ "$capture_year" -le "$current_year" ]; then
             age=$((current_year - capture_year))
        else
            db_log "WARN" "Could not determine a valid capture year from metadata ('$created_iso'). Defaulting age to 0." "$file_id"
        fi
        
        output_path=""
        processing_command=""

        # Determine output path and standardize extension
        if [[ "$file_type" == "Image" ]]; then
            output_path="${PROCESSED_DIR}/$(basename "$file_name" ."$extension").jpg"
        else # Video
            output_path="${PROCESSED_DIR}/$(basename "$file_name" ."$extension").mp4"
        fi

        if [[ "$file_type" == "Image" ]]; then
            db_log "INFO" "Image processing. Age: $age years." "$file_id"
            if [ "$age" -le 1 ]; then # 0-1 years old
                processing_command="convert \"$file_path\" -quality 95 \"$output_path\""
            elif [ "$age" -le 5 ]; then # 2-5 years old
                processing_command="convert \"$file_path\" -quality \"$JPG_QUAL_MED\" \"$output_path\""
            else # 5+ years old
                processing_command="convert \"$file_path\" -quality \"$JPG_QUAL_LOW\" \"$output_path\""
            fi
        elif [[ "$file_type" == "Video" ]]; then
            db_log "INFO" "Video processing. Age: $age years." "$file_id"
            if [ "$age" -le 1 ]; then # 0-1 years old
                processing_command="ffmpeg -i \"$file_path\" -y -c:v libx265 -crf \"$VID_CRF_1080p\" -preset medium -vf \"scale='min(1920,iw)':-2\" -c:a aac -b:a 128k \"$output_path\""
            elif [ "$age" -le 5 ]; then # 2-5 years old
                processing_command="ffmpeg -i \"$file_path\" -y -c:v libx265 -crf \"$VID_CRF_720p\" -preset medium -vf \"scale='min(1280,iw)':-2\" -c:a aac -b:a 128k \"$output_path\""
            else # 5+ years old
                processing_command="ffmpeg -i \"$file_path\" -y -c:v libx265 -crf \"$VID_CRF_640p\" -preset medium -vf \"scale='min(960,iw)':-2\" -c:a aac -b:a 96k \"$output_path\""
            fi
        fi

        # Execute processing and capture stderr to a variable
        db_log "INFO" "Executing: $processing_command" "$file_id"
        error_output=$(eval "$processing_command" 2>&1)
        exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
            db_log "INFO" "SUCCESS: Processing complete for $file_name." "$file_id"
            
            # Get compressed size
            compressed_size_mb=$(du -m "$output_path" | cut -f1)
            now_iso=$(date -u +"%Y-%m-%dT%H:%M:%S")
            archive_file_path="$ARCHIVE_DIR/$(basename "$file_path")"

            # Update DB for success
            sqlite3 "$DB_PATH" "
                UPDATE files 
                SET 
                    status = 'success',
                    compressed_size_mb = $compressed_size_mb,
                    last_compressed_date = '$now_iso',
                    nas_backup_status = 1,
                    archive_path = '$archive_file_path',
                    processed_path = '$output_path'
                WHERE id = $file_id;
            "
            
            storage_saved=$((original_size_mb - compressed_size_mb))
            sqlite3 "$DB_PATH" "UPDATE stats SET value = value + $storage_saved WHERE key = 'storage_saved_mb';"

            # Archive the original file from staging
            mkdir -p "$ARCHIVE_DIR"
            mv "$file_path" "$ARCHIVE_DIR/"
            db_log "INFO" "Archived original to $archive_file_path" "$file_id"
            
        else
            escaped_error_output="${error_output//\'/\'\'}"
            db_log "ERROR" "ERROR: Processing command failed with exit code $exit_code. See error_log field for details." "$file_id"
            
            error_file_path="$ERROR_DIR/$(basename "$file_path")"
            mv "$file_path" "$error_file_path"
            
            sqlite3 "$DB_PATH" "UPDATE files SET status = 'failed', error_log = '$escaped_error_output', archive_path = '$error_file_path' WHERE id = $file_id;"
            sqlite3 "$DB_PATH" "UPDATE stats SET value = value + 1 WHERE key = 'processing_errors';"
            continue # Skip to next file
        fi
    else
        # Compression is disabled, so just archive and mark as success
        db_log "INFO" "Compression is disabled. Archiving original and marking as success." "$file_id"
        archive_file_path="$ARCHIVE_DIR/$(basename "$file_path")"
        now_iso=$(date -u +"%Y-%m-%dT%H:%M:%S")

        # Update DB for success (without compression details)
        sqlite3 "$DB_PATH" "
            UPDATE files 
            SET 
                status = 'success',
                last_compressed_date = '$now_iso',
                nas_backup_status = 1,
                archive_path = '$archive_file_path'
            WHERE id = $file_id;
        "
        
        # Archive the original file from staging
        mkdir -p "$ARCHIVE_DIR"
        mv "$file_path" "$ARCHIVE_DIR/"
        db_log "INFO" "Archived original to $archive_file_path" "$file_id"
    fi

    processed_count=$((processed_count + 1))
done

# --- Upload Step ---
# Check if upload is enabled
if [ "$UPLOAD_ENABLED" = "true" ]; then
    db_log "INFO" "--- Starting cloud upload of processed files ---"
    if [ -n "$(ls -A $PROCESSED_DIR 2>/dev/null)" ]; then
        # Using --log-file for rclone but also logging start/end to DB
        rclone_log_file="$LOG_DIR/rclone_$(date +%Y-%m-%d).log"
        db_log "INFO" "Rclone upload started. See log: $rclone_log_file"
        
        rclone copy "$PROCESSED_DIR" "$RCLONE_REMOTE:$RCLONE_DEST_PATH" --log-file="$rclone_log_file" -vv
        if [ $? -eq 0 ]; then
            db_log "INFO" "Rclone upload successful. Cleaning up processed files directory."
            
            # Find all files uploaded and update their DB status
            find "$PROCESSED_DIR" -type f -print0 | while IFS= read -r -d $'\0' uploaded_file; do
                # Find the corresponding file_id by matching the full processed_path
                escaped_uploaded_file="${uploaded_file//\'/\'\'}"
                target_file_id=$(sqlite3 "$DB_PATH" "SELECT id FROM files WHERE processed_path = '$escaped_uploaded_file';")
                if [ -n "$target_file_id" ]; then
                     sqlite3 "$DB_PATH" "UPDATE files SET gphotos_backup_status = 1 WHERE id = $target_file_id;"
                     db_log "INFO" "Updated cloud backup status for file ID $target_file_id" "$target_file_id"
                fi
            done
            rm -rf "$PROCESSED_DIR"/*
        else
            db_log "ERROR" "Rclone upload failed. Processed files are kept for next run."
        fi
    else
        db_log "INFO" "No new files to upload."
    fi
else
    db_log "INFO" "--- Cloud upload is disabled. Skipping. ---"
fi


db_log "INFO" "--- Media processing run finished. Processed $processed_count files. ---"
