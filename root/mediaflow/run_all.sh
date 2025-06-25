#!/bin/bash
# ==============================================================================
#  run_all.sh
#  Master script to run local processing. The iCloud download is now separate.
# ==============================================================================
set -e
# Find the directory where this script and its config are located
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
CONFIG_FILE="$SCRIPT_DIR/config.conf"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "FATAL: config.conf not found. Exiting."
    exit 1
fi

# --- Local Processing Step ---
# This script now ONLY processes files. iCloud sync is handled by run_icloud_sync.sh
echo "--- Starting local media processing... ---"
if "$SCRIPT_DIR/process_media.sh" --config-file "$CONFIG_FILE"; then
    echo "--- Local processing finished successfully. ---"
else
    echo "--- FATAL: Local processing script failed. Check logs for details. ---"
    exit 1
fi


echo "--- Full run complete ---"
