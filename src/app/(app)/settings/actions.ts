"use server";

import { getSettings, saveSettings, type Settings } from "@/lib/settings";

export type { Settings } from "@/lib/settings";

export async function handleSaveSettings(newSettings: Partial<Settings>): Promise<{success: boolean, message?: string}> {
  try {
    const currentSettings = await getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    await saveSettings(updatedSettings);
    return { success: true };
  } catch (error) {
    console.error("Failed to save settings:", error);
    return { success: false, message: "Failed to save settings. Please check server logs." };
  }
}
