# Kubera-Finance Flow

A modern, cross-platform, and offline-first personal finance tracker. Built with security and privacy in mind—your data stays on your device, with optional secure backups to your own Google Drive.

## Features
- **Offline First**: Works without an internet connection using Service Workers.
- **Visual Analytics**: Interactive charts for category distribution and spending trends.
- **Local Storage**: Data is stored securely in your browser's IndexedDB.
- **Google Drive Sync**: Optional backup and restore using your personal Google Drive.
- **Data Portability**: Import and export your data via CSV.
- **Installable (PWA)**: Add to your home screen or desktop like a native app.
- **Privacy Focused**: No third-party servers. Your financial data is yours alone.

## Tech Stack
- HTML5, Modern CSS (Vanilla)
- Vanilla JavaScript (ES Modules)
- IndexedDB (Storage)
- Service Workers (Offline PWA)
- Chart.js (Analytics)
- Google Identity Services & Drive API (Optional Sync)

## Getting Started
Simply open `index.html` in a modern browser or host it on any static file server to enable PWA features.

### Google Drive & Auth Setup
To enable Google Sign-In and Google Drive backup:
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project named "Kubera-Finance Flow".
3.  Navigate to **APIs & Services > Library** and enable **Google Drive API**.
4.  Navigate to **APIs & Services > Credentials**.
5.  Click **Create Credentials > OAuth client ID** (Web application).
6.  Add your domain to **Authorized JavaScript origins**.
7.  Copy the generated **Client ID**.
8.  Go to the **Settings** tab in the app and paste your Client ID.

## Documentation
- [Technical Design](docs/technical-design.md)
- [User Guide](docs/user-guide.md)
- [Installation Guide](docs/installation-guide.md)

## Development
```bash
# To view the app, use a local server to support ES Modules
npx serve .
```
