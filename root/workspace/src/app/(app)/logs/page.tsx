import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getAllLogs } from "@/lib/data"

export const revalidate = 0; // Disable caching

const LogLevelBadge = ({ level }: { level: string }) => {
  const variant = {
    "INFO": "default",
    "WARN": "secondary",
    "ERROR": "destructive",
  }[level] ?? "outline"

  return <Badge variant={variant as any} className="w-16 justify-center">{level}</Badge>
}

export default async function LogsPage() {
  const logs = await getAllLogs();

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Log Viewer</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
          <CardDescription>Displaying the last 500 log entries from the database.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] w-full rounded-md border">
            <div className="p-4 font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-4 mb-2">
                  <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
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
