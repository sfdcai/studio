import { read_file } from './tools'; // Assuming a tools file with read_file

interface IcloudConfig {
  username: string;
  password?: string; // Make password optional or handle securely
  downloadDir: string;
}

export async function getIcloudConfig(): Promise<IcloudConfig | null> {
  try {
    const configFileContent = await read_file({ path: 'config.conf' });
    if (!configFileContent || configFileContent.status !== 'succeeded') {
      console.error('Failed to read config.conf');
      return null;
    }

    const configLines = configFileContent.content.split('\n');
    let username = '';
    let password = '';
    let downloadDir = '';

    for (const line of configLines) {
      const [key, value] = line.split('=');
      if (key === 'ICLOUD_USERNAME') {
        username = value.trim();
      } else if (key === 'ICLOUD_PASSWORD') {
        password = value.trim();
      } else if (key === 'ICLOUD_DOWNLOAD_DIR') {
        downloadDir = value.trim();
      }
    }

    if (username && downloadDir) {
      return {
        username,
        password, // Consider more secure ways to handle passwords
        downloadDir,
      };
    } else {
      console.error('Missing required iCloud configuration in config.conf');
      return null;
    }

  } catch (error) {
    console.error('Error reading config.conf:', error);
    return null;
  }
}