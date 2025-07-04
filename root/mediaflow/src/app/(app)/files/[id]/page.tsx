import { getMediaFile, getLogsForFile } from "@/lib/data";
import type { LogEntry } from "@/lib/types";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Camera, Clock, HardDrive, Zap, Tag, History, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export const revalidate = 0; // Disable caching

const DetailRow = ({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) => (
  <>
    <div className="flex items-center justify-between py-3">
      <span className="text-muted-foreground flex items-center gap-2 text-sm">
        {icon}
        {label}
      </span>
      <span className="font-medium text-sm text-right">{children}</span>
    </div>
    <Separator />
  </>
);

const StatusRow = ({ icon, label, status }: { icon: React.ReactNode, label: string, status: boolean }) => (
    <>
      <div className="flex items-center justify-between py-3">
        <span className="text-muted-foreground flex items-center gap-2 text-sm">
          {icon}
          {label}
        </span>
        <Badge variant={status ? "default" : "secondary"}>
          {status ? "Archived" : "Pending"}
        </Badge>
      </div>
      <Separator />
    </>
);

const LogLevelBadge = ({ level }: { level: string }) => {
    const variant = {
      "INFO": "default",
      "WARN": "secondary",
      "ERROR": "destructive",
    }[level] ?? "outline"
  
    return <Badge variant={variant as any} className="w-16 justify-center">{level}</Badge>
}

const generateProcessingHistoryFromLogs = (logs: LogEntry[]) => {
    return logs.map(log => ({
        status: log.message,
        timestamp: new Date(log.timestamp).toLocaleString()
    }));
}


export default async function FileDetailsPage({ params }: { params: { id: string } }) {
  const file = await getMediaFile(params.id);

  if (!file) {
      notFound();
  }
  
  const logs = await getLogsForFile(params.id);
  const history = generateProcessingHistoryFromLogs(logs);

  const statusVariant = {
    "success": "default",
    "processing": "secondary",
    "failed": "destructive"
  }[file.status] ?? "outline";

  const savings = file.originalSize > 0 && file.status === 'success' && file.compressedSize > 0
    ? Math.round(((file.originalSize - file.compressedSize) / file.originalSize) * 100) 
    : 0;
  
  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="outline" size="icon" className="shrink-0">
          <Link href="/files">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to files</span>
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight truncate">{file.fileName}</h2>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                <Image
                    alt={`Preview for ${file.fileName}`}
                    className="aspect-video w-full object-cover"
                    data-ai-hint="product image"
                    height={600}
                    src={`/api/media/${encodeURIComponent(file.fileName)}`}
                    width={800}
                />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Processing History</CardTitle>
                    <CardDescription>
                        A timeline of the processing steps for this file from the database logs.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <ul className="space-y-4">
                        {history.map((item, index) => (
                        <li key={index} className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <div className={`h-4 w-4 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted-foreground'}`} />
                                {index < history.length - 1 && <div className="w-px h-8 bg-border" />}
                            </div>
                            <div>
                                <p className="font-medium">{item.status}</p>
                                <p className="text-sm text-muted-foreground">{item.timestamp}</p>
                            </div>
                        </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> File Logs</CardTitle>
                    <CardDescription>
                        Detailed logs generated during this file's processing.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] w-full rounded-md border p-4 font-mono text-sm">
                    {logs.length > 0 ? logs.map((log, index) => (
                      <div key={index} className="flex items-start gap-4 mb-2">
                        <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <LogLevelBadge level={log.level} />
                        <span className="flex-1 break-all">{log.message}</span>
                      </div>
                    )) : <p className="text-muted-foreground">No logs found for this file.</p>}
                   </ScrollArea>
                </CardContent>
            </Card>

        </div>

        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>File Details</CardTitle>
                    <CardDescription>
                    Metadata and compression details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                    <Separator className="mb-2"/>
                    <DetailRow icon={<Tag className="h-4 w-4"/>} label="Status">
                        <Badge variant={statusVariant as any}>{file.status}</Badge>
                    </DetailRow>
                    <DetailRow icon={<Camera className="h-4 w-4"/>} label="Camera">{file.camera}</DetailRow>
                    <DetailRow icon={<Calendar className="h-4 w-4"/>} label="Created Date">{new Date(file.createdDate).toLocaleDateString()}</DetailRow>
                     <DetailRow icon={<HardDrive className="h-4 w-4"/>} label="Original Size">{file.originalSize.toFixed(2)} MB</DetailRow>
                    <DetailRow icon={<Zap className="h-4 w-4"/>} label="Compressed Size">
                        {file.compressedSize > 0 ? `${file.compressedSize.toFixed(2)} MB (${savings}% smaller)` : 'N/A'}
                    </DetailRow>
                    <DetailRow icon={<Clock className="h-4 w-4"/>} label="Last Compressed">
                        {file.lastCompressed === "N/A" ? "N/A" : new Date(file.lastCompressed).toLocaleString()}
                    </DetailRow>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Backup Status</CardTitle>
                    <CardDescription>
                        Current status of the original file.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                    <Separator className="mb-2"/>
                    <StatusRow icon={<HardDrive className="h-4 w-4" />} label="NAS Archive" status={file.nasBackup} />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
