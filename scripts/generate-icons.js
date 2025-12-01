// Script to generate PNG icons for the Chrome extension
// Run: node scripts/generate-icons.js

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const iconsDir = path.join(__dirname, '..', 'public', 'icons')

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// Create an SVG template for the icon
function createIconSVG(size) {
  const radius = Math.floor(size * 0.15)
  const fontSize = Math.floor(size * 0.4)
  const yPos = Math.floor(size * 0.65)
  
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#grad)"/>
  <rect x="${Math.floor(size * 0.1)}" y="${Math.floor(size * 0.25)}" width="${Math.floor(size * 0.8)}" height="${Math.floor(size * 0.5)}" rx="${Math.floor(radius * 0.5)}" fill="white" opacity="0.2"/>
  <text x="${size / 2}" y="${yPos}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">J</text>
</svg>`
}

// Generate icons for different sizes
const sizes = [16, 48, 128]

async function generateIcons() {
  console.log('Generating icons...')
  
  for (const size of sizes) {
    const svg = createIconSVG(size)
    const outputPath = path.join(iconsDir, `icon${size}.png`)
    
    try {
      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath)
      console.log(`✓ Created icon${size}.png (${size}x${size})`)
    } catch (error) {
      console.error(`✗ Failed to create icon${size}.png:`, error.message)
    }
  }
  
  console.log('\n✓ Icons generated successfully!')
  console.log(`Location: ${iconsDir}`)
}

generateIcons().catch(console.error)

