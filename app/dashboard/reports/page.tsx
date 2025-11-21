"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Send, Calendar, TrendingUp, Users, DollarSign, Loader2 } from "lucide-react"
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

type ReportType = 'summary' | 'financial' | 'clients' | 'sessions'

interface GeneratedReport {
  id: string
  name: string
  type: ReportType
  generatedDate: string
  data: any
}

const reportTemplates = [
  {
    id: "summary",
    name: "Business Summary Report",
    description: "Comprehensive overview of all activities, revenue, and client progress",
    icon: Calendar,
    apiType: "summary" as ReportType
  },
  {
    id: "financial",
    name: "Financial Report",
    description: "Revenue summary, payments received, pending, and trends",
    icon: DollarSign,
    apiType: "financial" as ReportType
  },
  {
    id: "clients",
    name: "Client Roster Report",
    description: "Complete list of all clients with contact info, status, and session counts",
    icon: Users,
    apiType: "clients" as ReportType
  },
  {
    id: "sessions",
    name: "Session Analytics Report",
    description: "Detailed session statistics, completion rates, and peak hours",
    icon: TrendingUp,
    apiType: "sessions" as ReportType
  },
]

export default function ReportsPage() {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ReportType | "">("")
  const [selectedRange, setSelectedRange] = useState<string>("30")
  const [recentReports, setRecentReports] = useState<GeneratedReport[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [stats, setStats] = useState({
    generated: 0,
    popular: "Business Summary",
    sent: 0
  })
  const { toast } = useToast()

  // Load recent reports from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentReports')
    if (saved) {
      try {
        setRecentReports(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved reports:', e)
      }
    }
  }, [])

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Please select a report template",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch(
        `/api/reports?type=${selectedTemplate}&range=${selectedRange}&format=json`
      )

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const data = await response.json()
      
      const templateInfo = reportTemplates.find(t => t.apiType === selectedTemplate)!
      const newReport: GeneratedReport = {
        id: Date.now().toString(),
        name: `${templateInfo.name} - ${new Date().toLocaleDateString()}`,
        type: selectedTemplate,
        generatedDate: new Date().toISOString(),
        data: data.report
      }

      const updated = [newReport, ...recentReports].slice(0, 10) // Keep last 10
      setRecentReports(updated)
      localStorage.setItem('recentReports', JSON.stringify(updated))

      setStats(prev => ({ ...prev, generated: prev.generated + 1 }))

      toast({
        title: "Report Generated",
        description: `Your ${templateInfo.name.toLowerCase()} has been generated successfully.`,
      })

      setIsGenerateDialogOpen(false)
      setSelectedTemplate("")
      setSelectedRange("30")
    } catch (error) {
      console.error('Generate report error:', error)
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadReport = async (report: GeneratedReport) => {
    try {
      const response = await fetch(
        `/api/reports?type=${report.type}&range=${selectedRange}&format=csv`
      )

      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.type}_report_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Downloading Report",
        description: "Your report is being downloaded as CSV.",
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Error",
        description: "Failed to download report. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleEmailReport = (report: GeneratedReport) => {
    // TODO: Implement email functionality
    toast({
      title: "Coming Soon",
      description: "Email reports feature will be available soon.",
    })
  }

  const handleViewReport = (report: GeneratedReport) => {
    // Display report data in a modal or new page
    toast({
      title: "Report Details",
      description: "Viewing report data...",
    })
    console.log('Report data:', report.data)
  }

  const getRangeLabel = (range: string) => {
    const rangeMap: Record<string, string> = {
      '7': 'This Week',
      '14': 'Last 2 Weeks',
      '30': 'This Month',
      '60': 'Last 2 Months',
      '90': 'This Quarter',
      '180': 'Last 6 Months',
      '365': 'This Year'
    }
    return rangeMap[range] || `Last ${range} days`
  }

  const currentTemplate = reportTemplates.find((t) => t.apiType === selectedTemplate)

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
              <DialogDescription>Select a report template and time period</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleGenerateReport} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="template">Report Template</Label>
                <Select value={selectedTemplate} onValueChange={(val) => setSelectedTemplate(val as ReportType)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a report template" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.apiType}>
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

                  <div className="space-y-2">
                    <Label htmlFor="period">Time Period</Label>
                    <Select value={selectedRange} onValueChange={setSelectedRange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 Days</SelectItem>
                        <SelectItem value="14">Last 14 Days</SelectItem>
                        <SelectItem value="30">Last 30 Days (Month)</SelectItem>
                        <SelectItem value="60">Last 60 Days</SelectItem>
                        <SelectItem value="90">Last 90 Days (Quarter)</SelectItem>
                        <SelectItem value="180">Last 6 Months</SelectItem>
                        <SelectItem value="365">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={!selectedTemplate || isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Report'
                )}
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
                    setSelectedTemplate(template.apiType)
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

      {recentReports.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Reports ({recentReports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.map((report) => {
                const templateInfo = reportTemplates.find(t => t.apiType === report.type)
                return (
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
                              <Badge className="bg-primary/20 text-primary">{templateInfo?.name || report.type}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(report.generatedDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewReport(report)}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownloadReport(report)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            CSV
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEmailReport(report)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Email
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="text-2xl font-bold text-foreground mb-1">{stats.generated}</div>
              <div className="text-sm text-muted-foreground">Reports Generated This Session</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="text-2xl font-bold text-foreground mb-1">{recentReports.length}</div>
              <div className="text-sm text-muted-foreground">Total Reports Saved</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="text-2xl font-bold text-foreground mb-1">CSV</div>
              <div className="text-sm text-muted-foreground">Download Format Available</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
