import { getSettings } from "./actions";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      <SettingsClient 
        initialSettings={settings}
      />
    </div>
  )
}
