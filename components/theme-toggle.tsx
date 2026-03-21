"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl nm-flat bg-background" />

  const isDark = resolvedTheme === "dark"

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-10 h-10 flex items-center justify-center nm-convex bg-background rounded-xl text-primary hover:nm-inset transition-all group relative"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
        <Sun
          className={`absolute transition-all duration-500 ${
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          }`}
        />
        <Moon
          className={`absolute transition-all duration-500 ${
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>
    </motion.button>
  )
}
