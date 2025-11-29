"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { CheckCircle, AlertTriangle } from "lucide-react"

interface RescheduleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: {
    clientName: string
    originalDate: string
    originalTime: string
  }
  onReschedule: (newDate: Date, newTime: string) => void
}

const mockAISuggestions = [
  {
    id: "1",
    date: "2024-01-16",
    time: "10:00 AM",
    confidence: 95,
    reason: "Client's preferred time slot",
    conflicts: [],
  },
  {
    id: "2",
    date: "2024-01-16",
    time: "2:00 PM",
    confidence: 88,
    reason: "Good availability window",
    conflicts: [],
  },
  {
    id: "3",
    date: "2024-01-17",
    time: "9:00 AM",
    confidence: 82,
    reason: "Next day alternative",
    conflicts: ["Back-to-back with another session"],
  },
  {
    id: "4",
    date: "2024-01-17",
    time: "3:00 PM",
    confidence: 78,
    reason: "Late afternoon slot",
    conflicts: [],
  },
  {
    id: "5",
    date: "2024-01-18",
    time: "11:00 AM",
    confidence: 75,
    reason: "Mid-morning availability",
    conflicts: ["15 min travel time needed"],
  },
]

export function RescheduleModal({ open, onOpenChange, session, onReschedule }: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState("")
  const [activeTab, setActiveTab] = useState("ai")

  const timeSlots = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
  ]

  const handleConfirmReschedule = () => {
    if (selectedDate && selectedTime) {
      onReschedule(selectedDate, selectedTime)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reschedule Session with {session.clientName}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Original: {session.originalDate} at {session.originalTime}
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai">AI Suggestions</TabsTrigger>
            <TabsTrigger value="manual">Manual Pick</TabsTrigger>
          </TabsList>

          {/* AI Suggestions Tab */}
          <TabsContent value="ai" className="space-y-3 mt-4">
            {mockAISuggestions.map((suggestion) => (
              <div key={suggestion.id} className="rounded-lg border border-border/50 bg-card/50 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold">
                        {suggestion.date} at {suggestion.time}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${suggestion.confidence}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{suggestion.confidence}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{suggestion.reason}</p>
                    {suggestion.conflicts.length > 0 && (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                          {suggestion.conflicts.map((conflict, idx) => (
                            <p key={idx} className="text-xs text-yellow-500">
                              {conflict}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    {suggestion.conflicts.length === 0 && (
                      <div className="flex items-center gap-2 text-primary">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs">No conflicts detected</span>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      const date = new Date(suggestion.date)
                      setSelectedDate(date)
                      setSelectedTime(suggestion.time)
                      handleConfirmReschedule()
                    }}
                  >
                    Select
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Manual Pick Tab */}
          <TabsContent value="manual" className="space-y-6 mt-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Calendar */}
              <div>
                <Label className="mb-3 block">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-lg border border-border/50 bg-card/50"
                  disabled={(date) => date < new Date()}
                />
              </div>

              {/* Time Slots */}
              <div>
                <Label className="mb-3 block">Select Time</Label>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`
                        rounded-lg border p-3 text-sm transition-all
                        ${
                          selectedTime === time
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border/50 bg-card/50 hover:bg-card"
                        }
                      `}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Conflict Detection */}
            {selectedDate && selectedTime && (
              <div className="rounded-lg border border-primary/50 bg-primary/10 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-primary">No conflicts detected</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedDate.toLocaleDateString()} at {selectedTime} is available
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!selectedDate || !selectedTime}
                onClick={handleConfirmReschedule}
              >
                Confirm Reschedule
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
