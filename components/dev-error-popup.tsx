"use client"

import { useEffect, useState } from 'react'
import { AlertTriangle, Terminal, X } from 'lucide-react'

export function DevErrorPopup({ error, reset }: { error: Error & { digest?: string }, reset?: () => void }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Log error to console for extra context
// console.error("🔴 [Auto-Detect Bot] Captured Error:", error) (removed for production)
  }, [error])

  if (!isVisible) return null

  // Extract file path/name from the stack trace if possible
  const stackLines = error.stack?.split('\n') || []
  // Find the first line in the stack that looks like a file path (usually contains .tsx or .jsx or .ts)
  const fileLine = stackLines.find(line => line.includes('.tsx') || line.includes('.jsx') || line.includes('.ts') || line.includes('.js'))
  let fileName = "Unknown File"
  let lineNumber = ""
  
  if (fileLine) {
    const match = fileLine.match(/([^/\\]+\.[tj]sx?:\d+:\d+)/)
    if (match) {
      const parts = match[1].split(':')
      fileName = parts[0]
      lineNumber = parts[1]
    } else {
       // Fallback extraction
       const clean = fileLine.replace(/.*\(|\).*/g, '').trim()
       fileName = clean
    }
  }

  return (
    <div className="fixed bottom-6 left-6 z-[9999] max-w-sm bg-red-950 border border-red-500/50 shadow-2xl rounded-xl overflow-hidden animate-in slide-in-from-bottom-5">
      <div className="bg-red-900/50 px-4 py-2 border-b border-red-500/20 flex justify-between items-center">
        <div className="flex items-center gap-2 text-red-200 text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          Bot Auto-Detect Alert
        </div>
        <button onClick={() => setIsVisible(false)} className="text-red-400 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-white font-semibold text-sm break-words">{error.message || "Unknown Server Error"}</h3>
        </div>

        <div className="bg-black/40 rounded-lg p-3 border border-red-500/20">
          <div className="flex items-center gap-2 text-red-300 text-xs mb-1 font-mono">
            <Terminal className="h-3 w-3" />
            File to fix:
          </div>
          <p className="text-red-100 text-sm font-mono break-all font-semibold">
            {fileName} <span className="text-red-400 font-normal">{lineNumber ? `(Line ${lineNumber})` : ''}</span>
          </p>
        </div>

        {reset && (
          <button 
            onClick={() => reset()}
            className="w-full bg-red-600 hover:bg-red-500 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
          >
            Auto-Heal & Try Again
          </button>
        )}
      </div>
    </div>
  )
}
