'use server';

/**
 * @fileOverview A media analysis AI agent.
 *
 * - analyzeMedia - A function that handles the media analysis process.
 * - AnalyzeMediaInput - The input type for the analyzeMedia function.
 * - AnalyzeMediaOutput - The return type for the analyzeMedia function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMediaInputSchema = z.object({
  mediaDataUri: z
    .string()
    .describe(
      "A media file (image or video), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  fileName: z.string().describe('The name of the file provided.'),
});
export type AnalyzeMediaInput = z.infer<typeof AnalyzeMediaInputSchema>;

const AnalyzeMediaOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the media file content.'),
  categories: z.array(z.string()).describe('A list of categories that the media file belongs to.'),
  technicalAnalysis: z.object({
    mediaType: z.string().describe('The type of media, e.g., "Image", "Video".'),
    inferredCamera: z.string().describe('Infer the camera or device type from the image style, quality, and content. e.g., "DSLR", "Smartphone", "GoPro". Be creative.'),
    compositionTips: z.string().describe('Provide 1-2 brief, actionable tips to improve the photo composition or shot.'),
    lightingAnalysis: z.string().describe('Briefly analyze the lighting in the media (e.g., "natural light", "studio lighting", "low light").'),
  }),
  suggestions: z.object({
    initialCompression: z.enum(['Low', 'Medium', 'High']).describe('Suggest an initial compression level based on the content. "High" for simple content, "Low" for detailed/professional photos.'),
  }),
});
export type AnalyzeMediaOutput = z.infer<typeof AnalyzeMediaOutputSchema>;

export async function analyzeMedia(input: AnalyzeMediaInput): Promise<AnalyzeMediaOutput> {
  return analyzeMediaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMediaPrompt',
  input: {schema: AnalyzeMediaInputSchema},
  output: {schema: AnalyzeMediaOutputSchema},
  prompt: `You are an expert media analyst for a file management application. Your task is to analyze the provided media file and return a structured analysis.

  Analyze the media file provided and the filename.

  Filename: {{{fileName}}}
  Media: {{media url=mediaDataUri}}

  Based on your analysis, provide a detailed, structured response. Infer the camera type based on visual cues. Provide actionable feedback and suggestions as per the output schema.
  `,
});

const analyzeMediaFlow = ai.defineFlow(
  {
    name: 'analyzeMediaFlow',
    inputSchema: AnalyzeMediaInputSchema,
    outputSchema: AnalyzeMediaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);