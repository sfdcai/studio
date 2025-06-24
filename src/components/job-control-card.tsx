"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Server, Terminal } from "lucide-react"
import { Badge } from '@/components/ui/badge'

export function JobControlCard() {
    // Since the job is now run by an external systemd timer, this card is informational.
    return (
        <Card>
            <CardHeader>
                <CardTitle>Backend Job Status</CardTitle>
                <CardDescription>File processing is handled by a systemd service.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4 h-[200px]">
                <div className="flex items-center space-x-2">
                    <Server className="h-8 w-8 text-muted-foreground"/>
                    <div>
                        <p className="font-semibold">Automated Backend</p>
                        <p className="text-sm text-muted-foreground">Running on a schedule.</p>
                    </div>
                </div>
                 <Badge variant={'secondary'}>
                    Monitoring
                </Badge>
            </CardContent>
            <CardFooter className="flex flex-col items-start text-xs text-muted-foreground space-y-2">
                 <p>To check the timer status, run:</p>
                 <code className="bg-muted p-2 rounded-md text-xs w-full"><Terminal className="inline h-3 w-3 mr-1"/>sudo systemctl status media_processor.timer</code>
                 <p>To view the latest job logs, run:</p>
                 <code className="bg-muted p-2 rounded-md text-xs w-full"><Terminal className="inline h-3 w-3 mr-1"/>journalctl -u media_processor.service -n 50</code>
            </CardFooter>
        </Card>
    );
}
