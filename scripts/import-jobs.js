// Script to import job entries from pro.txt into the Job Tracker
// Run: node scripts/import-jobs.js

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const proTxtPath = path.join(__dirname, '..', 'pro.txt')

function parseEntry(line) {
  // Remove leading "- " and normalize separators
  let cleanLine = line.trim().replace(/^-\s*/, '')
  // Normalize " --> " and "--> " separators
  cleanLine = cleanLine.replace(/\s*-->\s*/g, ' --> ')
  const parts = cleanLine.split(' --> ').map(p => p.trim()).filter(p => p)
  
  if (parts.length < 2) return null
  
  // Handle special cases
  let company = parts[0] || ''
  let position = parts[1] || ''
  let contact = parts[2] || ''
  let channel = parts[3] || ''
  let notes = parts[4] || ''
  let statusInfo = parts[5] || ''
  
  // Fix parsing issues
  // If company has "--> " in it, fix it
  if (company.includes('-->')) {
    const split = company.split('-->')
    company = split[0].trim()
    if (split[1]) position = (position ? position + ' ' : '') + split[1].trim()
  }
  
  // Clean up position (remove markdown)
  position = position.replace(/\*\*/g, '').trim()
  
  // If position looks like it contains company info, fix it
  if (position.includes('-->')) {
    const split = position.split('-->')
    position = split[0].trim()
    if (split[1] && !contact) contact = split[1].trim()
  }
  
  // Determine status based on the content
  let status = 'Applied'
  let followUp = ''
  let nextStep = ''
  let priority = 'Medium'
  let finalNotes = notes
  
  // Parse status from notes/statusInfo
  const statusLower = (notes + ' ' + statusInfo).toLowerCase()
  const channelLower = channel.toLowerCase()
  
  if (statusLower.includes('rejected')) {
    status = 'Rejected'
  } else if (statusLower.includes('interview') || statusLower.includes('video interview') || channelLower.includes('video interview')) {
    status = 'Interview'
    priority = 'High'
    // Extract date from "Nov 6, 2025, from 5:30 PM to 6:00 PM IST"
    const dateMatch = (notes + ' ' + channel).match(/Nov\s+(\d+),\s+(\d+)[^,]*,\s+from\s+(\d+):(\d+)\s+(AM|PM)/i)
    if (dateMatch) {
      const day = parseInt(dateMatch[1])
      const year = parseInt(dateMatch[2])
      const hour = parseInt(dateMatch[3])
      const minute = parseInt(dateMatch[4])
      const ampm = dateMatch[5]
      let hour24 = hour
      if (ampm === 'PM' && hour !== 12) hour24 += 12
      if (ampm === 'AM' && hour === 12) hour24 = 0
      // Create datetime-local format (YYYY-MM-DDTHH:mm)
      const date = new Date(year, 10, day, hour24, minute) // Nov = month 10
      followUp = date.toISOString().slice(0, 16)
    }
    // Clean channel if it contains interview info
    if (channelLower.includes('video interview')) {
      channel = 'LinkedIn / Email'
    }
  } else if (statusLower.includes('on hold') || statusLower.includes('hold') || channelLower.includes('on hold')) {
    status = 'On Hold'
    priority = 'Low'
  } else if (statusLower.includes('phone') || statusLower.includes('call') || statusLower.includes('intro call')) {
    status = 'Phone Screen'
    priority = 'High'
  } else if (statusLower.includes('review') || statusLower.includes('applied')) {
    status = 'Applied'
  }
  
  // Combine notes and status info
  if (statusInfo && statusInfo !== notes) {
    finalNotes = notes ? `${notes}. ${statusInfo}` : statusInfo
  }
  
  // Set priority based on status
  if (status === 'Interview' || status === 'Phone Screen') {
    priority = 'High'
  } else if (status === 'On Hold') {
    priority = 'Low'
  }
  
  // Set next step
  if (status === 'Interview') {
    nextStep = 'Prepare for interview'
  } else if (status === 'Phone Screen') {
    nextStep = 'Follow up on call'
  } else if (status === 'Applied') {
    nextStep = 'Wait for response'
  }
  
  return {
    company,
    position,
    contact,
    channel,
    status,
    nextStep,
    followUp,
    priority,
    notes: finalNotes
  }
}

function importJobs() {
  if (!fs.existsSync(proTxtPath)) {
    console.error('pro.txt not found at:', proTxtPath)
    return
  }
  
  const content = fs.readFileSync(proTxtPath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())
  
  const jobs = []
  const uid = () => 'id_' + Math.random().toString(36).slice(2,9)
  
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    
    const entry = parseEntry(line)
    if (entry && entry.company) {
      jobs.push({
        id: uid(),
        createdAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Spread over last week
        ...entry
      })
    }
  }
  
  // Output as JSON that can be imported
  const outputPath = path.join(__dirname, '..', 'initial-jobs.json')
  fs.writeFileSync(outputPath, JSON.stringify(jobs, null, 2))
  
  console.log(`✓ Parsed ${jobs.length} job entries`)
  console.log(`✓ Saved to: ${outputPath}`)
  console.log('\nTo import these into your extension:')
  console.log('1. Open the extension')
  console.log('2. Use the import feature (or manually add them)')
  console.log('3. Or use the browser console to import:')
  console.log(`   const jobs = ${JSON.stringify(jobs)};`)
  console.log('   chrome.storage.local.set({ job_tracker_items_v1: jobs });')
  
  return jobs
}

importJobs()

