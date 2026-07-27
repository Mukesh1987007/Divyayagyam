'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function TranslationProvider() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // PATCH: Prevent React from crashing when Google Translate modifies the DOM
    if (typeof Node === 'function' && Node.prototype) {
      const originalRemoveChild = Node.prototype.removeChild;
      (Node.prototype as any).removeChild = function (child: any) {
        if (child.parentNode !== this) {
// console.warn('DOM manipulation intercepted: removeChild', child, this); (removed for production)
          return child;
        }
        return originalRemoveChild.apply(this, arguments as any);
      };

      const originalInsertBefore = Node.prototype.insertBefore;
      (Node.prototype as any).insertBefore = function (newNode: any, referenceNode: any) {
        if (referenceNode && referenceNode.parentNode !== this) {
// console.warn('DOM manipulation intercepted: insertBefore', referenceNode, this); (removed for production)
          return newNode;
        }
        return originalInsertBefore.apply(this, arguments as any);
      };
    }

    if (pathname?.startsWith('/admin')) return

    // 1. Read language from localStorage
    const lang = localStorage.getItem('lang') || 'en'

    // 2. Set the Google Translate Cookie
    if (lang === 'en') {
      // Clear cookie for base language
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + window.location.hostname
      
      // Do not load the Google Translate script at all if default language is selected.
      // This completely disables auto-translate unless explicitly requested by the user.
      return
    } else {
      document.cookie = `googtrans=/en/${lang}; path=/`
      document.cookie = `googtrans=/en/${lang}; path=/; domain=.${window.location.hostname}`
    }

    // 3. Inject Google Translate CSS to hide UI frames
    let style = document.getElementById('__google_translate_css')
    if (!style) {
      style = document.createElement('style')
      style.id = '__google_translate_css'
      style.textContent = `
        .skiptranslate, iframe.skiptranslate, .goog-te-banner-frame, #goog-gt-tt, .goog-te-balloon-frame,
        .goog-te-spinner-pos, .goog-te-spinner-animation, #goog-te-spinner, .goog-tooltip, .goog-tooltip:hover {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
        .goog-text-highlight {
          background-color: transparent !important;
          box-shadow: none !important;
        }
        body {
          top: 0 !important;
        }
      `
      document.head.appendChild(style)
    }

    // 4. Inject Google Translate element placeholder container (hidden)
    let container = document.getElementById('google_translate_element')
    if (!container) {
      container = document.createElement('div')
      container.id = 'google_translate_element'
      container.style.display = 'none'
      document.body.appendChild(container)
    }

    // 5. Initialize Translate callback
    ;(window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,hi,ta,te,kn,gu,mr,bn',
        autoDisplay: false
      }, 'google_translate_element')
    }

    // 6. Load Translate script
    const scriptId = '__google_translate_script'
    let script = document.getElementById(scriptId) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  return null
}
