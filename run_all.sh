#!/bin/bash
# ==============================================================================
#  run_all.sh
#  Master script to run the local media processing.
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
echo "--- Starting local media processing... ---"
if "$SCRIPT_DIR/process_media.sh" --config-file "$CONFIG_FILE"; then
    echo "--- Local processing finished successfully. ---"
else
    echo "--- FATAL: Local processing script failed. Check logs for details. ---"
    exit 1
fi


echo "--- Full run complete ---"
