'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Loader2, Sparkles, Copy, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export type ChatMode = 'pandit' | 'admin_content' | 'admin_blog' | 'admin_seo' | 'support' | 'gargi'

type Msg = { role: 'user' | 'assistant'; content: string }

export function AiChat({
  mode = 'pandit',
  placeholder = 'Type your question…',
  suggestions = [],
  emptyTitle = 'नमस्ते 🙏',
  emptyDescription = 'Ask anything about pujas, festivals, mantras, temples…',
  className,
  streamHeight = 'h-[500px]',
}: {
  mode?: ChatMode
  placeholder?: string
  suggestions?: string[]
  emptyTitle?: string
  emptyDescription?: string
  className?: string
  streamHeight?: string
}) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function send(text?: string) {
    const q = (text ?? input).trim()
    if (!q || loading) return
    setInput('')
    setLoading(true)
    const nextMessages: Msg[] = [...messages, { role: 'user', content: q }, { role: 'assistant', content: '' }]
    setMessages(nextMessages)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          mode,
          session_id: sessionId,
          messages: nextMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
          stream: true,
        }),
      })

      if (!res.ok || !res.body) {
        const txt = await res.text().catch(() => '')
        throw new Error(txt || `HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        full += chunk
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: full }
          return copy
        })
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        toast.error(err?.message || 'AI request failed')
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: `⚠️ ${err?.message || 'Error'}` }
          return copy
        })
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  function stop() { abortRef.current?.abort() }
  function reset() { setMessages([]); setInput('') }

  return (
    <Card className={cn('flex flex-col overflow-hidden', className)}>
      <div ref={scrollRef} className={cn('flex-1 overflow-y-auto p-4 space-y-3', streamHeight)}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="h-14 w-14 rounded-full om-gradient flex items-center justify-center text-white text-2xl">ॐ</div>
            <h3 className="mt-4 font-semibold text-lg">{emptyTitle}</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">{emptyDescription}</p>
            {suggestions.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-lg">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {}}
                    className="text-xs px-3 py-1.5 rounded-full border hover:bg-primary/5 hover:border-primary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((m, i) => {
            const isUser = m.role === 'user'
            const isEmpty = !m.content && !isUser && loading
            return (
              <div key={i} className={cn('flex gap-2', isUser ? 'justify-end' : 'justify-start')}>
                {!isUser && (
                  <div className="h-8 w-8 rounded-full om-gradient flex items-center justify-center text-white text-sm shrink-0">ॐ</div>
                )}
                <div className={cn('rounded-2xl px-4 py-2.5 max-w-[80%] whitespace-pre-wrap break-words',
                  isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}>
                  {isEmpty ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" /> Thinking…
                    </span>
                  ) : (
                    <>
                      {m.content}
                      {!isUser && m.content && (
                        <button
                          onClick={() => {}}
                          className="ml-2 opacity-40 hover:opacity-100 transition-opacity"
                          title="Copy"
                        >
                          <Copy className="inline h-3 w-3" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <CardContent className="p-3 border-t bg-background">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
            }}
            placeholder={placeholder}
            rows={1}
            className="resize-none min-h-[42px] max-h-32"
            disabled={loading}
          />
          {loading ? (
            <Button onClick={stop} variant="destructive" size="icon" title="Stop">
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : (
            <Button onClick={() => send()} disabled={!input.trim()} size="icon" title="Send">
              <Send className="h-4 w-4" />
            </Button>
          )}
          {messages.length > 0 && (
            <Button onClick={reset} variant="outline" size="icon" title="Reset">
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> Powered by Gemini</span>
          <Badge variant="secondary" className="text-[10px]">{mode}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
