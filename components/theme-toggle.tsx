"use client"

import { useEffect } from 'react'
import { useTheme } from '@/lib/use-theme'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, toggleTheme, setTheme } = useTheme()

    // Initialize theme on mount
    useEffect(() => {
        setTheme(theme)
    }, [])

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={cn(
                "relative h-9 w-9 rounded-full transition-all duration-300",
                "hover:bg-primary/10 hover:scale-110",
                className
            )}
            aria-label="Toggle theme"
        >
            <Sun className={cn(
                "h-5 w-5 transition-all duration-300",
                theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
            )} />
            <Moon className={cn(
                "absolute h-5 w-5 transition-all duration-300",
                theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
            )} />
        </Button>
    )
}
