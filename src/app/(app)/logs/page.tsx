import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getMediaFiles, type MediaFile } from "@/lib/data"

const generateLogs = (data: MediaFile[]) => {
  const allLogs: { level: string, message: string, timestamp: string }[] = [];
  
  data.forEach(file => {
      const fileName = file.fileName;
      const baseTimestamp = new Date(file.createdDate);

      const addLog = (level: string, message: string, offsetSeconds: number) => {
        const timestamp = new Date(baseTimestamp.getTime() + offsetSeconds * 1000).toISOString();
        allLogs.push({ level, message, timestamp });
      };

      addLog("INFO", `Found new file: ${fileName}`, 1);
      addLog("INFO", `Starting processing for ${fileName}.`, 2);

      switch(file.status) {
          case 'success':
              addLog("INFO", `Compression successful for ${fileName}. Saved ${(file.originalSize - file.compressedSize).toFixed(2)} MB.`, 5);
              if (file.googlePhotosBackup) {
                  addLog("INFO", `Uploading to Google Photos for ${fileName}.`, 6);
                  addLog("INFO", `Upload to Google Photos successful for ${fileName}.`, 10);
              }
              if (file.icloudUpload) {
                  addLog("INFO", `Uploading to iCloud for ${fileName}.`, 11);
                  addLog("INFO", `Upload to iCloud successful for ${fileName}.`, 15);
              } else {
                  addLog("WARN", `iCloud sync disabled. Skipping iCloud upload for ${fileName}.`, 11);
              }
              addLog("INFO", `Processing complete for ${fileName}.`, 16);
              break;
          case 'failed':
               addLog("ERROR", `Compression failed for ${fileName}: Processing error.`, 5);
               addLog("INFO", `Moving ${fileName} to error directory.`, 6);
              break;
          case 'processing':
              addLog("INFO", `Compression in progress for ${fileName}...`, 5);
              break;
          case 'pending':
              addLog("INFO", `File ${fileName} is queued for processing.`, 3);
              break;
      }
  });

  return allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

const LogLevelBadge = ({ level }: { level: string }) => {
  const variant = {
    "INFO": "default",
    "WARN": "secondary",
    "ERROR": "destructive",
  }[level] ?? "outline"

  return <Badge variant={variant as any} className="w-16 justify-center">{level}</Badge>
}

export default async function LogsPage() {
  const data = await getMediaFiles();
  const logs = generateLogs(data);

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
                <div key={index} className="flex items-start gap-4 mb-2">
                  <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <LogLevelBadge level={log.level} />
                  <span className="flex-1 break-all">{log.message}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
