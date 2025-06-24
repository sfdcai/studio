"use client";

import { useFormState, useFormStatus } from "react-dom";
import { handleAnalysis, State } from "./actions";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, UploadCloud, CheckCircle, Camera, Lightbulb, BarChart, Settings, Tags, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
                <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Analysis
                </>
            )}
        </Button>
    );
}

export default function AnalyzePage() {
    const initialState: State = { message: "", errors: {} };
    const [state, dispatch] = useFormState(handleAnalysis, initialState);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.message) {
            if (state.analysis) { // Success
                toast({
                    title: "Success",
                    description: state.message,
                    variant: "default",
                });
                formRef.current?.reset();
            } else { // Error
                toast({
                    title: "Error",
                    description: state.message,
                    variant: "destructive",
                });
            }
        }
    }, [state, toast]);
    
    const analysis = state.analysis;

    return (
        <div className="p-4 md:p-8 grid gap-8 md:grid-cols-2">
            <Card className="self-start">
                <CardHeader>
                    <CardTitle>AI Media Analysis</CardTitle>
                    <CardDescription>
                        Upload a media file to generate an AI-powered technical analysis, summary, and suggestions.
                    </CardDescription>
                </CardHeader>
                <form ref={formRef} action={dispatch}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="mediaFile">Media File</Label>
                            <div className="flex items-center justify-center w-full">
                                <label
                                    htmlFor="mediaFile"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary transition-colors"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-muted-foreground">Image or Video (MAX. 10MB)</p>
                                    </div>
                                    <Input id="mediaFile" name="mediaFile" type="file" className="hidden" accept="image/*,video/*" />
                                </label>
                            </div>

                            {state.errors?.mediaFile && (
                                <p className="text-sm font-medium text-destructive">
                                    {state.errors.mediaFile[0]}
                                </p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <SubmitButton />
                    </CardFooter>
                </form>
            </Card>

            <div className="space-y-8">
                {analysis ? (
                    <>
                        <Alert className="border-green-500 text-green-700 dark:border-green-400 dark:text-green-400">
                            <CheckCircle className="h-4 w-4 !text-green-500" />
                            <AlertTitle>Analysis Complete</AlertTitle>
                            <AlertDescription>
                                Here's the AI-generated result:
                            </AlertDescription>
                        </Alert>
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><FileText /> Summary</CardTitle></CardHeader>
                            <CardContent><p className="text-muted-foreground">{analysis.summary}</p></CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Tags/> Suggested Categories</CardTitle></CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                {analysis.categories.map((cat, i) => <Badge key={i} variant="secondary">{cat}</Badge>)}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart/> Technical Analysis</CardTitle></CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground flex items-center gap-2"><Camera/> Inferred Camera:</span>
                                    <strong>{analysis.technicalAnalysis.inferredCamera}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground flex items-center gap-2"><Lightbulb/> Lighting:</span>
                                    <strong>{analysis.technicalAnalysis.lightingAnalysis}</strong>
                                </div>
                                <div>
                                    <span className="text-muted-foreground flex items-center gap-2"><Lightbulb/> Composition Tips:</span>
                                    <p className="mt-1 pl-2 text-foreground">{analysis.technicalAnalysis.compositionTips}</p>
                                </div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Settings/> Suggestions</CardTitle></CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center gap-2">Initial Compression:</span>
                                    <Badge variant="default">{analysis.suggestions.initialCompression}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                     <div className="flex flex-col items-center justify-center h-full p-8 border-2 border-dashed rounded-lg">
                        <Sparkles className="w-16 h-16 mb-4 text-muted-foreground"/>
                        <p className="text-center text-muted-foreground">Your AI-generated analysis will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
