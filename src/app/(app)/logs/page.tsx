import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

const logs = [
  { level: "INFO", message: "Service started successfully.", timestamp: "2023-10-29T10:00:00Z" },
  { level: "INFO", message: "Watching for new files in /mnt/nas/photos.", timestamp: "2023-10-29T10:00:01Z" },
  { level: "INFO", message: "Found new file: IMG_20231029_100512.jpg", timestamp: "2023-10-29T10:05:13Z" },
  { level: "INFO", message: "Starting compression for IMG_20231029_100512.jpg.", timestamp: "2023-10-29T10:05:14Z" },
  { level: "INFO", message: "Compression successful. Saved 4.2 MB.", timestamp: "2023-10-29T10:05:18Z" },
  { level: "INFO", message: "Uploading to Google Drive.", timestamp: "2023-10-29T10:05:19Z" },
  { level: "INFO", message: "Upload to Google Drive successful.", timestamp: "2023-10-29T10:05:25Z" },
  { level: "WARN", message: "iCloud credentials not set. Skipping iCloud upload.", timestamp: "2023-10-29T10:05:26Z" },
  { level: "INFO", message: "Processing complete for IMG_20231029_100512.jpg.", timestamp: "2023-10-29T10:05:27Z" },
  { level: "INFO", message: "Found new file: VID_20231029_111045.mp4", timestamp: "2023-10-29T11:10:46Z" },
  { level: "INFO", message: "Starting compression for VID_20231029_111045.mp4.", timestamp: "2023-10-29T11:10:47Z" },
  { level: "ERROR", message: "Compression failed: Invalid codec.", timestamp: "2023-10-29T11:10:55Z" },
  { level: "INFO", message: "Moving VID_20231029_111045.mp4 to error directory.", timestamp: "2023-10-29T11:10:56Z" },
  { level: "INFO", message: "Watching for new files...", timestamp: "2023-10-29T11:11:00Z" },
  { level: "INFO", message: "Service started successfully.", timestamp: "2023-10-29T10:00:00Z" },
  { level: "INFO", message: "Watching for new files in /mnt/nas/photos.", timestamp: "2023-10-29T10:00:01Z" },
  { level: "INFO", message: "Found new file: IMG_20231029_100512.jpg", timestamp: "2023-10-29T10:05:13Z" },
  { level: "INFO", message: "Starting compression for IMG_20231029_100512.jpg.", timestamp: "2023-10-29T10:05:14Z" },
  { level: "INFO", message: "Compression successful. Saved 4.2 MB.", timestamp: "2023-10-29T10:05:18Z" },
  { level: "INFO", message: "Uploading to Google Drive.", timestamp: "2023-10-29T10:05:19Z" },
  { level: "INFO", message: "Upload to Google Drive successful.", timestamp: "2023-10-29T10:05:25Z" },
  { level: "WARN", message: "iCloud credentials not set. Skipping iCloud upload.", timestamp: "2023-10-29T10:05:26Z" },
  { level: "INFO", message: "Processing complete for IMG_20231029_100512.jpg.", timestamp: "2023-10-29T10:05:27Z" },
  { level: "INFO", message: "Found new file: VID_20231029_111045.mp4", timestamp: "2023-10-29T11:10:46Z" },
  { level: "INFO", message: "Starting compression for VID_20231029_111045.mp4.", timestamp: "2023-10-29T11:10:47Z" },
  { level: "ERROR", message: "Compression failed: Invalid codec.", timestamp: "2023-10-29T11:10:55Z" },
  { level: "INFO", message: "Moving VID_20231029_111045.mp4 to error directory.", timestamp: "2023-10-29T11:10:56Z" },
  { level: "INFO", message: "Watching for new files...", timestamp: "2023-10-29T11:11:00Z" },
]

const LogLevelBadge = ({ level }: { level: string }) => {
  const variant = {
    "INFO": "default",
    "WARN": "secondary",
    "ERROR": "destructive",
  }[level] ?? "outline"

  return <Badge variant={variant as any} className="w-16 justify-center">{level}</Badge>
}

export default function LogsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Log Viewer</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] w-full">
            <div className="p-4 font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="flex items-center gap-4 mb-2">
                  <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <LogLevelBadge level={log.level} />
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
