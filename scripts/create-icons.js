// Simple script to create placeholder icons using Node.js
// Run: node scripts/create-icons.js

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const iconsDir = path.join(__dirname, '..', 'public', 'icons')

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// Create a simple SVG icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="24" fill="#4f46e5"/>
  <text x="64" y="80" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle">J</text>
</svg>`

// Note: This creates SVG files. For PNG, you'd need a library like 'sharp' or use an online converter
// For now, we'll create SVG files that can be converted to PNG

const sizes = [16, 48, 128]
sizes.forEach(size => {
  const svg = svgIcon.replace('width="128" height="128"', `width="${size}" height="${size}"`)
    .replace('viewBox="0 0 128 128"', `viewBox="0 0 ${size} ${size}"`)
    .replace('rx="24"', `rx="${Math.floor(size * 0.1875)}"`)
    .replace('font-size="64"', `font-size="${Math.floor(size * 0.5)}"`)
    .replace('y="80"', `y="${Math.floor(size * 0.625)}"`)
  
  fs.writeFileSync(path.join(iconsDir, `icon${size}.svg`), svg)
  console.log(`Created icon${size}.svg`)
})

console.log('\n⚠️  Note: Chrome extensions need PNG files, not SVG.')
console.log('Please convert these SVG files to PNG, or create PNG icons manually.')
console.log('You can use online tools like: https://cloudconvert.com/svg-to-png')
console.log('Or install a library like "sharp" to convert programmatically.')

