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
import { Switch } from "@/components/ui/switch"
import { KeyRound, Files, BarChart3, Settings as SettingsIcon, UploadCloud, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { type Settings, handleSaveAppSettings, handleSaveBackendSettings } from "./actions"
import { Separator } from "@/components/ui/separator"

type SettingsClientProps = {
  initialSettings: Settings
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const { toast } = useToast()

  const [settings, setSettings] = React.useState(initialSettings)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };
  
  const handleSwitchChange = (id: keyof Settings) => (checked: boolean) => {
    setSettings(prev => ({
        ...prev,
        [id]: checked
    }));
  };

  const onSaveBackend = async () => {
    const result = await handleSaveBackendSettings(settings);
    toast({
      title: result.success ? "Backend Settings Saved" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
  }

  const onSaveApp = async () => {
    const result = await handleSaveAppSettings(settings);
     toast({
      title: result.success ? "Settings Saved" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
  }

  return (
    <Tabs defaultValue="storage" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="storage">Storage & Backend</TabsTrigger>
        <TabsTrigger value="ai">AI</TabsTrigger>
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
              <Input id="appName" value={settings.appName} onChange={handleInputChange} />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="isDarkMode" checked={settings.isDarkMode} onCheckedChange={handleSwitchChange('isDarkMode')} />
              <Label htmlFor="isDarkMode">Dark Mode</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={onSaveApp}>Save General Settings</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="storage">
        <Card>
          <CardHeader>
            <CardTitle>Storage & Backend Configuration</CardTitle>
            <CardDescription>
              Manage paths, sync, and processing settings for the backend scripts. These settings regenerate `config.conf`.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Backend Paths */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Backend Paths</h3>
              <p className="text-sm text-muted-foreground">
                Absolute paths on the server where the backend scripts will operate.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="stagingDir">Staging Directory</Label>
                      <Input id="stagingDir" value={settings.stagingDir} onChange={handleInputChange} placeholder="/data/nas/staging"/>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="archiveDir">Archive Directory</Label>
                      <Input id="archiveDir" value={settings.archiveDir} onChange={handleInputChange} placeholder="/data/nas/archive"/>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="processedDir">Processed (for Upload) Directory</Label>
                      <Input id="processedDir" value={settings.processedDir} onChange={handleInputChange} placeholder="/data/nas/processed"/>
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="logDir">Log Directory</Label>
                      <Input id="logDir" value={settings.logDir} onChange={handleInputChange} placeholder="/data/nas/logs"/>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="dbPath">Database File Path</Label>
                      <Input id="dbPath" value={settings.dbPath} onChange={handleInputChange} placeholder="/root/mediaflow/media_library.sqlite"/>
                  </div>
              </div>
            </div>
            <Separator/>
            
            {/* Sync Services */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Sync Services</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4 p-4 border rounded-lg">
                         <h4 className="font-semibold">iCloud Photos</h4>
                         <div className="space-y-2">
                            <Label htmlFor="icloudUser">Apple ID</Label>
                            <Input id="icloudUser" placeholder="apple@id.com" value={settings.icloudUser} onChange={handleInputChange} />
                         </div>
                    </div>
                     <div className="space-y-4 p-4 border rounded-lg">
                         <h4 className="font-semibold">Rclone (Google Drive)</h4>
                         <div className="space-y-2">
                            <Label htmlFor="rcloneRemote">Rclone Remote Name</Label>
                            <Input id="rcloneRemote" value={settings.rcloneRemote} onChange={handleInputChange} placeholder="gdrive"/>
                         </div>
                         <div className="space-y-2">
                            <Label htmlFor="drivePath">Destination Path</Label>
                            <Input id="drivePath" value={settings.drivePath} onChange={handleInputChange} placeholder="My Media/Optimized"/>
                         </div>
                    </div>
                </div>
            </div>
            <Separator/>

            {/* Backend Processing */}
             <div className="space-y-4">
                <h3 className="text-lg font-medium">Backend Processing</h3>
                 <div className="space-y-2">
                    <Label htmlFor="processLimit">Process Limit Per Run</Label>
                    <Input id="processLimit" type="number" placeholder="1000" value={settings.processLimit} onChange={handleInputChange} className="max-w-xs" />
                    <p className="text-sm text-muted-foreground">
                        Maximum number of files to process in a single backend run.
                    </p>
                </div>
                <Separator/>
                 <div className="space-y-4 pt-4">
                    <h4 className="text-md font-medium">Feature Toggles</h4>
                     <p className="text-sm text-muted-foreground">
                        Disable features for debugging purposes. For example, turn off compression to quickly see if files are being discovered and added to the database.
                    </p>
                    <div className="flex items-center space-x-2">
                        <Switch id="compressionEnabled" checked={settings.compressionEnabled} onCheckedChange={handleSwitchChange('compressionEnabled')} />
                        <Label htmlFor="compressionEnabled" className="flex items-center gap-2">
                            <Zap className="h-4 w-4"/>
                            Enable Compression
                        </Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="uploadEnabled" checked={settings.uploadEnabled} onCheckedChange={handleSwitchChange('uploadEnabled')} />
                        <Label htmlFor="uploadEnabled" className="flex items-center gap-2">
                            <UploadCloud className="h-4 w-4"/>
                            Enable Cloud Upload
                        </Label>
                    </div>
                 </div>
                 <Separator/>
                 <div className="grid md:grid-cols-2 gap-6 pt-4">
                     <div className="space-y-4">
                        <h4 className="font-semibold">JPEG Quality (1-100)</h4>
                         <p className="text-xs text-muted-foreground">Quality for images older than 1 year. Higher is better.</p>
                         <div className="space-y-2">
                            <Label htmlFor="jpgQualityMedium">Medium Quality (1-5 Years)</Label>
                            <Input id="jpgQualityMedium" type="number" value={settings.jpgQualityMedium} onChange={handleInputChange}/>
                         </div>
                          <div className="space-y-2">
                            <Label htmlFor="jpgQualityLow">Low Quality (5+ Years)</Label>
                            <Input id="jpgQualityLow" type="number" value={settings.jpgQualityLow} onChange={handleInputChange}/>
                         </div>
                     </div>
                     <div className="space-y-4">
                         <h4 className="font-semibold">Video Quality (CRF)</h4>
                         <p className="text-xs text-muted-foreground">H.265 Constant Rate Factor. Lower is better quality. 18-28 is a sane range.</p>
                         <div className="space-y-2">
                            <Label htmlFor="vidCRF1080p">1080p CRF (0-1 Year)</Label>
                            <Input id="vidCRF1080p" type="number" value={settings.vidCRF1080p} onChange={handleInputChange}/>
                         </div>
                          <div className="space-y-2">
                            <Label htmlFor="vidCRF720p">720p CRF (1-5 Years)</Label>
                            <Input id="vidCRF720p" type="number" value={settings.vidCRF720p} onChange={handleInputChange}/>
                         </div>
                         <div className="space-y-2">
                            <Label htmlFor="vidCRF640p">640p CRF (5+ Years)</Label>
                            <Input id="vidCRF640p" type="number" value={settings.vidCRF640p} onChange={handleInputChange}/>
                         </div>
                     </div>
                 </div>
            </div>

          </CardContent>
          <CardFooter>
            <Button onClick={onSaveBackend}>Save Storage & Backend Settings</Button>
          </CardFooter>
        </Card>
      </TabsContent>
       <TabsContent value="ai">
        <Card>
          <CardHeader>
            <CardTitle>AI System Analysis</CardTitle>
            <CardDescription>
              Configure the AI assistant to analyze your system's health and performance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="googleAiApiKey">Google AI API Key</Label>
                <div className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-muted-foreground"/>
                    <Input id="googleAiApiKey" type="password" placeholder="Enter your Google AI API Key" value={settings.googleAiApiKey} onChange={handleInputChange}/>
                </div>
                <p className="text-xs text-muted-foreground">
                    Your API key is stored in the root .env file. A server restart is required for changes to take effect.
                </p>
            </div>
            <Separator />
            <div className="space-y-4">
                <h3 className="text-lg font-medium">AI Data Permissions</h3>
                <p className="text-sm text-muted-foreground">
                    Choose what data the AI is allowed to analyze to provide insights.
                </p>
                <div className="space-y-3 pt-2">
                    <div className="flex items-center space-x-3">
                        <Switch id="aiAllowMetadata" checked={settings.aiAllowMetadata} onCheckedChange={handleSwitchChange('aiAllowMetadata')} />
                        <Label htmlFor="aiAllowMetadata" className="flex items-center gap-2">
                            <Files className="h-4 w-4"/>
                            <span>Analyze File Metadata (names, sizes, dates, etc.)</span>
                        </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Switch id="aiAllowStats" checked={settings.aiAllowStats} onCheckedChange={handleSwitchChange('aiAllowStats')} />
                         <Label htmlFor="aiAllowStats" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4"/>
                            <span>Analyze Processing Statistics (errors, duplicates, space saved)</span>
                        </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Switch id="aiAllowSettings" checked={settings.aiAllowSettings} onCheckedChange={handleSwitchChange('aiAllowSettings')} />
                         <Label htmlFor="aiAllowSettings" className="flex items-center gap-2">
                            <SettingsIcon className="h-4 w-4"/>
                            <span>Analyze System Configuration (paths, compression levels)</span>
                        </Label>
                    </div>
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={onSaveApp}>Save AI Settings</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
