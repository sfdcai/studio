"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { DollarSign, Folder, AlertTriangle } from "lucide-react"

const filesByCategoryData = [
  { name: 'Photos', files: 4000 },
  { name: 'Videos', files: 3000 },
  { name: 'Documents', files: 2000 },
  { name: 'Audio', files: 2780 },
  { name: 'Archives', files: 1890 },
];

const processingHistoryData = [
  { name: 'Mon', processed: 20, failed: 1 },
  { name: 'Tue', processed: 35, failed: 2 },
  { name: 'Wed', processed: 45, failed: 0 },
  { name: 'Thu', processed: 30, failed: 5 },
  { name: 'Fri', processed: 50, failed: 1 },
  { name: 'Sat', processed: 60, failed: 3 },
  { name: 'Sun', processed: 55, failed: 2 },
];

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Files
            </CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,345</div>
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
            <div className="text-2xl font-bold">1.2 TB</div>
            <p className="text-xs text-muted-foreground">
              through compression
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">57</div>
            <p className="text-xs text-muted-foreground">in the last 7 days</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
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
        <Card className="col-span-4 md:col-span-3">
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
