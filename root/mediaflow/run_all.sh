#!/bin/bash
# ==============================================================================
#  run_all.sh
#  Master script to download from iCloud and then trigger local processing.
# ==============================================================================
set -e
# Find the directory where this script and its config are located
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
CONFIG_FILE="$SCRIPT_DIR/config.conf"

if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
else
    echo "FATAL: config.conf not found. Exiting."
    exit 1
fi

echo "--- Starting iCloud Download Run ---"
echo "Username: $APPLE_ID"
echo "Download Directory: $STAGING_DIR"

# Build the icloudpd command
# Start with the base command
icloudpd_cmd="icloudpd --directory \"$STAGING_DIR\" --username \"$APPLE_ID\" --until-found 25"

# Only add the --folder-structure argument if the variable is not empty
if [ -n "$ICLOUD_FOLDER_STRUCTURE" ]; then
    icloudpd_cmd="$icloudpd_cmd --folder-structure \"$ICLOUD_FOLDER_STRUCTURE\""
fi

# Execute the command
eval $icloudpd_cmd

# Check if the download was successful (exit code 0)
if [ $? -eq 0 ]; then
    echo "--- iCloud Download finished successfully. Starting local processing... ---"
    # Now, execute the processing script
    "$SCRIPT_DIR/process_media.sh" --config-file "$CONFIG_FILE"
else
    echo "--- iCloud Download FAILED. Likely requires re-authentication. Aborting run. ---"
    exit 1
fi

echo "--- Full run complete ---"
