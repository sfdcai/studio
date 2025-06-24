'use server';

/**
 * @fileOverview A system analysis AI agent for MediaFlow.
 *
 * - analyzeSystem - A function that handles the system analysis process.
 * - SystemAnalysisInput - The input type for the analyzeSystem function.
 * - SystemAnalysisOutput - The return type for the analyzeSystem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { MediaFile, getStats } from '@/lib/data';
import { Settings } from '@/lib/settings';

const SystemAnalysisInputSchema = z.object({
  files: z.array(z.any()).optional().describe("An array of media file metadata objects."),
  stats: z.any().optional().describe("An object containing system statistics like duplicates found and storage saved."),
  settings: z.any().optional().describe("The system's configuration settings."),
});
export type SystemAnalysisInput = z.infer<typeof SystemAnalysisInputSchema>;

const SystemAnalysisOutputSchema = z.object({
  overallStatus: z.enum(["Healthy", "Warning", "Error"]).describe("A single-word summary of the system's health."),
  summary: z.string().describe("A concise, one-paragraph summary of the system's current state, highlighting key metrics and potential issues."),
  observations: z.array(z.object({
      title: z.string().describe("A short, descriptive title for the observation."),
      description: z.string().describe("A detailed description of the observation."),
      severity: z.enum(["Info", "Low", "Medium", "High"]).describe("The severity level of the observation."),
  })).describe("A list of specific observations about the system, both positive and negative."),
  recommendations: z.array(z.object({
      title: z.string().describe("A short, actionable title for the recommendation."),
      description: z.string().describe("A detailed description of the recommended action and why it's important."),
  })).describe("A list of actionable recommendations for improving system performance, efficiency, or configuration."),
});
export type SystemAnalysisOutput = z.infer<typeof SystemAnalysisOutputSchema>;

export async function analyzeSystem(input: SystemAnalysisInput): Promise<SystemAnalysisOutput> {
  return analyzeSystemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSystemPrompt',
  input: {schema: SystemAnalysisInputSchema},
  output: {schema: SystemAnalysisOutputSchema},
  prompt: `You are an expert system administrator and data analyst for "MediaFlow", an automated media management system. Your task is to analyze the provided system data and generate a comprehensive health report.

  Your analysis should be insightful, clear, and focused on providing actionable advice.

  Here is the data you are permitted to analyze. If a section is not provided, it means you do not have permission to view it. Do not mention data you cannot see.

  {{#if files}}
  ## File Metadata (Sample of up to 20 files)
  This is a sample of the most recent files in the system.
  \`\`\`json
  {{{json files}}}
  \`\`\`
  {{/if}}

  {{#if stats}}
  ## System-wide Statistics
  \`\`\`json
  {{{json stats}}}
  \`\`\`
  {{/if}}

  {{#if settings}}
  ## System Configuration
  Do NOT include the API key or user credentials in your analysis.
  \`\`\`json
  {{{json settings}}}
  \`\`\`
  {{/if}}

  Based on the data provided, perform a thorough analysis and generate a structured report.
  - Evaluate the overall health and status.
  - Identify positive aspects (e.g., high success rate, significant storage savings).
  - Pinpoint potential issues (e.g., high error rate, configuration misalignments, processing bottlenecks).
  - Provide concrete, actionable recommendations. For example, if processing errors are high, suggest checking logs. If compression settings seem off for the file types, suggest adjustments.
  `,
});

const analyzeSystemFlow = ai.defineFlow(
  {
    name: 'analyzeSystemFlow',
    inputSchema: SystemAnalysisInputSchema,
    outputSchema: SystemAnalysisOutputSchema,
  },
  async (input) => {
    // Sanitize settings to remove sensitive data before sending to the prompt
    if (input.settings) {
      input.settings.googleAiApiKey = "[REDACTED]";
      input.settings.icloudUser = "[REDACTED]";
    }

    // Limit the number of files sent to the prompt to avoid excessive token usage
    if (input.files && input.files.length > 20) {
      input.files = input.files.slice(0, 20);
    }
    
    const {output} = await prompt(input);
    return output!;
  }
);
