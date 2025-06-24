"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Play, Square } from "lucide-react"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function JobControlCard() {
    const [isJobRunning, setIsJobRunning] = React.useState(true);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Job Control</CardTitle>
                <CardDescription>Start and stop the file processing job.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4 h-[200px]">
                <div className="flex items-center space-x-2">
                    <span>Status:</span>
                    <Badge variant={isJobRunning ? 'default' : 'secondary'}>{isJobRunning ? 'Running' : 'Stopped'}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Last run: 5 minutes ago</p>
            </CardContent>
            <CardFooter className="flex justify-center space-x-2">
                <Button onClick={() => setIsJobRunning(true)} disabled={isJobRunning} variant="outline">
                    <Play className="h-4 w-4 mr-2" /> Start
                </Button>
                <Button onClick={() => setIsJobRunning(false)} disabled={!isJobRunning} variant="destructive">
                    <Square className="h-4 w-4 mr-2" /> Stop
                </Button>
            </CardFooter>
        </Card>
    );
}
