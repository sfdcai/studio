'use server';

import fs from 'fs/promises';
import path from 'path';

export type Settings = {
  appName: string;
  isDarkMode: boolean;
  nasPath: string;
  drivePath: string;
  compression: number;
  year1Compression: string;
  year2Compression: string;
  year5Compression: string;
  preserveExif: boolean;
  icloudSync: boolean;
  icloudUser: string;
  icloudPass: string;
  dailyLimit: number;
  deleteYesterday: boolean;
};

const settingsFilePath = path.join(process.cwd(), 'settings.json');

const defaultSettings: Settings = {
  appName: "MediaFlow",
  isDarkMode: false,
  nasPath: "/mnt/nas/media/incoming",
  drivePath: "/Apps/MediaFlow/processed",
  compression: 60,
  year1Compression: "1080p",
  year2Compression: "720p",
  year5Compression: "640p",
  preserveExif: true,
  icloudSync: false,
  icloudUser: "",
  icloudPass: "",
  dailyLimit: 1000,
  deleteYesterday: false,
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
    // Merge with defaults to ensure all keys are present
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
