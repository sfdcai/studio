"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Play, Square, Loader2 } from "lucide-react"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { runProcessingJob } from '@/app/(app)/dashboard/actions'
import { useToast } from '@/hooks/use-toast'

export function JobControlCard() {
    const [isPending, startTransition] = React.useTransition();
    const { toast } = useToast();
    // This state is just for the UI, the actual job isn't a long-running process in this simulation.
    const [jobStatus, setJobStatus] = React.useState<'Stopped' | 'Running'>('Stopped');

    const handleStartJob = () => {
        startTransition(async () => {
            setJobStatus('Running');
            const result = await runProcessingJob();
            if (result.success) {
                toast({
                    title: "Processing Complete",
                    description: result.message,
                });
            } else {
                toast({
                    title: "Processing Error",
                    description: result.message,
                    variant: "destructive",
                });
            }
            setJobStatus('Stopped');
        });
    }
    
    // We don't have a real running job to "stop", so this is just for UI consistency.
    const handleStopJob = () => {
        // In a real app, this would send a signal to a backend process.
        // Here, we just update the UI.
        setJobStatus('Stopped');
        toast({
            title: "Job Stopped",
            description: "The processing job has been stopped (simulation).",
        });
    }

    const isJobRunning = jobStatus === 'Running' || isPending;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Job Control</CardTitle>
                <CardDescription>Start and stop the file processing job.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4 h-[200px]">
                <div className="flex items-center space-x-2">
                    <span>Status:</span>
                    <Badge variant={isJobRunning ? 'default' : 'secondary'}>
                        {isJobRunning ? 'Running' : 'Stopped'}
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Click Start to process pending files.</p>
            </CardContent>
            <CardFooter className="flex justify-center space-x-2">
                <Button onClick={handleStartJob} disabled={isJobRunning} variant="outline">
                    {isPending ? (
                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Play className="h-4 w-4 mr-2" />
                    )}
                    Start
                </Button>
                <Button onClick={handleStopJob} disabled={!isJobRunning || isPending} variant="destructive">
                    <Square className="h-4 w-4 mr-2" /> Stop
                </Button>
            </CardFooter>
        </Card>
    );
}
