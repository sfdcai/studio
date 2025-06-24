import { data } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Camera, Clock, HardDrive, Zap, Tag, Cloud } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const DetailRow = ({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) => (
  <>
    <div className="flex items-center justify-between py-3">
      <span className="text-muted-foreground flex items-center gap-2 text-sm">
        {icon}
        {label}
      </span>
      <span className="font-medium text-sm text-right">{children}</span>
    </div>
    <Separator />
  </>
);

const StatusRow = ({ icon, label, status }: { icon: React.ReactNode, label: string, status: boolean }) => (
    <>
      <div className="flex items-center justify-between py-3">
        <span className="text-muted-foreground flex items-center gap-2 text-sm">
          {icon}
          {label}
        </span>
        <Badge variant={status ? "default" : "secondary"}>
          {status ? "Synced" : "Pending"}
        </Badge>
      </div>
      <Separator />
    </>
  );

export default function FileDetailsPage({ params }: { params: { id: string } }) {
  const file = data.find((f) => f.id === params.id);

  if (!file) {
    notFound();
  }
  
  const statusVariant = {
    "success": "default",
    "processing": "secondary",
    "failed": "destructive"
  }[file.status] ?? "outline";

  const savings = file.originalSize > 0 ? Math.round(((file.originalSize - file.compressedSize) / file.originalSize) * 100) : 0;

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="outline" size="icon" className="shrink-0">
          <Link href="/files">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to files</span>
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight truncate">{file.id}.jpg</h2>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                <Image
                    alt={`Image for ${file.id}`}
                    className="aspect-video w-full object-cover"
                    data-ai-hint="product image"
                    height={600}
                    src="https://placehold.co/800x450.png"
                    width={800}
                />
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>File Details</CardTitle>
                    <CardDescription>
                    Metadata and compression details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                    <Separator className="mb-2"/>
                    <DetailRow icon={<Tag className="h-4 w-4"/>} label="Status">
                        <Badge variant={statusVariant as any}>{file.status}</Badge>
                    </DetailRow>
                    <DetailRow icon={<Camera className="h-4 w-4"/>} label="Camera">{file.camera}</DetailRow>
                    <DetailRow icon={<Calendar className="h-4 w-4"/>} label="Created Date">{new Date(file.createdDate).toLocaleDateString()}</DetailRow>
                     <DetailRow icon={<HardDrive className="h-4 w-4"/>} label="Original Size">{file.originalSize} MB</DetailRow>
                    <DetailRow icon={<Zap className="h-4 w-4"/>} label="Compressed Size">{file.compressedSize} MB ({savings}% smaller)</DetailRow>
                    <DetailRow icon={<Clock className="h-4 w-4"/>} label="Last Compressed">
                        {file.lastCompressed === "N/A" ? "N/A" : new Date(file.lastCompressed).toLocaleString()}
                    </DetailRow>
                     <DetailRow icon={<Calendar className="h-4 w-4"/>} label="Next Compression">
                         {file.nextCompression === "N/A" ? "N/A" : new Date(file.nextCompression).toLocaleDateString()}
                    </DetailRow>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Backup & Sync Status</CardTitle>
                    <CardDescription>
                        Current status across your storage locations.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                    <Separator className="mb-2"/>
                    <StatusRow icon={<HardDrive className="h-4 w-4" />} label="NAS Backup" status={file.nasBackup} />
                    <StatusRow icon={<Cloud className="h-4 w-4" />} label="Google Photos" status={file.googlePhotosBackup} />
                    <StatusRow icon={<Cloud className="h-4 w-4" />} label="iCloud" status={file.icloudUpload} />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
