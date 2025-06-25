"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PlayCircle, Loader2, Terminal, DownloadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { runLocalProcessing, runICloudDownload } from "@/app/(app)/dashboard/actions";
import { Separator } from "@/components/ui/separator";

export function JobControlCard() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const { toast } = useToast();

    const handleRunDownload = async () => {
        setIsDownloading(true);
        toast({
            title: "iCloud Download Started",
            description: "The backend is fetching new media from iCloud. This may take a while.",
        });

        const result = await runICloudDownload();

        if (result.ok) {
            toast({
                title: "Download Finished",
                description: result.error ? `${result.message} ${result.error}` : result.message,
            });
        } else {
            toast({
                title: "Download Error",
                description: result.error || result.message,
                variant: "destructive",
            });
        }
        setIsDownloading(false);
    }

    const handleRunProcessing = async () => {
        setIsProcessing(true);
        toast({
            title: "Local Processing Started",
            description: "The backend job is running. This may take a while.",
        });

        const result = await runLocalProcessing();

        if (result.ok) {
            toast({
                title: "Processing Finished",
                description: result.error ? `${result.message} ${result.error}` : result.message,
            });
        } else {
            toast({
                title: "Processing Error",
                description: result.error || result.message,
                variant: "destructive",
            });
        }
        setIsProcessing(false);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manual Job Control</CardTitle>
                <CardDescription>Trigger backend jobs on demand.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
                 <div className="w-full space-y-2 text-center">
                    <Button onClick={handleRunDownload} disabled={isDownloading || isProcessing} size="lg" className="w-full">
                        {isDownloading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Downloading...
                            </>
                        ) : (
                            <>
                                <DownloadCloud className="mr-2 h-5 w-5" />
                                Run iCloud Download
                            </>
                        )}
                    </Button>
                     <p className="text-xs text-muted-foreground">Fetches new media from iCloud into the staging directory.</p>
                 </div>
                 <Separator/>
                 <div className="w-full space-y-2 text-center">
                    <Button onClick={handleRunProcessing} disabled={isProcessing || isDownloading} size="lg" className="w-full">
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <PlayCircle className="mr-2 h-5 w-5" />
                                Run Local Processing
                            </>
                        )}
                    </Button>
                     <p className="text-xs text-muted-foreground">
                        Processes all files currently in the staging directory.
                    </p>
                 </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start text-xs text-muted-foreground space-y-2">
                 <p>To view the job output, check the system logs on the <Link href="/logs" className="underline font-semibold text-primary">Logs page</Link>.</p>
                 <p>The `systemd` service runs this job automatically. To check its status, run:</p>
                 <code className="bg-muted p-2 rounded-md text-xs w-full"><Terminal className="inline h-3 w-3 mr-1"/>sudo systemctl status media_processor.timer</code>
            </CardFooter>
        </Card>
    );
}
