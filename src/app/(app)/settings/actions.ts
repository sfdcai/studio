
"use server";

import { getSettings, saveSettings, generateAndSaveConfig } from "@/lib/settings";
import type { Settings } from "@/lib/types";
import { revalidatePath } from "next/cache";
import fs from 'fs/promises';
import path from 'path';

// Action for UI/AI settings that do NOT affect the backend config.conf
export async function handleSaveAppSettings(newSettings: Partial<Settings>): Promise<{success: boolean, message?: string}> {
  try {
    const currentSettings = await getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    await saveSettings(updatedSettings);

    let message = "Settings saved successfully.";

    // If the Google AI API key is provided, write it to the .env file.
    if (newSettings.googleAiApiKey) {
        try {
            const envPath = path.join(process.cwd(), '.env');
            await fs.writeFile(envPath, `GOOGLE_API_KEY=${newSettings.googleAiApiKey}\n`);
            message += " API Key updated. A server restart is required for it to take effect.";
        } catch (err) {
            console.error('Failed to write to .env file', err);
            return { success: false, message: 'Settings saved, but failed to write API key to .env file.' };
        }
    }
    
    // Revalidate paths that might be affected by these settings
    revalidatePath('/settings');
    revalidatePath('/summarize');
    
    return { success: true, message };
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

    // First, save all settings to the master settings.json file
    await saveSettings(updatedSettings);

    // Then, regenerate the config.conf for the backend scripts
    await generateAndSaveConfig(updatedSettings);
    
    revalidatePath('/settings');
    
    return { success: true, message: "Backend settings updated. The config.conf file has been regenerated." };
  } catch (error) {
    console.error("Failed to save backend settings:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `Failed to save settings: ${errorMessage}` };
  }
}
