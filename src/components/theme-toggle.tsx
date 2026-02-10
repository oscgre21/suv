
"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-9 w-9"
    >
      <div className="relative h-6 w-6">
        {/* Light Mode Icon: Sun with a cloud - Shown in DARK mode */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute h-6 w-6 rotate-90 scale-0 text-amber-500 transition-all dark:rotate-0 dark:scale-100"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
          <path
            d="M17.5 17.5c-1.5 0-2.8-1.2-2.8-2.8 0-1.5 1.2-2.8 2.8-2.8h1.8A3.5 3.5 0 0 1 22 15.5c0 1.9-1.6 3.5-3.5 3.5h-1z"
            className="animate-cloud-move fill-blue-300/70 stroke-blue-500/80"
          />
        </svg>

        {/* Dark Mode Icon: Moon with stars - Shown in LIGHT mode */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute h-6 w-6 rotate-0 scale-100 text-blue-300 transition-all dark:-rotate-90 dark:scale-0"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" className="fill-blue-800/50 stroke-blue-500"/>
          {/* Twinkling Stars */}
          <path d="M18 6 L 18.5 5.5 L 19 6 L 18.5 6.5 Z" className="animate-star-twinkle fill-yellow-300 stroke-yellow-300 [animation-delay:0s]" style={{animationDuration: '3s'}}/>
          <path d="M20 10 L 20.25 9.75 L 20.5 10 L 20.25 10.25 Z" className="animate-star-twinkle fill-yellow-300 stroke-yellow-300 [animation-delay:0.5s]" style={{animationDuration: '2s'}}/>
          <path d="M15 11 L 15.25 10.75 L 15.5 11 L 15.25 11.25 Z" className="animate-star-twinkle fill-yellow-300 stroke-yellow-300 [animation-delay:1s]" style={{animationDuration: '4s'}}/>
        </svg>
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
