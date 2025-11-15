"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Send, Calendar, TrendingUp, Users, DollarSign } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

const reportTemplates = [
  {
    id: "monthly-summary",
    name: "Monthly Summary Report",
    description: "Comprehensive overview of all activities, revenue, and client progress for the month",
    icon: Calendar,
    sections: ["Revenue", "Sessions", "Client Stats", "Goals Progress"],
  },
  {
    id: "client-progress",
    name: "Client Progress Report",
    description: "Detailed progress report for individual clients including measurements and achievements",
    icon: TrendingUp,
    sections: ["Weight/Body Fat", "Measurements", "Goals", "Session History"],
  },
  {
    id: "revenue-report",
    name: "Revenue Report",
    description: "Financial summary including payments received, pending, and revenue trends",
    icon: DollarSign,
    sections: ["Total Revenue", "Payment Breakdown", "Trends", "Forecasts"],
  },
  {
    id: "client-roster",
    name: "Client Roster Report",
    description: "Complete list of all clients with contact info, status, and session counts",
    icon: Users,
    sections: ["Active Clients", "Inactive Clients", "Contact Info", "Session Counts"],
  },
]

const recentReports = [
  {
    id: "1",
    name: "January 2024 Monthly Summary",
    type: "Monthly Summary",
    generatedDate: "2024-02-01",
    status: "completed",
  },
  {
    id: "2",
    name: "Sarah Johnson Progress Report",
    type: "Client Progress",
    generatedDate: "2024-01-28",
    status: "completed",
  },
  {
    id: "3",
    name: "Q4 2023 Revenue Report",
    type: "Revenue Report",
    generatedDate: "2024-01-15",
    status: "completed",
  },
]

export default function ReportsPage() {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const { toast } = useToast()

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Report Generated",
      description: "Your report has been generated successfully.",
    })
    setIsGenerateDialogOpen(false)
    setSelectedTemplate("")
    setSelectedSections([])
  }

  const handleDownloadReport = (reportId: string) => {
    toast({
      title: "Downloading Report",
      description: "Your report is being downloaded as PDF.",
    })
  }

  const handleEmailReport = (reportId: string) => {
    toast({
      title: "Report Sent",
      description: "Report has been sent via email.",
    })
  }

  const currentTemplate = reportTemplates.find((t) => t.id === selectedTemplate)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Generate and manage your business reports</p>
        </div>
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generate New Report</DialogTitle>
              <DialogDescription>Select a report template and customize the sections</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleGenerateReport} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="template">Report Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a report template" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentTemplate && (
                <>
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <p className="text-sm text-muted-foreground">{currentTemplate.description}</p>
                  </div>

                  <div className="space-y-3">
                    <Label>Include Sections</Label>
                    {currentTemplate.sections.map((section) => (
                      <div key={section} className="flex items-center space-x-2">
                        <Checkbox
                          id={section}
                          checked={selectedSections.includes(section)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSections([...selectedSections, section])
                            } else {
                              setSelectedSections(selectedSections.filter((s) => s !== section))
                            }
                          }}
                        />
                        <label
                          htmlFor={section}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {section}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="period">Time Period</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="this-week">This Week</SelectItem>
                        <SelectItem value="last-week">Last Week</SelectItem>
                        <SelectItem value="this-month">This Month</SelectItem>
                        <SelectItem value="last-month">Last Month</SelectItem>
                        <SelectItem value="this-quarter">This Quarter</SelectItem>
                        <SelectItem value="last-quarter">Last Quarter</SelectItem>
                        <SelectItem value="this-year">This Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTemplate === "client-progress" && (
                    <div className="space-y-2">
                      <Label htmlFor="client">Select Client</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Sarah Johnson</SelectItem>
                          <SelectItem value="2">Mike Chen</SelectItem>
                          <SelectItem value="3">Emily Davis</SelectItem>
                          <SelectItem value="4">James Wilson</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              <Button type="submit" className="w-full" disabled={!selectedTemplate}>
                Generate Report
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTemplates.map((template) => {
          const Icon = template.icon
          return (
            <Card key={template.id} className="glass-card hover:bg-secondary/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-lg text-foreground">{template.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                  onClick={() => {
                    setSelectedTemplate(template.id)
                    setIsGenerateDialogOpen(true)
                  }}
                >
                  Generate
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <Card key={report.id} className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{report.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge className="bg-primary/20 text-primary">{report.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(report.generatedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDownloadReport(report.id)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEmailReport(report.id)}>
                        <Send className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="text-2xl font-bold text-foreground mb-1">12</div>
              <div className="text-sm text-muted-foreground">Reports Generated This Month</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="text-2xl font-bold text-foreground mb-1">3</div>
              <div className="text-sm text-muted-foreground">Most Popular: Monthly Summary</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="text-2xl font-bold text-foreground mb-1">8</div>
              <div className="text-sm text-muted-foreground">Reports Sent to Clients</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
