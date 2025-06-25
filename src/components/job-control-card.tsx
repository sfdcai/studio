"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { PlayCircle, Loader2, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { runProcessing } from "@/app/(app)/dashboard/actions";

export function JobControlCard() {
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const handleRunProcessing = async () => {
        setIsProcessing(true);
        toast({
            title: "Local Processing Started",
            description: "The backend job is running. This may take a while.",
        });

        const result = await runProcessing();

        if (result.ok) {
            toast({
                title: "Processing Finished",
                description: result.error ? `${result.message} ${result.error}` : result.message,
            });
        } else {
            toast({
                title: "Processing Error",
                description: result.error || result.message,
                variant: "destructive",
            });
        }
        setIsProcessing(false);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manual Job Control</CardTitle>
                <CardDescription>Trigger the backend processing scripts on demand.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
                 <div className="w-full space-y-2 text-center">
                    <Button onClick={handleRunProcessing} disabled={isProcessing} size="lg" className="w-full">
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <PlayCircle className="mr-2 h-5 w-5" />
                                Run Processing
                            </>
                        )}
                    </Button>
                     <p className="text-xs text-muted-foreground">
                        Processes all files currently in the staging directory.
                    </p>
                 </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start text-xs text-muted-foreground space-y-2">
                 <p>To view the job output, check the system logs on the <Link href="/logs" className="underline font-semibold text-primary">Logs page</Link>.</p>
            </CardFooter>
        </Card>
    );
}
