export const STORAGE_KEY = 'job_tracker_items_v1'

export async function getItems() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((res) => {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        res(result[STORAGE_KEY] || [])
      })
    })
  }
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
}

export async function setItems(items) {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ [STORAGE_KEY]: items })
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

