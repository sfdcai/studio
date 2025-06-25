
#!/bin/bash
# ==============================================================================
#  run_icloud_sync.sh
#  Script to download from iCloud using icloudpd.
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

# --- iCloud Download Step ---
# Check if icloudpd is installed AND if an Apple ID has been provided in the settings.
if command -v icloudpd &> /dev/null && [ -n "$APPLE_ID" ]; then
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
    if eval $icloudpd_cmd; then
        echo "--- iCloud Download finished successfully. ---"
    else
        # Don't exit the whole script on failure, just log it. The user might want to process local files anyway.
        echo "--- WARNING: iCloud Download FAILED. Likely requires re-authentication. ---"
        exit 1
    fi
else
    echo "--- ERROR: Skipping iCloud Download: 'icloudpd' command not found or Apple ID not configured. ---"
    exit 1
fi
