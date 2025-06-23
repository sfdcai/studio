# **App Name**: MediaFlow

## Core Features:

- Secure Authentication: User authentication and secure session management using Firebase Authentication, including 2FA re-authentication trigger.
- Dashboard View: Dashboard displaying key metrics like files processing, storage saved, and errors.
- File Explorer: File Explorer providing a searchable and filterable view of the media collection, categorized by date, camera, and processing status.
- Configuration Management: Secure interface for managing system settings, including NAS path, Google Drive path, and compression levels.
- Log Viewer: A real-time stream of logs from the backend service, displayed in a user-friendly format.
- AI-Powered Media Summarization: Utilize a generative AI tool that will help to organize, categorize, and summarize media files to generate descriptions or summaries to facilitate improved search functionality.
- iCloud Upload: Upload processed and optimized media files to iCloud Photos, leveraging the icloud_photos_downloader library. Remove the original from icloud after successful compression and upload.

## Style Guidelines:

- Primary color: Deep Indigo (#3F51B5) to represent reliability and depth in media management.
- Background color: Very light grey (#F0F2F5) to provide a clean and unobtrusive backdrop.
- Accent color: Soft Cyan (#00BCD4) used for interactive elements and highlights, providing a contrast with the indigo.
- Body and headline font: 'Inter', sans-serif, for a modern, clean, and readable interface.