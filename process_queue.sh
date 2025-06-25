shell
#!/bin/bash

PROCESSING_QUEUE_DIR="/workspace/media/processing_queue"
READY_TO_SYNC_DIR="/workspace/media/ready_to_sync"
PROCESSING_STATUS_FILE="/workspace/media/processing_status.json"
LOG_FILE="/workspace/media/logs/processing.log"
PROCESSED_NAS_ARCHIVE_DIR="/workspace/media/nas_archive/processed" # Define processed archive directory

mkdir -p "$(dirname "$LOG_FILE")" # Create logs directory if it doesn't exist
mkdir -p "$PROCESSED_NAS_ARCHIVE_DIR" # Create processed archive directory if it doesn't exist
mkdir -p "$READY_TO_SYNC_DIR" # Ensure ready to sync directory exists

# Logging function
log_message() {
  local level="$1"
  local message="$2"
  echo "$(date '+%Y-%m-%d %H:%M:%S') [$level] $message" >> "$LOG_FILE"
}

# Redirect stderr to log file for commands within the loop
# exec 2> >(while read line; do log_message ERROR "Stderr: $line"; done) # Temporarily disable this to capture specific stderr
# Iterate through files in the processing queue
queue_empty="true"
ERROR_DIR="/workspace/media/error" # Define error directory inside the loop
for file in "$PROCESSING_QUEUE_DIR"/*; do
  # Check if it's a file and not a directory
  # Using -f to check if it's a regular file
  if [ -f "$file" ]; then
    queue_empty=false
    filename=$(basename "$file")

    # Write current file being processed to status file
    echo "$(date '+%Y-%m-%d %H:%M:%S') Processing started for: $filename"
    echo "{\"currentFile\": \"$filename\"}" > "$PROCESSING_STATUS_FILE"
    log_message INFO "Processing started for: $filename"

    # Run ffmpeg to convert to libx265 and scale
    output_file="${READY_TO_SYNC_DIR}/$filename"
    ffmpeg_output=$(ffmpeg -i "$file" -c:v libx265 -vf "scale=1280:-2" "$output_file" 2>&1)
    ffmpeg_exit_code=$? # Capture exit code immediately after command

    # Check exit code of ffmpeg command
    if [ "$ffmpeg_exit_code" -ne 0 ]; then
      # Move problematic file to error directory
      mv "$file" "$ERROR_DIR/"
      # Write error details to a log file in the error directory
      echo "FFmpeg processing failed for $filename with exit code $ffmpeg_exit_code." > "${ERROR_DIR}/$(basename "$file").log"
      echo "FFmpeg output (stderr):" >> "${ERROR_DIR}/$(basename "$file").log"
      log_message ERROR "Moved $filename to $ERROR_DIR/ due to ffmpeg error."
      echo "$(date '+%Y-%m-%d %H:%M:%S') Error processing $filename with ffmpeg."
      log_message ERROR "Error processing $filename with ffmpeg. Exit code: $ffmpeg_exit_code. Output:\n$ffmpeg_output"
      continue # Skip to the next file on processing error
    fi

    echo "$(date '+%Y-%m-%d %H:%M:%S') Extracting metadata for: $filename"
    log_message INFO "Extracting metadata for: $filename"
    # Extract metadata using ffprobe and save to JSON file
 metadata_output_file="${READY_TO_SYNC_DIR}/$(basename "$file").json" # Use .json extension
    # Capture ffprobe output for detailed error logging
    ffprobe_output=$(ffprobe -v quiet -print_format json -show_format -show_streams "$file" > "$metadata_output_file" 2>&1)
    ffprobe_exit_code=$? # Capture exit code immediately after command

    # Check exit code of ffprobe command
    if [ "$ffprobe_exit_code" -ne 0 ]; then
      # Move problematic file to error directory
      mv "$file" "$ERROR_DIR/"
      # Write error details to a log file in the error directory
      echo "FFprobe metadata extraction failed for $filename with exit code $ffprobe_exit_code." > "${ERROR_DIR}/$(basename "$file").log"
      echo "FFprobe output (stderr):" >> "${ERROR_DIR}/$(basename "$file").log"
      log_message ERROR "Moved $filename to $ERROR_DIR/ due to ffprobe error."
      log_message ERROR "Error extracting metadata for $filename with ffprobe. Exit code: $ffprobe_exit_code. Output:\n$ffprobe_output"
      # Clean up the partially processed file in ready_to_sync if metadata extraction fails
      rm -f "$output_file"
      continue # Skip to the next file on metadata extraction error
    fi
    
    # Move the original file to the processed archive directory
    mv "$file" "$PROCESSED_NAS_ARCHIVE_DIR/"
    if [ $? -ne 0 ]; then
      echo "$(date '+%Y-%m-%d %H:%M:%S') Error moving original $filename to $PROCESSED_NAS_ARCHIVE_DIR."
      log_message ERROR "Error moving original $filename to $PROCESSED_NAS_ARCHIVE_DIR/. Exit code: $?"
    fi # Continue even if move to archive fails, as the processed file is in ready_to_sync

    echo "$(date '+%Y-%m-%d %H:%M:%S') Successfully processed and moved: $filename"
    log_message INFO "Successfully processed and moved: $filename"
  fi
done

if [ "$queue_empty" == "true" ]; then
  # Remove status file if the queue is empty
  rm -f "$PROCESSING_STATUS_FILE"
  log_message INFO "Processing queue is empty. Removed status file."
fi

echo "Processing queue check complete."
