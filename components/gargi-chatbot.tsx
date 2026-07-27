'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AiChat } from '@/components/ai-chat'
import { MessageCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function GargiChatbot() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-14 w-14 rounded-full shadow-2xl z-50 transition-all duration-300",
          isOpen ? "bg-slate-800 hover:bg-slate-900" : "bg-orange-600 hover:bg-orange-700"
        )}
      >
        {isOpen ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6 text-white" />}
      </Button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-[350px] max-w-[calc(100vw-2rem)] max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl z-50 overflow-hidden transition-all duration-300 origin-bottom-right border border-orange-100",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="text-2xl">👩🏻‍💼</span> गार्गी (Gargi)
            </h3>
            <p className="text-xs text-orange-100">Customer Support Assistant</p>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <AiChat 
          mode="gargi"
          emptyTitle="हरि ओम्! 🙏"
          emptyDescription="मैं गार्गी, आपकी सहायता के लिए यहाँ हूँ। पूजा, उत्पाद या बुकिंग से जुड़ा कोई भी सवाल पूछें।"
          placeholder="अपना प्रश्न पूछें..."
          suggestions={['पूजा कैसे बुक करें?', 'मेरे ऑर्डर का स्टेटस?', 'रुद्राक्ष की कीमत?']}
          streamHeight="flex-1 min-h-[300px]"
          className="border-none shadow-none rounded-none flex-1 overflow-hidden"
        />
      </div>
    </>
  )
}
