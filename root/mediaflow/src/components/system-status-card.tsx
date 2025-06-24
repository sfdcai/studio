"use client";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, XCircle, HardDrive } from "lucide-react";
import { getSystemStatus } from '@/app/(app)/dashboard/actions';
import type { Prerequisite } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

type SystemStatusCardProps = {
    initialStatus: Prerequisite[];
}

export function SystemStatusCard({ initialStatus }: SystemStatusCardProps) {
    const [status, setStatus] = useState<Prerequisite[]>(initialStatus);
    const [loading, setLoading] = useState(initialStatus.length === 0);

    useEffect(() => {
        if (loading) {
            getSystemStatus().then(data => {
                setStatus(data);
                setLoading(false);
            });
        }
    }, [loading]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    System Prerequisites
                </CardTitle>
                <CardDescription>
                    Status and location of required backend software.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {loading ? (
                    <>
                        <Skeleton className="h-8 w-full rounded-md" />
                        <Skeleton className="h-8 w-full rounded-md" />
                        <Skeleton className="h-8 w-full rounded-md" />
                        <Skeleton className="h-8 w-full rounded-md" />
                        <Skeleton className="h-8 w-full rounded-md" />
                    </>
                ) : (
                    status.map((p, index) => (
                       <div key={p.name}>
                            <div className="flex items-start justify-between text-sm">
                                <span className="font-medium pt-1">{p.name}</span>
                                {p.status === 'Installed' ? (
                                    <div className="flex flex-col items-end">
                                        <span className="flex items-center gap-2 text-green-600">
                                            <CheckCircle className="h-4 w-4" /> Installed
                                        </span>
                                        <code className="text-xs text-muted-foreground">{p.path}</code>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-end">
                                        <span className="flex items-center gap-2 text-destructive">
                                            <XCircle className="h-4 w-4" /> Not Found
                                        </span>
                                    </div>
                                )}
                            </div>
                            {p.status === 'Not Found' && (
                                 <p className="text-xs text-muted-foreground mt-1 text-right">
                                    To fix, run: <code className="bg-muted px-1 py-0.5 rounded text-foreground">{p.helpText}</code>
                                </p>
                            )}
                            {index < status.length -1 && <Separator className="mt-3"/>}
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
