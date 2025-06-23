"use client";

import { useFormState, useFormStatus } from "react-dom";
import { handleSummarize, State } from "./actions";
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, UploadCloud, CheckCircle, AlertCircle } from "lucide-react";
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
                    Summarizing...
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Summary
                </>
            )}
        </Button>
    );
}

export default function SummarizePage() {
    const initialState: State = { message: "", errors: {} };
    const [state, dispatch] = useFormState(handleSummarize, initialState);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.message) {
            if (state.summary) { // Success
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

    return (
        <div className="p-4 md:p-8 grid gap-8 md:grid-cols-2">
            <Card className="self-start">
                <CardHeader>
                    <CardTitle>AI Media Summarization</CardTitle>
                    <CardDescription>
                        Upload a media file and provide a brief description to generate an AI-powered summary and categories.
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
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="e.g., A photo of a sunset over the mountains."
                            />
                            {state.errors?.description && (
                                <p className="text-sm font-medium text-destructive">
                                    {state.errors.description[0]}
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
                {state.summary && (
                    <Alert className="border-green-500 text-green-700 dark:border-green-400 dark:text-green-400">
                        <CheckCircle className="h-4 w-4 !text-green-500" />
                        <AlertTitle>Summarization Complete</AlertTitle>
                        <AlertDescription>
                            Here's the AI-generated result:
                        </AlertDescription>
                    </Alert>
                )}
                 {state.summary && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{state.summary}</p>
                        </CardContent>
                    </Card>
                )}
                {state.categories && state.categories.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Suggested Categories</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {state.categories.map((cat, i) => <Badge key={i} variant="secondary">{cat}</Badge>)}
                        </CardContent>
                    </Card>
                )}
                 {!state.summary && !state.message && (
                     <div className="flex flex-col items-center justify-center h-full p-8 border-2 border-dashed rounded-lg">
                        <Sparkles className="w-16 h-16 mb-4 text-muted-foreground"/>
                        <p className="text-center text-muted-foreground">Your AI-generated summary will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
