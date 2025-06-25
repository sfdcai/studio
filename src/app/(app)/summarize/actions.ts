"use server";

import { analyzeSystem } from "@/ai/flows/system-analysis";
import type { SystemAnalysisOutput } from "@/ai/flows/system-analysis";
import { getSettings } from "@/app/(app)/settings/actions";
import { getMediaFiles, getStats } from "@/lib/data";
import type { Settings } from "@/lib/types";

export type State = {
    message?: string;
    analysis?: SystemAnalysisOutput;
    error?: string;
};

export async function handleAnalysis(
    prevState: State,
    formData: FormData
): Promise<State> {
    const settings = await getSettings();

    if (!settings.googleAiApiKey) {
        return {
            error: "Google AI API Key is not configured. Please set it in the AI tab under Settings."
        }
    }

    try {
        const input: { files?: any[], stats?: any, settings?: Partial<Settings>} = {};

        if (settings.aiAllowMetadata) {
            input.files = await getMediaFiles();
        }
        if (settings.aiAllowStats) {
            input.stats = await getStats();
        }
        if (settings.aiAllowSettings) {
            input.settings = settings;
        }

        if (Object.keys(input).length === 0) {
            return {
                error: "No data permissions enabled. Please allow the AI to access data in the AI tab under Settings."
            }
        }

        const result = await analyzeSystem(input);

        return {
            message: "Analysis successful!",
            analysis: result,
        };
    } catch (error) {
        console.error("Analysis error:", error);
        return {
            error:
                error instanceof Error ? error.message : "An unknown error occurred during analysis.",
        };
    }
}
