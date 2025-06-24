"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { DollarSign, Folder, AlertTriangle, CopyCheck, Play, Square } from "lucide-react"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { data, MediaFile } from '@/lib/data'

const processingHistoryData = [
  { name: 'Mon', processed: 20, failed: 1 },
  { name: 'Tue', processed: 35, failed: 2 },
  { name: 'Wed', processed: 45, failed: 0 },
  { name: 'Thu', processed: 30, failed: 5 },
  { name: 'Fri', processed: 50, failed: 1 },
  { name: 'Sat', processed: 60, failed: 3 },
  { name: 'Sun', processed: 55, failed: 2 },
];

const formatBytes = (mb: number) => {
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    if (gb < 1024) return `${gb.toFixed(1)} GB`;
    const tb = gb / 1024;
    return `${tb.toFixed(1)} TB`;
};

export default function DashboardPage() {
  const [isJobRunning, setIsJobRunning] = React.useState(true)

  const totalFiles = data.length;
  const storageSaved = data.reduce((sum, file) => {
    if (file.status === 'success' || file.status === 'processing') {
      return sum + (file.originalSize - file.compressedSize);
    }
    return sum;
  }, 0);
  const processingErrors = data.filter(file => file.status === 'failed').length;
  const duplicatesFound = 1287; // This would be calculated on the backend

  const filesByCategory = data.reduce((acc, file) => {
    const { type } = file;
    const categoryName = type === 'Image' ? 'Images' : 'Videos';
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filesByCategoryData = Object.entries(filesByCategory).map(([name, files]) => ({ name, files }));


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
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
              +20.1% from last month
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
            <div className="text-2xl font-bold">{formatBytes(storageSaved)}</div>
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
            <p className="text-xs text-muted-foreground">saving 25.4 GB</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingErrors}</div>
            <p className="text-xs text-muted-foreground">in the last 7 days</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
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
      </div>
      <div className="grid gap-4">
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
    </div>
  )
}
