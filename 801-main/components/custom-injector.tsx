'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function CustomInjector() {
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/customizer', { cache: 'no-store' })
        const j = await res.json()
        if (cancelled || !j?.ok) return
        const { globalCss, globalJs, pageCustom, theme } = j.data || {}

        // Helper to convert hex to Tailwind HSL space
        function hexToHsl(hexStr: string): string {
          const hex = hexStr.replace(/^#/, '')
          const r = parseInt(hex.substring(0, 2), 16) / 255
          const g = parseInt(hex.substring(2, 4), 16) / 255
          const b = parseInt(hex.substring(4, 6), 16) / 255
          const max = Math.max(r, g, b), min = Math.min(r, g, b)
          let h = 0, s = 0, l = (max + min) / 2
          if (max !== min) {
            const d = max - min
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
            switch (max) {
              case r: h = (g - b) / d + (g < b ? 6 : 0); break
              case g: h = (b - r) / d + 2; break
              case b: h = (r - g) / d + 4; break
            }
            h /= 6
          }
          return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
        }

        // Apply theme colors dynamically
        let themeStyle = document.getElementById('__dvj_theme_css') as HTMLStyleElement | null
        if (!themeStyle) {
          themeStyle = document.createElement('style')
          themeStyle.id = '__dvj_theme_css'
          document.head.appendChild(themeStyle)
        }
        let themeCss = ''
        if (theme) {
          let rootVars = ''
          if (theme['theme.primary']) rootVars += `--primary: ${hexToHsl(theme['theme.primary'])}; --ring: ${hexToHsl(theme['theme.primary'])};`
          if (theme['theme.accent']) rootVars += `--accent: ${hexToHsl(theme['theme.accent'])};`
          if (theme['theme.secondary']) rootVars += `--secondary: ${hexToHsl(theme['theme.secondary'])};`
          if (theme['theme.background']) {
            rootVars += `--background: ${hexToHsl(theme['theme.background'])};`
            themeCss += `body { background-color: ${theme['theme.background']} !important; }`
          }
          if (theme['theme.fontFamily']) {
            themeCss += `* { font-family: '${theme['theme.fontFamily']}', sans-serif !important; }`
          }
          if (rootVars) {
            themeCss += `:root { ${rootVars} }`
          }
        }
        themeStyle.textContent = themeCss

        // Global CSS
        let styleEl = document.getElementById('__dvj_global_css') as HTMLStyleElement | null
        if (!styleEl) {
          styleEl = document.createElement('style')
          styleEl.id = '__dvj_global_css'
          document.head.appendChild(styleEl)
        }
        styleEl.textContent = globalCss || ''

        // Page-specific CSS
        const pageKey = pathname || '/'
        const pageData = (pageCustom || {})[pageKey]
        let pageStyle = document.getElementById('__dvj_page_css') as HTMLStyleElement | null
        if (!pageStyle) {
          pageStyle = document.createElement('style')
          pageStyle.id = '__dvj_page_css'
          document.head.appendChild(pageStyle)
        }
        pageStyle.textContent = pageData?.css || ''

        // Global JS (executed once per navigation)
        try {
          if (globalJs) new Function(globalJs)()
        } catch (err) { console.warn('[customizer:globalJs]', err) }

        // Page JS
        try {
          if (pageData?.js) new Function(pageData.js)()
        } catch (err) { console.warn('[customizer:pageJs]', err) }

        // Page HTML injection into #__dvj_slot if present
        if (pageData?.html) {
          const slot = document.getElementById('__dvj_slot')
          if (slot) slot.innerHTML = pageData.html
        }
      } catch (err) {
// console.warn('[customizer] load failed', err) (removed for production)
      }
    }
    load()
    return () => { cancelled = true }
  }, [pathname])

  return null
}
