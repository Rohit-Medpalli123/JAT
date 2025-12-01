# Job Tracker — Chrome Extension

A modern, easy-to-use Chrome extension for tracking job applications. Built with Vite + React.

## Features

- ✅ Track job applications with company, position, contact info, and status
- ✅ Set follow-up dates and priorities
- ✅ Search and filter applications
- ✅ Export data to CSV
- ✅ Modern, responsive UI
- ✅ Persistent storage using Chrome's storage API

## Quick Start

### Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - Visit `http://localhost:5173` to see the app in dev mode
   - Note: `chrome.storage` won't be available in dev; the app uses `localStorage` as fallback

### Build for Chrome Extension

1. **Build the extension:**
   ```bash
   npm run build:ext
   ```
   This will:
   - Build the React app with Vite
   - Copy all extension files to `dist/`
   - Update `panel.html` to reference built assets

2. **Load in Chrome:**
   - Open Chrome and navigate to `chrome://extensions`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist/` folder from this project

3. **Use the extension:**
   - Click the extension icon in your toolbar
   - A new tab will open with the Job Tracker interface

## Project Structure

```
job-tracker-vite/
├─ public/
│  ├─ icons/          # Extension icons (16x16, 48x48, 128x128)
│  ├─ manifest.json   # Chrome extension manifest
│  ├─ background.js   # Service worker for extension
│  └─ panel.html      # Extension page HTML
├─ src/
│  ├─ main.jsx        # React entry point
│  ├─ App.jsx         # Main application component
│  ├─ storage.js      # Storage utilities (Chrome storage + localStorage fallback)
│  └─ styles.css      # Modern CSS styles
├─ scripts/
│  └─ generate-extension.js  # Build script for extension
├─ index.html         # Dev server HTML
├─ package.json
├─ vite.config.js
└─ README.md
```

## Icon Setup

**Important:** You need to add icon files to `public/icons/`:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can create simple icons using any image editor, or use online tools like:
- [Icon Generator](https://www.favicon-generator.org/)
- [Figma](https://www.figma.com/)

The extension will work without icons, but Chrome will show a default placeholder.

## Usage

1. **Add a job application:**
   - Fill in Company and Position (required)
   - Add optional details like contact, channel, status, follow-up date
   - Click "Add" to save

2. **Search applications:**
   - Use the search box to filter by company, position, contact, or notes

3. **Export data:**
   - Click "Export CSV" to download all applications as a CSV file

4. **Delete applications:**
   - Click "Delete" on any application card to remove it

## Data Storage

- **In Chrome Extension:** Data is stored using `chrome.storage.local`
- **In Dev Mode:** Data falls back to `localStorage`
- All data is stored locally in your browser

## Customization

- **Colors:** Edit CSS variables in `src/styles.css` (`:root` section)
- **Fields:** Modify the form fields in `src/App.jsx`
- **Styling:** Update `src/styles.css` for custom styling

## Troubleshooting

- **Extension not loading:** Make sure you're selecting the `dist/` folder, not the project root
- **Icons missing:** Add icon files to `public/icons/` before building
- **Build errors:** Run `npm install` to ensure all dependencies are installed

## Future Enhancements

- Edit functionality for existing applications
- Confirmation modals for deletions
- Notifications for follow-up dates (using `chrome.alarms`)
- Multi-device sync
- CSV/Excel import

## License

MIT

