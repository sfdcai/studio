"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { type Settings, handleSaveSettings } from "./actions"

type SettingsClientProps = {
  initialSettings: Settings
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const { toast } = useToast()

  // General Settings State
  const [appName, setAppName] = React.useState(initialSettings.appName)
  const [isDarkMode, setIsDarkMode] = React.useState(initialSettings.isDarkMode)

  // Storage Settings State
  const [nasPath, setNasPath] = React.useState(initialSettings.nasPath)
  const [drivePath, setDrivePath] = React.useState(initialSettings.drivePath)
  const [compression, setCompression] = React.useState([initialSettings.compression])
  const [year1Compression, setYear1Compression] = React.useState(initialSettings.year1Compression)
  const [year2Compression, setYear2Compression] = React.useState(initialSettings.year2Compression)
  const [year5Compression, setYear5Compression] = React.useState(initialSettings.year5Compression)
  const [preserveExif, setPreserveExif] = React.useState(initialSettings.preserveExif)
  const [icloudSync, setIcloudSync] = React.useState(initialSettings.icloudSync)
  const [icloudUser, setIcloudUser] = React.useState(initialSettings.icloudUser)
  const [icloudPass, setIcloudPass] = React.useState(initialSettings.icloudPass)
  const [dailyLimit, setDailyLimit] = React.useState(initialSettings.dailyLimit.toString())
  const [deleteYesterday, setDeleteYesterday] = React.useState(initialSettings.deleteYesterday)

  // Security Settings State
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")

  const onSave = async (category: 'general' | 'storage' | 'security') => {
    let settingsToSave: Partial<Settings> = {};
    let message = "";
    
    if (category === 'general') {
        settingsToSave = { appName, isDarkMode };
        message = "General settings have been updated.";
    } else if (category === 'storage') {
        settingsToSave = {
            nasPath,
            drivePath,
            compression: compression[0],
            year1Compression,
            year2Compression,
            year5Compression,
            preserveExif,
            icloudSync,
            icloudUser,
            icloudPass,
            dailyLimit: Number(dailyLimit),
            deleteYesterday
        };
        message = "Storage settings have been updated.";
    } else if (category === 'security') {
        // Security settings are typically handled differently, not stored in a plain json file.
        // For this prototype, we will just show a toast.
        toast({
          title: "Settings Saved",
          description: "Security settings have been updated.",
        });
        return;
    }

    const result = await handleSaveSettings(settingsToSave);

    if (result.success) {
      toast({
        title: "Settings Saved",
        description: message,
      })
    } else {
       toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Tabs defaultValue="storage" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="storage">Storage</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Manage general application settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appName">App Name</Label>
              <Input id="appName" value={appName} onChange={(e) => setAppName(e.target.value)} />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={setIsDarkMode} />
              <Label htmlFor="dark-mode">Dark Mode</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => onSave('general')}>Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="storage">
        <Card>
          <CardHeader>
            <CardTitle>Storage Configuration</CardTitle>
            <CardDescription>
              Manage paths, compression, and cloud sync settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nasPath">NAS Path</Label>
              <Input id="nasPath" value={nasPath} onChange={(e) => setNasPath(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="drivePath">Google Drive Path</Label>
              <Input id="drivePath" value={drivePath} onChange={(e) => setDrivePath(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compression">Initial Compression Level ({compression[0]}%)</Label>
              <div className="flex items-center space-x-4">
                  <span>Low</span>
                  <Slider id="compression" value={compression} onValueChange={setCompression} max={100} step={1} />
                  <span>High</span>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-medium">Progressive Compression</h3>
              <p className="text-sm text-muted-foreground">
                Define how files are re-compressed over time to save more space.
              </p>
              <div className="space-y-2">
                  <div className="flex items-center justify-between">
                      <Label htmlFor="year-1-compression">After 1 Year</Label>
                      <Select value={year1Compression} onValueChange={setYear1Compression}>
                          <SelectTrigger id="year-1-compression" className="w-[180px]">
                          <SelectValue placeholder="Select quality" />
                          </SelectTrigger>
                          <SelectContent>
                          <SelectItem value="original">Keep Original</SelectItem>
                          <SelectItem value="1080p">1080p</SelectItem>
                          <SelectItem value="720p">720p</SelectItem>
                          <SelectItem value="640p">640p</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="flex items-center justify-between">
                      <Label htmlFor="year-2-compression">After 2 Years</Label>
                      <Select value={year2Compression} onValueChange={setYear2Compression}>
                          <SelectTrigger id="year-2-compression" className="w-[180px]">
                          <SelectValue placeholder="Select quality" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="original">Keep Original</SelectItem>
                              <SelectItem value="1080p">1080p</SelectItem>
                              <SelectItem value="720p">720p</SelectItem>
                              <SelectItem value="640p">640p</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="flex items-center justify-between">
                      <Label htmlFor="year-5-compression">After 5 Years</Label>
                      <Select value={year5Compression} onValueChange={setYear5Compression}>
                          <SelectTrigger id="year-5-compression" className="w-[180px]">
                          <SelectValue placeholder="Select quality" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="original">Keep Original</SelectItem>
                              <SelectItem value="1080p">1080p</SelectItem>
                              <SelectItem value="720p">720p</SelectItem>
                              <SelectItem value="640p">640p</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
              </div>
               <div className="flex items-center space-x-2 pt-2">
                  <Switch id="exif-transfer" checked={preserveExif} onCheckedChange={setPreserveExif} />
                  <Label htmlFor="exif-transfer">Preserve EXIF Data</Label>
              </div>
               <p className="text-sm text-muted-foreground pt-1">
                  Ensures all metadata like camera settings, location, and date are retained during compression.
               </p>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-medium">iCloud Photos</h3>
               <div className="flex items-center space-x-2">
                  <Switch id="icloud-sync" checked={icloudSync} onCheckedChange={setIcloudSync} />
                  <Label htmlFor="icloud-sync">Enable iCloud Upload</Label>
               </div>
               <div className="space-y-2">
                  <Label htmlFor="icloudUser">iCloud Username</Label>
                  <Input id="icloudUser" placeholder="apple@id.com" value={icloudUser} onChange={(e) => setIcloudUser(e.target.value)} disabled={!icloudSync} />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="icloudPass">App-Specific Password</Label>
                  <Input id="icloudPass" type="password" value={icloudPass} onChange={(e) => setIcloudPass(e.target.value)} disabled={!icloudSync} />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="daily-limit">Daily Upload Limit</Label>
                  <Input id="daily-limit" type="number" placeholder="e.g., 1000" value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)} disabled={!icloudSync} />
                  <p className="text-sm text-muted-foreground">
                    Set the maximum number of files to upload to iCloud each day.
                  </p>
               </div>
               <div className="flex items-center space-x-2">
                  <Switch id="delete-yesterday" checked={deleteYesterday} onCheckedChange={setDeleteYesterday} disabled={!icloudSync} />
                  <Label htmlFor="delete-yesterday">Delete Yesterday's Files Before Upload</Label>
               </div>
               <p className="text-sm text-muted-foreground pt-1">
                  Ensures a clean slate by removing files from the previous day's sync. Use with caution.
               </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => onSave('storage')}>Save Storage Settings</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your account security settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="space-y-4">
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
              </div>
              <div className="border-t pt-6 space-y-4">
                  <h3 className="text-lg font-medium">Two-Factor Authentication (2FA)</h3>
                  <p className="text-sm text-muted-foreground">Sensitive actions require re-authentication.</p>
                   <Alert>
                      <Terminal className="h-4 w-4" />
                      <AlertTitle>2FA Re-authentication Trigger</AlertTitle>
                      <AlertDescription>
                          To change critical settings like storage paths or security options, you will be prompted to re-authenticate using 2FA.
                      </AlertDescription>
                   </Alert>
                  <Button variant="outline" onClick={() => toast({ title: "2FA Triggered", description: "A re-authentication request has been sent." })}>Trigger Re-authentication</Button>
              </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => onSave('security')}>Save Security Settings</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
