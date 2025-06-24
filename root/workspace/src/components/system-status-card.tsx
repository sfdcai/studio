"use client";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, XCircle, HardDrive } from "lucide-react";
import { getSystemStatus, type Prerequisite } from '@/app/(app)/dashboard/actions';
import { Skeleton } from '@/components/ui/skeleton';

export function SystemStatusCard() {
    const [status, setStatus] = useState<Prerequisite[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSystemStatus().then(data => {
            setStatus(data);
            setLoading(false);
        });
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    System Prerequisites
                </CardTitle>
                <CardDescription>
                    Status of required backend software.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? (
                    <>
                        <Skeleton className="h-6 w-full rounded-md" />
                        <Skeleton className="h-6 w-full rounded-md" />
                        <Skeleton className="h-6 w-full rounded-md" />
                        <Skeleton className="h-6 w-full rounded-md" />
                        <Skeleton className="h-6 w-full rounded-md" />
                    </>
                ) : (
                    status.map(p => (
                        <div key={p.name}>
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{p.name}</span>
                                {p.status === 'Installed' ? (
                                    <span className="flex items-center gap-2 text-green-600">
                                        <CheckCircle className="h-4 w-4" /> Installed
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 text-destructive">
                                        <XCircle className="h-4 w-4" /> Not Found
                                    </span>
                                )}
                            </div>
                            {p.status === 'Not Found' && (
                                 <p className="text-xs text-muted-foreground mt-1">
                                    To fix, run: <code className="bg-muted px-1 py-0.5 rounded text-foreground">{p.helpText}</code>
                                </p>
                            )}
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

    