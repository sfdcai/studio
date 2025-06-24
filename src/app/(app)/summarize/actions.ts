"use server";

import { analyzeMedia, AnalyzeMediaOutput } from "@/ai/flows/media-summarization";
import { z } from "zod";

const FormSchema = z.object({
    mediaFile: z
        .instanceof(File)
        .refine((file) => file.size > 0, "Media file is required.")
        .refine(
            (file) => file.size < 10 * 1024 * 1024,
            "File size must be less than 10MB."
        ),
});

export type State = {
    message?: string;
    analysis?: AnalyzeMediaOutput;
    errors?: {
        mediaFile?: string[];
    };
};

// Helper to convert file to base64 data URI
async function fileToDataUri(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function handleAnalysis(
    prevState: State,
    formData: FormData
): Promise<State> {
    const validatedFields = FormSchema.safeParse({
        mediaFile: formData.get("mediaFile"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed. Please check your inputs.",
        };
    }

    try {
        const { mediaFile } = validatedFields.data;
        const mediaDataUri = await fileToDataUri(mediaFile);

        const result = await analyzeMedia({
            fileName: mediaFile.name,
            mediaDataUri,
        });

        return {
            message: "Analysis successful!",
            analysis: result,
        };
    } catch (error) {
        console.error("Analysis error:", error);
        return {
            message:
                error instanceof Error ? error.message : "An unknown error occurred.",
        };
    }
}
