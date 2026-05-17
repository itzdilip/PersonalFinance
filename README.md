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
