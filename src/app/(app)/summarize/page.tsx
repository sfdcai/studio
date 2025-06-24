
"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useEffect } from "react";
import { handleAnalysis, State } from "@/app/(app)/summarize/actions";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, Bot, Info, ShieldAlert, CircleAlert, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending} className="w-full md:w-auto">
            {pending ? (
                <>
                    <Bot className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing System...
                </>
            ) : (
                <>
                    <Bot className="mr-2 h-4 w-4" />
                    Generate Analysis
                </>
            )}
        </Button>
    );
}

const getStatusVariant = (status?: 'Healthy' | 'Warning' | 'Error') => {
    switch (status) {
        case 'Healthy': return 'bg-green-500/20 text-green-700 border-green-500/50';
        case 'Warning': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50';
        case 'Error': return 'bg-red-500/20 text-red-700 border-red-500/50';
        default: return 'bg-secondary';
    }
}

const getSeverityIcon = (severity: 'Info' | 'Low' | 'Medium' | 'High') => {
    switch(severity) {
        case 'Info': return <Info className="h-5 w-5 text-blue-500" />;
        case 'Low': return <ShieldAlert className="h-5 w-5 text-yellow-500" />;
        case 'Medium': return <CircleAlert className="h-5 w-5 text-orange-500" />;
        case 'High': return <CircleAlert className="h-5 w-5 text-red-500" />;
    }
}


export default function AnalyzePage() {
    const initialState: State = { message: "", error: undefined };
    const [state, dispatch] = useActionState(handleAnalysis, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state.error) {
            toast({
                title: "Analysis Failed",
                description: state.error,
                variant: "destructive",
            });
        }
    }, [state, toast]);
    
    const analysis = state.analysis;

    return (
        <div className="p-4 md:p-8 space-y-8">
            <Card className="self-start">
                <CardHeader>
                    <CardTitle>AI System Analysis</CardTitle>
                    <CardDescription>
                        Generate an AI-powered analysis of your entire media processing system. The AI will provide insights based on the data permissions you've configured in settings.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     {state.error && !analysis && (
                        <Alert variant="destructive" className="mb-4">
                            <CircleAlert className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {state.error} <Link href="/settings" className="underline">Update Settings</Link>
                            </AlertDescription>
                        </Alert>
                    )}
                    <form action={dispatch}>
                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>

            {analysis ? (
                <div className="space-y-6 animate-in fade-in-50">
                    <Card className={getStatusVariant(analysis.overallStatus)}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <span>Overall Status:</span>
                                <Badge variant={analysis.overallStatus === 'Healthy' ? 'default' : analysis.overallStatus === 'Warning' ? 'secondary' : 'destructive'} className="text-base">
                                    {analysis.overallStatus}
                                </Badge>
                            </CardTitle>
                            <CardDescription className="text-foreground/80">{analysis.summary}</CardDescription>
                        </CardHeader>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-primary"/>Observations</CardTitle>
                                <CardDescription>Key findings from the system data.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {analysis.observations.map((obs, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="pt-1">{getSeverityIcon(obs.severity)}</div>
                                        <div>
                                            <p className="font-semibold">{obs.title}</p>
                                            <p className="text-sm text-muted-foreground">{obs.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary"/>Recommendations</CardTitle>
                                <CardDescription>Actionable steps to improve your system.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                               {analysis.recommendations.map((rec, i) => (
                                    <div key={i}>
                                        <p className="font-semibold">{rec.title}</p>
                                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                                        {i < analysis.recommendations.length -1 && <Separator className="my-4"/>}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 border-2 border-dashed rounded-lg min-h-[40vh]">
                    <Sparkles className="w-16 h-16 mb-4 text-muted-foreground"/>
                    <p className="text-center text-muted-foreground">Your AI-generated system analysis will appear here.</p>
                </div>
            )}
        </div>
    );
}
