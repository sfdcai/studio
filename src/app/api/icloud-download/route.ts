import { run_terminal_command } from '@/lib/tool_code'; // Assuming this utility exists
import { getIcloudConfig } from '/workspace/mediaflow/src/lib/config';

const logError = (message: string, details?: any) => {
  console.error(`Error in /api/icloud-download: ${message}`, details);
};

export async function POST(request: Request) {
  try {
    const icloudConfig = await getIcloudConfig();

    if (!icloudConfig.ICLOUD_USERNAME || !icloudConfig.ICLOUD_PASSWORD || !icloudConfig.ICLOUD_DOWNLOAD_DIR) {
      return new Response(JSON.stringify({ message: 'iCloud configuration not found in config.conf' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const command = `icloudpd --username "${icloudConfig.ICLOUD_USERNAME}" --password "${icloudConfig.ICLOUD_PASSWORD}" --directory "${icloudConfig.ICLOUD_DOWNLOAD_DIR}"`;

    // Execute the command using the tool
    const result = await run_terminal_command(command);
    
    if (result.status !== 'succeeded') {
      logError('Terminal command execution failed', result);
      return new Response(JSON.stringify({ message: 'Failed to execute iCloud download command', error: result.result }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return a success response with the command output
    return new Response(JSON.stringify({ message: 'iCloud download command executed', output: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    logError('An unexpected error occurred', error);
    // Return an error response
    return new Response(JSON.stringify({ message: 'An internal server error occurred', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}