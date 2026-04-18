'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="theme-toggle"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <i className="fas fa-sun text-xl animate-spin-slow" />
      ) : (
        <i className="fas fa-moon text-xl animate-pulse" />
      )}
    </button>
  )
} 