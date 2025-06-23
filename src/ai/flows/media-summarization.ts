'use server';

/**
 * @fileOverview A media summarization AI agent.
 *
 * - summarizeMedia - A function that handles the media summarization process.
 * - SummarizeMediaInput - The input type for the summarizeMedia function.
 * - SummarizeMediaOutput - The return type for the summarizeMedia function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMediaInputSchema = z.object({
  mediaDataUri: z
    .string()
    .describe(
      "A media file (image or video), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The description of the media file.'),
});
export type SummarizeMediaInput = z.infer<typeof SummarizeMediaInputSchema>;

const SummarizeMediaOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the media file content.'),
  categories: z.array(z.string()).describe('Categories that the media file belongs to.'),
});
export type SummarizeMediaOutput = z.infer<typeof SummarizeMediaOutputSchema>;

export async function summarizeMedia(input: SummarizeMediaInput): Promise<SummarizeMediaOutput> {
  return summarizeMediaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMediaPrompt',
  input: {schema: SummarizeMediaInputSchema},
  output: {schema: SummarizeMediaOutputSchema},
  prompt: `You are an AI assistant specialized in summarizing media content.

  Based on the description and the media file, provide a concise summary and suggest relevant categories.

  Description: {{{description}}}
  Media: {{media url=mediaDataUri}}

  Summary:
  Categories:`, // Ensure that the LLM outputs content in the specified format.
});

const summarizeMediaFlow = ai.defineFlow(
  {
    name: 'summarizeMediaFlow',
    inputSchema: SummarizeMediaInputSchema,
    outputSchema: SummarizeMediaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
