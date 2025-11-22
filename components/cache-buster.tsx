'use client'

import { useEffect } from 'react'

export function CacheBuster() {
  useEffect(() => {
    // Only run once per session
    const hasCleared = sessionStorage.getItem('cache-cleared')
    
    if (!hasCleared) {
      try {
        // Clear all Clerk tokens and auth data
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (
            key.includes('clerk') || 
            key.includes('auth') || 
            key.includes('session') ||
            key.includes('__clerk')
          )) {
            keysToRemove.push(key)
          }
        }
        
        // Remove old auth keys
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key)
          } catch (e) {
            console.log('Could not remove:', key)
          }
        })
        
        // Clear service workers
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
              registration.unregister()
            })
          })
        }
        
        // Mark as cleared for this session
        sessionStorage.setItem('cache-cleared', 'true')
        
        console.log('🧹 Cache cleared successfully')
      } catch (error) {
        console.log('Cache clear error:', error)
      }
    }
  }, [])

  return null
}

