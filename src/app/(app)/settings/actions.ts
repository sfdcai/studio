"use server";

import { getSettings, saveSettings, type Settings, generateAndSaveConfig } from "@/lib/settings";
import { revalidatePath } from "next/cache";

export type { Settings } from "@/lib/settings";

export async function handleSaveSettings(newSettings: Partial<Settings>): Promise<{success: boolean, message?: string}> {
  try {
    const currentSettings = await getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    await saveSettings(updatedSettings);
    await generateAndSaveConfig(updatedSettings);
    
    // Revalidate the path to ensure the settings page gets fresh data on next visit
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error("Failed to save settings:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `Failed to save settings: ${errorMessage}` };
  }
}
