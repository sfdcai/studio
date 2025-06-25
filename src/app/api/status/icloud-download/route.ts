import { run_terminal_command } from 'src/lib/tool_code';

export async function GET() {
  try {
    const command = 'pm2 status icloudpd';
    const result = await run_terminal_command(command);

    let status = 'not running';
    let message = result.stdout;

    if (result.stdout && result.stdout.includes('online')) {
      status = 'running';
    } else if (result.stderr) {
      message = result.stderr;
    }

    return new Response(JSON.stringify({ status, message }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ status: 'error', message: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}