"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 等待客户端挂载完成
  useEffect(() => {
    setMounted(true)
  }, [])

  // 在客户端挂载完成前不渲染任何内容
  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="fixed bottom-20 right-4 h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? (
        <Moon className="h-[1.2rem] w-[1.2rem] text-white" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] text-white" />
      )}
      <span className="sr-only">切换主题</span>
    </Button>
  )
} 