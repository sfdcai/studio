"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PlayCircle, Loader2, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

type JobControlCardProps = {
    runManualSync: () => Promise<{ ok: boolean; message: string; output?: string; error?: string; }>;
}

export function JobControlCard({ runManualSync }: JobControlCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleRunJob = async () => {
        setIsLoading(true);
        toast({
            title: "Manual Sync Started",
            description: "The backend job is running. This may take a while.",
        });

        const result = await runManualSync();

        if (result.ok) {
            toast({
                title: "Sync Finished",
                description: result.message,
            });
        } else {
            toast({
                title: "Sync Error",
                description: result.error || result.message,
                variant: "destructive",
            });
        }
        setIsLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manual Job Control</CardTitle>
                <CardDescription>Trigger the backend processing scripts on demand.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4 h-[150px]">
                <Button onClick={handleRunJob} disabled={isLoading} size="lg" className="w-full">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Running Sync...
                        </>
                    ) : (
                        <>
                            <PlayCircle className="mr-2 h-5 w-5" />
                            Run Manual Sync
                        </>
                    )}
                </Button>
                 <p className="text-xs text-center text-muted-foreground">
                    This will download new media and process files in the staging directory according to your current settings.
                </p>
            </CardContent>
            <CardFooter className="flex flex-col items-start text-xs text-muted-foreground space-y-2">
                 <p>To view the job output, check the system logs on the <Link href="/logs" className="underline font-semibold text-primary">Logs page</Link>.</p>
                 <p>The `systemd` service runs this job automatically. To check its status, run:</p>
                 <code className="bg-muted p-2 rounded-md text-xs w-full"><Terminal className="inline h-3 w-3 mr-1"/>sudo systemctl status media_processor.timer</code>
            </CardFooter>
        </Card>
    );
}
