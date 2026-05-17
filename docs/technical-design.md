# Technical Design: Offline Expense Tracker PWA

## Overview
A cross-platform, offline-first expense tracker built as a Progressive Web App (PWA).

## Architecture
- **Frontend**: Vanilla HTML5, CSS3, and JavaScript (ES Modules).
- **Storage**: IndexedDB for persistent local data storage.
- **Offline Capabilities**: Service Worker for caching static assets and enabling offline access.
- **Installability**: Web App Manifest (`manifest.json`) for platform-specific installation.

## Data Model (IndexedDB)
### Database Name: `ExpenseTrackerDB`
### Object Stores:
- **`expenses`**:
  - `id`: Auto-incrementing primary key.
  - `amount`: Number (required).
  - `category`: String (required).
  - `date`: String/Date (required).
  - `description`: String (optional).
  - `createdAt`: Timestamp.
- **`categories`**:
  - `id`: Auto-incrementing primary key.
  - `name`: String (unique).
  - `icon`: String (optional).

## Component Modules (`/js`)
- `db.js`: Handles all IndexedDB operations (CRUD).
- `ui.js`: Manages DOM manipulation, event listeners, and data rendering.
- `csv.js`: Logic for parsing CSV imports and generating CSV exports.
- `app.js`: Main entry point, coordinates modules, and registers the Service Worker.

## Offline Strategy
- **Cache Name**: `v1-expense-tracker`
- **Cache Assets**: `index.html`, `css/*.css`, `js/*.js`, `assets/*`, `manifest.json`.
- **Strategy**: Cache-first for static assets to ensure lightning-fast loads and offline reliability.

## CSV Format
Expected format for imports:
`Date,Amount,Category,Description`
Example: `2026-05-17,500,Food & Dining,Lunch at office`
