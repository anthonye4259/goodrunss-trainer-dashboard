"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "lucide-react"

interface RescheduleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId?: string
  onReschedule: (newDate: string, newTime: string) => void
}

export function RescheduleModal({
  open,
  onOpenChange,
  sessionId,
  onReschedule,
}: RescheduleModalProps) {
  const [newDate, setNewDate] = React.useState("")
  const [newTime, setNewTime] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newDate && newTime) {
      onReschedule(newDate, newTime)
      onOpenChange(false)
      setNewDate("")
      setNewTime("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">New Date</Label>
            <Input
              id="date"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="time">New Time</Label>
            <Input
              id="time"
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Reschedule</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



