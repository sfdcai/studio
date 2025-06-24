"use client"

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

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
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
                <Input id="appName" defaultValue="MediaFlow" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="dark-mode" />
                <Label htmlFor="dark-mode">Dark Mode</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
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
                <Input id="nasPath" defaultValue="/mnt/nas/media/incoming" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drivePath">Google Drive Path</Label>
                <Input id="drivePath" defaultValue="/Apps/MediaFlow/processed" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compression">Initial Compression Level</Label>
                <div className="flex items-center space-x-4">
                    <span>Low</span>
                    <Slider id="compression" defaultValue={[60]} max={100} step={1} />
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
                        <Select defaultValue="1080p">
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
                        <Select defaultValue="720p">
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
                        <Select defaultValue="640p">
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
                    <Switch id="exif-transfer" defaultChecked />
                    <Label htmlFor="exif-transfer">Preserve EXIF Data</Label>
                </div>
                 <p className="text-sm text-muted-foreground pt-1">
                    Ensures all metadata like camera settings, location, and date are retained during compression.
                 </p>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-medium">iCloud Photos</h3>
                 <div className="flex items-center space-x-2">
                    <Switch id="icloud-sync" />
                    <Label htmlFor="icloud-sync">Enable iCloud Upload</Label>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="icloudUser">iCloud Username</Label>
                    <Input id="icloudUser" placeholder="apple@id.com" />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="icloudPass">App-Specific Password</Label>
                    <Input id="icloudPass" type="password" />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="daily-limit">Daily Upload Limit</Label>
                    <Input id="daily-limit" type="number" placeholder="e.g., 1000" defaultValue="1000" />
                    <p className="text-sm text-muted-foreground">
                      Set the maximum number of files to upload to iCloud each day.
                    </p>
                 </div>
                 <div className="flex items-center space-x-2">
                    <Switch id="delete-yesterday" />
                    <Label htmlFor="delete-yesterday">Delete Yesterday's Files Before Upload</Label>
                 </div>
                 <p className="text-sm text-muted-foreground pt-1">
                    Ensures a clean slate by removing files from the previous day's sync. Use with caution.
                 </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Storage Settings</Button>
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
                        <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
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
                    <Button variant="outline">Trigger Re-authentication</Button>
                </div>
            </CardContent>
            <CardFooter>
              <Button>Save Security Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
