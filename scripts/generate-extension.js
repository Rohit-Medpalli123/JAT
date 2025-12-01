// run as `node scripts/generate-extension.js` after vite build
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dist = path.resolve(__dirname, '..', 'dist')
// ensure public files exist
const publicDir = path.resolve(__dirname, '..', 'public')

// copy manifest and background/panel
fs.copyFileSync(path.join(publicDir, 'manifest.json'), path.join(dist, 'manifest.json'))
fs.copyFileSync(path.join(publicDir, 'background.js'), path.join(dist, 'background.js'))
fs.copyFileSync(path.join(publicDir, 'panel.html'), path.join(dist, 'panel.html'))

// copy icons folder
const iconsSrc = path.join(publicDir, 'icons')
const iconsDest = path.join(dist, 'icons')

if (fs.existsSync(iconsSrc)) {
  if (fs.existsSync(iconsDest)) {
    fs.rmSync(iconsDest, { recursive: true, force: true })
  }
  fs.mkdirSync(iconsDest, { recursive: true })
  for (const f of fs.readdirSync(iconsSrc)) {
    fs.copyFileSync(path.join(iconsSrc, f), path.join(iconsDest, f))
  }
} else {
  console.warn('Icons folder not found, creating placeholder icons...')
  if (!fs.existsSync(iconsDest)) {
    fs.mkdirSync(iconsDest, { recursive: true })
  }
}

// Update panel.html to reference the built assets
const panelHtmlPath = path.join(dist, 'panel.html')
if (fs.existsSync(panelHtmlPath)) {
  let panelHtml = fs.readFileSync(panelHtmlPath, 'utf-8')
  
  // Find the built asset files (Vite builds from index.html and creates main-*.js)
  const assetsDir = path.join(dist, 'assets')
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir)
    // Look for main-*.js (from index.html build) or index-*.js
    const indexJs = files.find(f => (f.startsWith('main-') || f.startsWith('index-')) && f.endsWith('.js'))
    const indexCss = files.find(f => (f.startsWith('main-') || f.startsWith('index-')) && f.endsWith('.css'))
    
    if (indexJs) {
      panelHtml = panelHtml.replace(
        /<script[^>]*src="[^"]*main\.jsx"[^>]*><\/script>/,
        `<script type="module" src="/assets/${indexJs}"></script>`
      )
    }
    
    if (indexCss) {
      // Insert CSS link before closing head tag, but only if not already present
      if (!panelHtml.includes('assets/' + indexCss)) {
        panelHtml = panelHtml.replace(
          '</head>',
          `  <link rel="stylesheet" href="/assets/${indexCss}">\n</head>`
        )
      }
    }
    
    fs.writeFileSync(panelHtmlPath, panelHtml)
    console.log('Updated panel.html with production assets')
  } else {
    console.warn('Assets directory not found. Make sure to run vite build first.')
  }
}

console.log('Extension files copied to dist/')

