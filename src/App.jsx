import React, { useEffect, useState } from 'react'
import { getItems, setItems } from './storage'

const uid = () => 'id_' + Math.random().toString(36).slice(2,9)

export default function App(){
  const [items, setLocalItems] = useState([])
  const [form, setForm] = useState({ company:'', position:'', contact:'', channel:'', status:'Applied', nextStep:'', followUp:'', priority:'Medium', notes:'' })
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(null)

  useEffect(() => { getItems().then(i=>{ setLocalItems(i) }) }, [])
  useEffect(() => { setItems(items) }, [items])

  function addItem(e){
    e.preventDefault()
    const newItem = { id: uid(), createdAt: Date.now(), ...form }
    setLocalItems(prev => [newItem, ...prev])
    setForm({ company:'', position:'', contact:'', channel:'', status:'Applied', nextStep:'', followUp:'', priority:'Medium', notes:'' })
  }

  function deleteItem(id){ 
    if(confirm('Are you sure you want to delete this application?')) {
      setLocalItems(prev => prev.filter(p=>p.id !== id))
    }
  }

  function startEdit(item){
    setEditingId(item.id)
    setEditForm({ ...item })
  }

  function cancelEdit(){
    setEditingId(null)
    setEditForm(null)
  }

  function saveEdit(e){
    e.preventDefault()
    if(editForm && editingId){
      setLocalItems(prev => prev.map(p => p.id === editingId ? { ...p, ...editForm } : p))
      setEditingId(null)
      setEditForm(null)
    }
  }

  function markAsDone(id){
    if(confirm('Mark this event as complete?')){
      setLocalItems(prev => prev.map(p => {
        if(p.id === id){
          // Clear follow-up date and update status if needed
          return { ...p, followUp: '', status: p.status === 'Interview' ? 'On Hold' : p.status }
        }
        return p
      }))
    }
  }

  function exportCSV(){
    const headers = ['Company','Position','Contact','Channel','Status','NextStep','FollowUp','Priority','Notes','CreatedAt']
    const rows = items.map(it=>[it.company,it.position,it.contact,it.channel,it.status,it.nextStep,it.followUp,it.priority,(it.notes||'').replace(/\n/g,' '),new Date(it.createdAt).toLocaleString()])
    const csv = [headers.join(','), ...rows.map(r=>r.map(c=>`"${(c||'').toString().replace(/"/g,'""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'job-tracker.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function parseCSV(text){
    const lines = text.split('\n').filter(line => line.trim())
    if(lines.length < 2) return []
    
    // Parse CSV considering quoted fields
    const parseCSVLine = (line) => {
      const result = []
      let current = ''
      let inQuotes = false
      
      for(let i = 0; i < line.length; i++){
        const char = line[i]
        const nextChar = line[i + 1]
        
        if(char === '"'){
          if(inQuotes && nextChar === '"'){
            current += '"'
            i++ // Skip next quote
          } else {
            inQuotes = !inQuotes
          }
        } else if(char === ',' && !inQuotes){
          result.push(current)
          current = ''
        } else {
          current += char
        }
      }
      result.push(current)
      return result
    }
    
    const headers = parseCSVLine(lines[0])
    const rows = lines.slice(1).map(line => parseCSVLine(line))
    
    return rows.map(row => {
      const item = { id: uid(), createdAt: Date.now() }
      headers.forEach((header, i) => {
        const key = header.toLowerCase().replace(/\s+/g, '')
        const value = row[i] || ''
        
        // Map CSV headers to object keys
        if(key === 'company') item.company = value
        else if(key === 'position') item.position = value
        else if(key === 'contact') item.contact = value
        else if(key === 'channel') item.channel = value
        else if(key === 'status') item.status = value
        else if(key === 'nextstep') item.nextStep = value
        else if(key === 'followup') item.followUp = value
        else if(key === 'priority') item.priority = value
        else if(key === 'notes') item.notes = value
        else if(key === 'createdat'){
          // Try to parse the date
          const date = new Date(value)
          if(!isNaN(date.getTime())){
            item.createdAt = date.getTime()
          }
        }
      })
      return item
    })
  }

  const filtered = items.filter(i=>{
    const q = query.toLowerCase().trim()
    if(!q) return true
    return (i.company||'').toLowerCase().includes(q) || (i.position||'').toLowerCase().includes(q) || (i.contact||'').toLowerCase().includes(q) || (i.notes||'').toLowerCase().includes(q)
  })

  // Group items by priority for Kanban board
  const priorityColumns = ['High', 'Medium', 'Low']
  const itemsByPriority = priorityColumns.reduce((acc, priority) => {
    const priorityItems = filtered.filter(item => item.priority === priority)
    // Sort by creation date (newest first) within each priority
    acc[priority] = priorityItems.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    return acc
  }, {})

  // Calculate priority counts
  const priorityCounts = {
    High: items.filter(i => i.priority === 'High').length,
    Medium: items.filter(i => i.priority === 'Medium').length,
    Low: items.filter(i => i.priority === 'Low').length
  }

  // Get upcoming interviews/follow-ups for this week
  const getUpcomingThisWeek = () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay()) // Sunday
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7) // Next Sunday
    endOfWeek.setHours(23, 59, 59, 999)

    return items
      .filter(item => {
        if (!item.followUp) return false
        const followUpDate = new Date(item.followUp)
        return followUpDate >= startOfWeek && followUpDate <= endOfWeek
      })
      .sort((a, b) => new Date(a.followUp) - new Date(b.followUp))
      .map(item => ({
        ...item,
        followUpDate: new Date(item.followUp),
        dayName: new Date(item.followUp).toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr: new Date(item.followUp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timeStr: new Date(item.followUp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }))
  }

  const upcomingThisWeek = getUpcomingThisWeek()

  return (
    <div className="app">
      <header className="header">
        <h1>Job Application Tracker</h1>
        <div className="controls">
          <input type="file" accept=".json,.csv" id="import-file" style={{display:'none'}} onChange={(e)=>{
            const file = e.target.files[0]
            if(!file) return
            const reader = new FileReader()
            reader.onload = (ev) => {
              try {
                let imported = []
                const content = ev.target.result
                const isCSV = file.name.toLowerCase().endsWith('.csv')
                
                if(isCSV){
                  imported = parseCSV(content)
                } else {
                  imported = JSON.parse(content)
                }
                
                if(Array.isArray(imported) && imported.length > 0){
                  setLocalItems(prev => [...imported, ...prev])
                  alert(`Imported ${imported.length} job entries!`)
                } else {
                  alert('No valid entries found in the file.')
                }
              } catch(err) {
                alert('Error importing file. Please check the format.')
                console.error('Import error:', err)
              }
            }
            reader.readAsText(file)
            e.target.value = ''
          }} />
          <button onClick={()=>document.getElementById('import-file').click()} className="btn">Import CSV/JSON</button>
          <button onClick={exportCSV} className="btn primary">Export CSV</button>
        </div>
      </header>

      <main>
        {/* Priority Statistics Cards */}
        <section className="priority-stats">
          <div className="stat-card stat-high">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <div className="stat-label">High Priority</div>
              <div className="stat-value">{priorityCounts.High}</div>
            </div>
          </div>
          <div className="stat-card stat-medium">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <div className="stat-label">Medium Priority</div>
              <div className="stat-value">{priorityCounts.Medium}</div>
            </div>
          </div>
          <div className="stat-card stat-low">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <div className="stat-label">Low Priority</div>
              <div className="stat-value">{priorityCounts.Low}</div>
            </div>
          </div>
        </section>

        {/* Upcoming This Week Section */}
        {upcomingThisWeek.length > 0 && (
          <section className="upcoming-section">
            <div className="upcoming-header">
              <h2 className="upcoming-title">
                <span className="upcoming-icon">📅</span>
                Upcoming This Week
              </h2>
              <span className="upcoming-count">{upcomingThisWeek.length} {upcomingThisWeek.length === 1 ? 'event' : 'events'}</span>
            </div>
            <div className="upcoming-cards">
              {upcomingThisWeek.map(item => {
                const isToday = new Date(item.followUpDate).toDateString() === new Date().toDateString()
                const isTomorrow = new Date(item.followUpDate).toDateString() === new Date(Date.now() + 86400000).toDateString()
                return (
                  <div className={`upcoming-card ${isToday ? 'today' : ''} ${isTomorrow ? 'tomorrow' : ''}`} key={item.id}>
                    <div className="upcoming-date-badge">
                      <div className="upcoming-day">{item.dayName}</div>
                      <div className="upcoming-date">{item.dateStr}</div>
                    </div>
                    <div className="upcoming-content">
                      <div className="upcoming-company">{item.company}</div>
                      <div className="upcoming-position">{item.position}</div>
                      <div className="upcoming-details">
                        <span className="upcoming-time">🕐 {item.timeStr}</span>
                        {item.contact && <span className="upcoming-contact">👤 {item.contact}</span>}
                      </div>
                      {item.nextStep && (
                        <div className="upcoming-next-step">
                          <span className="upcoming-label">Next:</span> {item.nextStep}
                        </div>
                      )}
                      <div className="upcoming-status-badge">
                        <span className={`badge status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>{item.status}</span>
                        <span className={`badge priority-${item.priority.toLowerCase()}`}>{item.priority}</span>
                      </div>
                    </div>
                    <div className="upcoming-actions">
                      <button className="btn-small done" onClick={()=>markAsDone(item.id)}>Done</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <section className="card form-card">
          <form onSubmit={addItem} className="form-grid">
            <input required placeholder="Company" value={form.company} onChange={e=>setForm({...form,company:e.target.value})} />
            <input required placeholder="Position" value={form.position} onChange={e=>setForm({...form,position:e.target.value})} />
            <input placeholder="Recruiter / Contact" value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} />
            <input placeholder="Channel (LinkedIn / Email / Portal)" value={form.channel} onChange={e=>setForm({...form,channel:e.target.value})} />
            <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
              <option>Applied</option>
              <option>Phone Screen</option>
              <option>Interview</option>
              <option>On Hold</option>
              <option>Rejected</option>
              <option>Offer</option>
            </select>
            <input placeholder="Next Step / Action" value={form.nextStep} onChange={e=>setForm({...form,nextStep:e.target.value})} />
            <input type="datetime-local" value={form.followUp} onChange={e=>setForm({...form,followUp:e.target.value})} />
            <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <textarea placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}></textarea>

            <div className="form-actions">
              <button className="btn success" type="submit">Add</button>
              <button type="button" className="btn" onClick={()=>setForm({ company:'', position:'', contact:'', channel:'', status:'Applied', nextStep:'', followUp:'', priority:'Medium', notes:'' })}>Reset</button>
            </div>
          </form>
        </section>

        <section className="card">
          <div className="search-row">
            <input placeholder="Search companies, position or notes" value={query} onChange={e=>setQuery(e.target.value)} />
          </div>

          <div className="kanban-board">
            {priorityColumns.map(priority => {
              const priorityItems = itemsByPriority[priority] || []
              return (
                <div className="kanban-column" key={priority}>
                  <div className="kanban-header">
                    <h3 className="kanban-title">{priority} Priority</h3>
                    <span className="kanban-count">{priorityItems.length}</span>
                  </div>
                  <div className="kanban-cards">
                    {priorityItems.map(item => (
                      <div className="item" key={item.id}>
                        {editingId === item.id ? (
                          <form className="edit-form" onSubmit={saveEdit}>
                            <div className="edit-form-grid">
                              <input required placeholder="Company" value={editForm.company} onChange={e=>setEditForm({...editForm,company:e.target.value})} />
                              <input required placeholder="Position" value={editForm.position} onChange={e=>setEditForm({...editForm,position:e.target.value})} />
                              <input placeholder="Contact" value={editForm.contact} onChange={e=>setEditForm({...editForm,contact:e.target.value})} />
                              <input placeholder="Channel" value={editForm.channel} onChange={e=>setEditForm({...editForm,channel:e.target.value})} />
                              <select value={editForm.status} onChange={e=>setEditForm({...editForm,status:e.target.value})}>
                                <option>Applied</option>
                                <option>Phone Screen</option>
                                <option>Interview</option>
                                <option>On Hold</option>
                                <option>Rejected</option>
                                <option>Offer</option>
                              </select>
                              <select value={editForm.priority} onChange={e=>setEditForm({...editForm,priority:e.target.value})}>
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                              </select>
                              <input placeholder="Next Step" value={editForm.nextStep} onChange={e=>setEditForm({...editForm,nextStep:e.target.value})} />
                              <input type="datetime-local" value={editForm.followUp || ''} onChange={e=>setEditForm({...editForm,followUp:e.target.value})} />
                              <textarea placeholder="Notes" value={editForm.notes} onChange={e=>setEditForm({...editForm,notes:e.target.value})}></textarea>
                            </div>
                            <div className="edit-actions">
                              <button type="submit" className="btn success">Save</button>
                              <button type="button" className="btn" onClick={cancelEdit}>Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="item-info">
                              <div className="item-header">
                                <div className="title">{item.company} <span className="muted">— {item.position}</span></div>
                                <div className="badge-group">
                                  <span className={`badge priority-${item.priority.toLowerCase()}`}>{item.priority}</span>
                                </div>
                              </div>
                              <div className="item-details">
                                {item.contact && <div className="detail-row">
                                  <span className="detail-label">Contact:</span>
                                  <span className="detail-value">{item.contact}</span>
                                </div>}
                                {item.channel && <div className="detail-row">
                                  <span className="detail-label">Channel:</span>
                                  <span className="detail-value">{item.channel}</span>
                                </div>}
                                {item.nextStep && <div className="detail-row highlight">
                                  <span className="detail-label">Next Step:</span>
                                  <span className="detail-value">{item.nextStep}</span>
                                </div>}
                                {item.followUp && <div className="detail-row highlight">
                                  <span className="detail-label">Follow-up:</span>
                                  <span className="detail-value">{new Date(item.followUp).toLocaleString()}</span>
                                </div>}
                                {item.notes && <div className="notes">{item.notes}</div>}
                              </div>
                            </div>
                            <div className="item-actions">
                              <button className="btn edit" onClick={()=>startEdit(item)}>Edit</button>
                              <button className="btn danger" onClick={()=>deleteItem(item.id)}>Delete</button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    {priorityItems.length === 0 && (
                      <div className="kanban-empty">No items in this priority</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {filtered.length === 0 && <div className="muted" style={{textAlign:'center', padding:'20px'}}>No applications found. Add some using the form above.</div>}
        </section>
      </main>

      <footer className="footer">Tip: Click the extension icon to open the tracker. Data stored in your browser.</footer>
    </div>
  )
}

