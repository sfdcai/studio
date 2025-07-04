"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { DollarSign, Folder, AlertTriangle, CopyCheck } from "lucide-react"
import { JobControlCard } from '@/components/job-control-card'
import { SystemStatusCard } from "@/components/system-status-card"
import { SystemHealthMonitor } from "@/components/system-health-monitor"
import type { MediaFile, ProcessingHistoryPoint, Prerequisite } from "@/lib/types"

type DashboardClientProps = {
    totalFiles: number;
    storageSaved: string;
    duplicatesFound: number;
    processingErrors: number;
    filesByCategoryData: { name: string; files: number }[];
    processingHistoryData: ProcessingHistoryPoint[];
    prerequisites: Prerequisite[];
    failedFiles: MediaFile[];
}

export function DashboardClient({
    totalFiles,
    storageSaved,
    duplicatesFound,
    processingErrors,
    filesByCategoryData,
    processingHistoryData,
    prerequisites,
    failedFiles,
}: DashboardClientProps) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">MediaFlow Dashboard</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Files
                        </CardTitle>
                        <Folder className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalFiles.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            in your media library
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Storage Saved
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{storageSaved}</div>
                        <p className="text-xs text-muted-foreground">
                            through compression
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Duplicates Found</CardTitle>
                        <CopyCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{duplicatesFound.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">deleted from staging</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Processing Errors</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{processingErrors.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">check logs for details</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                 <div className="lg:col-span-3 space-y-4">
                    <SystemHealthMonitor failedFiles={failedFiles} />
                    <Card>
                        <CardHeader>
                            <CardTitle>Processing History (Last 7 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={processingHistoryData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="processed" stroke="hsl(var(--primary))" />
                                    <Line type="monotone" dataKey="failed" stroke="hsl(var(--destructive))" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-4">
                    <JobControlCard />
                    <SystemStatusCard initialStatus={prerequisites} />
                     <Card>
                        <CardHeader>
                            <CardTitle>Files by Category</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={filesByCategoryData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="files" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
