"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Zap, AlertCircle, Eye, Loader2 } from "lucide-react"
import type { MediaFile } from "@/lib/types"

export function SystemHealthMonitor({ failedFiles }: { failedFiles: MediaFile[] }) {
    const [processingStatus, setProcessingStatus] = useState<{ fileCount: number } | null>(null);

    useEffect(() => {
        const fetchStatus = () => {
            fetch('/api/status/processing-queue').then(res => res.json()).then(setProcessingStatus);
        }
        fetchStatus();
        const interval = setInterval(fetchStatus, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Live status of the processing queue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    {/* Processing Queue */}
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                        <Zap className="h-6 w-6 text-primary mt-1" />
                        <div>
                            <h4 className="font-semibold">Processing Queue</h4>
                            <p className="text-sm text-muted-foreground">Files waiting in the staging directory.</p>
                            <div className="text-2xl font-bold mt-2">
                                {processingStatus ? `${processingStatus.fileCount} files` : <Loader2 className="h-6 w-6 animate-spin" />}
                            </div>
                        </div>
                    </div>
                </div>

                {failedFiles.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-destructive flex items-center gap-2 mb-2"><AlertCircle className="h-5 w-5"/> Failed Files</h4>
                        <ScrollArea className="h-48 w-full rounded-md border">
                            <div className="p-2 space-y-1">
                                {failedFiles.map(file => (
                                    <div key={file.id} className="flex items-center justify-between p-2 bg-card rounded-md">
                                        <p className="text-sm font-mono truncate" title={file.fileName}>{file.fileName}</p>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                 <Button variant="ghost" size="sm"><Eye className="h-4 w-4 mr-2"/>View Error</Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl">
                                                <DialogHeader>
                                                    <DialogTitle>Error Log for {file.fileName}</DialogTitle>
                                                    <DialogDescription>
                                                        The following error was captured when processing this file.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="mt-4 bg-muted rounded-md p-4">
                                                   <ScrollArea className="h-64">
                                                     <pre className="text-sm whitespace-pre-wrap font-mono">{file.errorLog || "No specific error was logged."}</pre>
                                                   </ScrollArea>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}

            </CardContent>
        </Card>
    )
}
