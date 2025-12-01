# Troubleshooting Guide

## Blank Page Issue

If you see a blank page when clicking the extension icon:

### 1. Reload the Extension
- Go to `chrome://extensions`
- Find "Job Tracker — Quick App"
- Click the reload icon (🔄)

### 2. Check Console Errors
- Click the extension icon to open the page
- Press `F12` or right-click → "Inspect"
- Check the Console tab for errors
- Common errors:
  - `Failed to load resource` - Asset path issue
  - `CSP violation` - Content Security Policy issue
  - `Module not found` - Build issue

### 3. Verify Build
Make sure you've built the extension:
```bash
npm run build:ext
```

### 4. Check File Structure
Ensure `dist/` folder has:
- `panel.html`
- `manifest.json`
- `background.js`
- `assets/` folder with `.js` and `.css` files
- `icons/` folder with icon files

### 5. Check panel.html
Open `dist/panel.html` and verify:
- Script tag points to `/assets/main-*.js`
- CSS link points to `/assets/main-*.js`

### 6. Common Fixes

**If assets aren't loading:**
- Try reloading the extension
- Check that paths in `panel.html` match actual files in `dist/assets/`

**If you see CSP errors:**
- The manifest might need `web_accessible_resources` (usually not needed for extension pages)

**If React isn't loading:**
- Check that the built JS file contains React code
- Verify the script tag type is `type="module"`

### 7. Rebuild from Scratch
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build:ext
```

Then reload the extension in Chrome.

