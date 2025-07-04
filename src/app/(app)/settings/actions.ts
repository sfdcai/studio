'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import type { Settings } from '@/lib/types';

const settingsFilePath = path.join(process.cwd(), 'settings.json');
const configFilePath = path.join(process.cwd(), 'config.conf');

const defaultSettings: Settings = {
  appName: "MediaFlow",
  isDarkMode: false,
  stagingDir: "/data/nas/staging",
  archiveDir: "/data/nas/archive",
  processedDir: "/data/nas/processed",
  errorDir: "/data/nas/error",
  logDir: "/data/nas/logs",
  dbPath: "media_library.sqlite",
  processLimit: 1000,
  jpgQualityMedium: 85,
  jpgQualityLow: 75,
  vidCRF1080p: 24,
  vidCRF720p: 26,
  vidCRF640p: 28,
  compressionEnabled: true,
};

async function ensureSettingsFileExists() {
  try {
    await fs.access(settingsFilePath);
  } catch {
    await fs.writeFile(settingsFilePath, JSON.stringify(defaultSettings, null, 2), 'utf-8');
  }
}

export async function getSettings(): Promise<Settings> {
  await ensureSettingsFileExists();
  try {
    const fileContent = await fs.readFile(settingsFilePath, 'utf-8');
    const loadedSettings = JSON.parse(fileContent);
    return { ...defaultSettings, ...loadedSettings };
  } catch (error) {
    console.error("Error reading settings file, returning defaults:", error);
    return defaultSettings;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await ensureSettingsFileExists();
  const settingsJson = JSON.stringify(settings, null, 2);
  await fs.writeFile(settingsFilePath, settingsJson, 'utf-8');
}

export async function generateAndSaveConfig(settings: Settings): Promise<void> {
    const absoluteDbPath = path.isAbsolute(settings.dbPath)
      ? settings.dbPath
      : path.join(process.cwd(), settings.dbPath);

    const configContent = `
# =================================================
#  Configuration for Media Processing Script
#  AUTO-GENERATED BY MediaFlow UI. DO NOT EDIT.
# =================================================

# --- Directory Paths ---
STAGING_DIR="${settings.stagingDir}"
ARCHIVE_DIR="${settings.archiveDir}"
PROCESSED_DIR="${settings.processedDir}"
ERROR_DIR="${settings.errorDir}"
LOG_DIR="${settings.logDir}"
DB_PATH="${absoluteDbPath}"

# --- Processing Limits ---
PROCESS_LIMIT="${settings.processLimit}"

# --- Feature Toggles ---
COMPRESSION_ENABLED="${settings.compressionEnabled}"

# --- Image Compression Quality (JPEG) ---
JPG_QUAL_MED="${settings.jpgQualityMedium}"
JPG_QUAL_LOW="${settings.jpgQualityLow}"

# --- Video Compression Quality (CRF for H.265) ---
VID_CRF_1080p="${settings.vidCRF1080p}"
VID_CRF_720p="${settings.vidCRF720p}"
VID_CRF_640p="${settings.vidCRF640p}"
`.trim();

    try {
        await fs.writeFile(configFilePath, configContent, 'utf-8');
    } catch (error) {
        console.error("Failed to generate and save config.conf:", error);
        throw new Error("Could not write backend configuration file. Check file permissions.");
    }
}


// Action for UI settings that do NOT affect the backend config.conf
export async function handleSaveAppSettings(newSettings: Partial<Settings>): Promise<{success: boolean, message?: string}> {
  try {
    const currentSettings = await getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    await saveSettings(updatedSettings);

    revalidatePath('/settings');
    
    return { success: true, message: "Settings saved successfully." };
  } catch (error) {
    console.error("Failed to save app settings:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `Failed to save settings: ${errorMessage}` };
  }
}

// Action specifically for backend settings that REQUIRE config.conf regeneration
export async function handleSaveBackendSettings(newSettings: Partial<Settings>): Promise<{success: boolean, message?: string}> {
  try {
    const currentSettings = await getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };

    await saveSettings(updatedSettings);
    await generateAndSaveConfig(updatedSettings);
    
    revalidatePath('/settings');
    
    return { success: true, message: "Backend settings updated. The config.conf file has been regenerated." };
  } catch (error) {
    console.error("Failed to save backend settings:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `Failed to save settings: ${errorMessage}` };
  }
}
