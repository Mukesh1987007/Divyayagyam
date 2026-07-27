'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, X } from 'lucide-react'
import { AiChat } from '@/components/ai-chat'
import { cn } from '@/lib/utils'

export function AiSupportWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* CHAT WINDOW */}
      <div 
        className={cn(
          "mb-4 transition-all duration-300 origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="w-[350px] max-w-[calc(100vw-2rem)] bg-background border shadow-2xl rounded-2xl overflow-hidden flex flex-col w-full sm:[350px] max-w-[calc(100vw-2rem)] bg-background border shadow-2xl rounded-2xl overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">पंडित दिव्ययज्ञम् जी 🌺</h3>
              <p className="text-[10px] opacity-90">24/7 AI Customer Support</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <AiChat 
            mode="support"
            streamHeight="h-[350px]"
            emptyTitle="हरि ओम्! 🙏"
            emptyDescription="मैं पंडित दिव्ययज्ञम् जी हूँ। पूजा बुकिंग, आर्डर या सनातन धर्म से जुड़ा कोई भी प्रश्न पूछें।"
            suggestions={["पूजा कैसे बुक करें?", "मेरा आर्डर कहाँ है?", "रुद्राभिषेक क्या है?"]}
            className="border-0 rounded-none shadow-none"
          />
        </div>
      </div>

      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  )
}

