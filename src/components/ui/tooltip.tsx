"use client"

import * as React from "react"

interface TooltipProps {
  children: React.ReactNode
}

interface TooltipTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface TooltipContentProps {
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  className?: string
}

const TooltipContext = React.createContext<{ open: boolean; setOpen: (open: boolean) => void } | undefined>(undefined)

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function Tooltip({ children }: TooltipProps) {
  const [open, setOpen] = React.useState(false)
  
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </TooltipContext.Provider>
  )
}

export function TooltipTrigger({ children, asChild }: TooltipTriggerProps) {
  const context = React.useContext(TooltipContext)
  
  const handleMouseEnter = () => {
    context?.setOpen(true)
  }
  
  const handleMouseLeave = () => {
    context?.setOpen(false)
  }
  
  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      {children}
    </div>
  )
}

export function TooltipContent({ children, side = "top", align = "center", className = "" }: TooltipContentProps) {
  const context = React.useContext(TooltipContext)
  
  if (!context?.open) return null
  
  const positionClasses = {
    top: "-top-2 -translate-y-full left-1/2 -translate-x-1/2",
    bottom: "-bottom-2 translate-y-full left-1/2 -translate-x-1/2",
    left: "top-1/2 -translate-y-1/2 -left-2 -translate-x-full",
    right: "top-1/2 -translate-y-1/2 -right-2 translate-x-full",
  }
  
  return (
    <div
      className={`absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 ${positionClasses[side]} ${className}`}
      role="tooltip"
    >
      {children}
    </div>
  )
}

