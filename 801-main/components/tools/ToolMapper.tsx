'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

// Define the signature of a Tool Component
type ToolComponentProps = {
  tool: any
  isPremiumUnlocked: boolean
}

// 1. IMPORT YOUR CUSTOM REACT TOOLS HERE
// import KundliMilanTool from './kundli-milan'

// 2. MAP SLUGS TO COMPONENTS
const TOOL_REGISTRY: Record<string, React.FC<ToolComponentProps>> = {
  // 'kundli-milan': KundliMilanTool,
}

export function ToolMapper({ tool, isPremiumUnlocked }: { tool: any, isPremiumUnlocked: boolean }) {
  const Component = TOOL_REGISTRY[tool.slug]

  if (Component) {
    return <Component tool={tool} isPremiumUnlocked={isPremiumUnlocked} />
  }

  // FALLBACK: Load the HTML/JS from database in an iframe
  const srcDoc = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${tool.name}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { 
          font-family: 'Inter', system-ui, -apple-system, sans-serif; 
          padding: 24px; 
          background: transparent; 
          color: #0f172a;
          line-height: 1.5;
        }
        h1, h2, h3, h4, h5 { font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 0.75rem; }
        h1 { font-size: 1.75rem; }
        h2 { font-size: 1.5rem; }
        h3 { font-size: 1.25rem; }
        p { color: #475569; margin-top: 0; margin-bottom: 1rem; }
        label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.375rem; }
        input, select, textarea {
          width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;
          background-color: #fff; color: #0f172a; font-size: 0.875rem; margin-bottom: 1.25rem;
          box-sizing: border-box; transition: all 0.2s; font-family: inherit; outline: none;
        }
        input:focus, select:focus, textarea:focus { border-color: #f97316; box-shadow: 0 0 0 2px #ffedd5; }
        button {
          display: inline-flex; align-items: center; justify-content: center; padding: 0.625rem 1.25rem;
          font-size: 0.875rem; font-weight: 600; border-radius: 0.5rem; border: none;
          background-color: #ea580c; color: white; cursor: pointer; transition: background-color 0.2s;
          box-sizing: border-box; width: 100%; font-family: inherit;
        }
        button:hover { background-color: #c2410c; }
        .card { border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.5rem; background: white; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
        th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background-color: #f8fafc; font-weight: 600; color: #475569; font-size: 0.875rem; }
        
        /* User's custom CSS below */
        ${tool.cssCode || ''}
      </style>
    </head>
    <body>
      ${tool.htmlCode || '<div class="text-center p-10 text-gray-500">No UI configured for this tool yet.</div>'}
      <script>
        ${tool.jsCode || ''}
      </script>
    </body>
    </html>`

  return (
    <div className="w-full bg-white border rounded-xl shadow-sm min-h-[600px] overflow-hidden relative">
      <iframe 
        srcDoc={srcDoc}
        className="w-full h-full min-h-[600px] border-0"
        sandbox="allow-scripts allow-forms allow-same-origin"
        title={tool.name}
      />
    </div>
  )
}
