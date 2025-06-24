"use server";

import { getSettings, saveSettings, type Settings, generateAndSaveConfig } from "@/lib/settings";
import { revalidatePath } from "next/cache";
import fs from 'fs/promises';
import path from 'path';

export type { Settings } from "@/lib/settings";

export async function handleSaveSettings(newSettings: Partial<Settings>): Promise<{success: boolean, message?: string}> {
  try {
    const currentSettings = await getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    await saveSettings(updatedSettings);

    let message = "Settings saved successfully.";

    // If backend-related settings are updated, regenerate the config file
    if ('stagingDir' in newSettings || 'icloudUser' in newSettings) {
        await generateAndSaveConfig(updatedSettings);
        message = "Storage and backend settings have been updated and config.conf file regenerated.";
    }

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
    
    revalidatePath('/settings');
    revalidatePath('/summarize');
    revalidatePath('/');
    
    return { success: true, message };
  } catch (error) {
    console.error("Failed to save settings:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message: `Failed to save settings: ${errorMessage}` };
  }
}
