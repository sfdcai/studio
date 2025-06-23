"use server";

import { summarizeMedia } from "@/ai/flows/media-summarization";
import { z } from "zod";

const FormSchema = z.object({
    description: z.string().min(1, "Description is required."),
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
    summary?: string;
    categories?: string[];
    errors?: {
        description?: string[];
        mediaFile?: string[];
    };
};

// Helper to convert file to base64 data URI
async function fileToDataUri(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function handleSummarize(
    prevState: State,
    formData: FormData
): Promise<State> {
    const validatedFields = FormSchema.safeParse({
        description: formData.get("description"),
        mediaFile: formData.get("mediaFile"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed. Please check your inputs.",
        };
    }

    try {
        const { description, mediaFile } = validatedFields.data;
        const mediaDataUri = await fileToDataUri(mediaFile);

        const result = await summarizeMedia({
            description,
            mediaDataUri,
        });

        return {
            message: "Summarization successful!",
            summary: result.summary,
            categories: result.categories,
        };
    } catch (error) {
        console.error("Summarization error:", error);
        return {
            message:
                error instanceof Error ? error.message : "An unknown error occurred.",
        };
    }
}
