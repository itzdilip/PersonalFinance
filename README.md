# Offline Expense Tracker PWA

A cross-platform, installable, and offline-first expense tracker for personal finance. Built with security and privacy in mind—your data stays on your device.

## Features
- **Offline First**: Works without an internet connection using Service Workers.
- **Local Storage**: Data is stored securely in your browser's IndexedDB.
- **Pre-populated Categories**: Includes common Indian expense categories (Rent, Food, Transport, etc.).
- **Monthly Summaries**: Quick view of your spending habits.
- **Data Portability**: Import and export your data via CSV.
- **Installable**: Add to your home screen or desktop like a native app.

## Tech Stack
- HTML5 & Modern CSS
- Vanilla JavaScript (ES Modules)
- IndexedDB (Storage)
- Service Workers (Offline)
- Web App Manifest (Installability)

## Getting Started
Simply open `index.html` in a modern browser or host it on any static file server (like GitHub Pages or Netlify) to enable PWA features.

### Google Drive & Auth Setup
To enable Google Sign-In and Google Drive backup:
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project.
3.  Navigate to **APIs & Services > Library**.
4.  Search for and **Enable** the **Google Drive API**.
5.  Navigate to **APIs & Services > Credentials**.
6.  Click **Create Credentials > OAuth client ID**.
5.  Select **Web application** as the application type.
6.  Add your domain (e.g., `https://yourusername.github.io`) to **Authorized JavaScript origins**.
7.  Copy the generated **Client ID**.
8.  Replace `YOUR_GOOGLE_CLIENT_ID` in `index.html` (line 36) and `js/app.js` (line 6) with your real Client ID.

## Documentation
- [Technical Design](docs/technical-design.md)
- [User Guide](docs/user-guide.md)
- [Installation Guide](docs/installation-guide.md)

## Development
```bash
# To view the app, use a local server to support ES Modules
npx serve .
```
# PersonalFinance
