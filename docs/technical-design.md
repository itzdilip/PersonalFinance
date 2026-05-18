# Technical Design: Kubera-Finance Flow

## Overview
A cross-platform, offline-first personal finance tracker built as a Progressive Web App (PWA).

## Architecture
- **Frontend**: Vanilla HTML5, CSS3, and JavaScript (ES Modules).
- **Storage**: IndexedDB for persistent local data storage.
- **Analytics**: Chart.js for interactive data visualization.
- **Cloud Integration**: Google Identity Services (GIS) for authentication and Google Drive API for backups.
- **Offline Capabilities**: Service Worker for caching static assets and enabling offline access.

## Data Model (IndexedDB)
### Database Name: `ExpenseTrackerDB`
### Current Version: `3`
### Object Stores:
- **`expenses`**:
  - `id`: Auto-incrementing primary key.
  - `amount`: Number (required).
  - `category`: String (required).
  - `date`: String/Date (required).
  - `description`: String (optional).
  - `userId`: String (link to Google 'sub' or 'local').
  - `createdAt`: Timestamp.
- **`categories`**:
  - `id`: Auto-incrementing primary key.
  - `name`: String (unique).

## Component Modules (`/js`)
- `db.js`: Handles all IndexedDB operations (CRUD).
- `ui.js`: Manages DOM manipulation, tab switching, and chart rendering.
- `csv.js`: Logic for parsing CSV imports and generating CSV exports.
- `drive.js`: Google Drive API integration for file uploads.
- `app.js`: Main entry point, state management, and event orchestration.

## Offline Strategy
- **Cache Name**: `kubera-finance-v1`
- **Strategy**: Cache-first for static assets. External libraries (FontAwesome, Google Fonts, Chart.js) are also cached upon first load or install.

## Integration Workflow
1. **Local Context**: App works entirely offline using IndexedDB and `localStorage`.
2. **Cloud Context**: User provides a Google Client ID in the Settings tab.
3. **Dynamic Injection**: Google Auth scripts and buttons are injected only when configured.
4. **Sync**: CSV data is generated on the fly and uploaded to a "drive.file" scoped hidden area or specific file in the user's Drive.
