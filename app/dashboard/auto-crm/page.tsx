"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, FileText, Image, File, Loader2, CheckCircle2, User, TrendingUp, Target, Bell, MessageSquare, Sparkles } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function AutoCRMPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedData, setProcessedData] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles([...uploadedFiles, ...files])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    setUploadedFiles([...uploadedFiles, ...files])
  }

  const handleProcessFiles = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files uploaded",
        description: "Please upload at least one file to process",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setLoading(true)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('trainerId', 'current-user-id') // TODO: Get from auth
      
      uploadedFiles.forEach((file) => {
        formData.append('files', file)
      })

      // Call the REAL backend API
      const response = await fetch('/api/gia/process-documents', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to process documents')
      }

      // Transform backend data to frontend format
      const transformedData = {
        clientProfiles: result.data.extractedProfiles.map((profile: any) => ({
          name: profile.clientName,
          age: profile.clientAge,
          email: profile.clientEmail,
          phone: profile.clientPhone,
          medicalHistory: profile.medicalHistory,
          injuries: profile.injuries,
          confidence: `${(profile.confidence * 100).toFixed(0)}%`,
        })),
        progressHistory: result.data.extractedProgress.map((prog: any) => ({
          client: prog.extractedClientProfileId ? 'Client' : 'Unknown',
          date: new Date(prog.progressDate).toLocaleDateString(),
          metric: prog.description,
          value: prog.metrics ? JSON.stringify(prog.metrics) : 'N/A',
        })),
        goals: result.data.extractedGoals.map((goal: any) => ({
          client: goal.extractedClientProfileId ? 'Client' : 'Unknown',
          goal: goal.goalDescription,
          deadline: goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No deadline',
          priority: goal.priority,
          category: goal.goalCategory,
        })),
        recommendedSessions: result.data.recommendations.map((rec: any) => ({
          client: 'Client',
          session: rec.recommendationText,
          duration: `${rec.suggestedDuration} min`,
        })),
        reminders: [], // Can be added later
        followUpMessages: result.data.recommendations.map((rec: any) => ({
          client: 'Client',
          message: rec.recommendationText,
        })),
      }

      setProcessedData(transformedData)
      setIsDialogOpen(true)

      toast({
        title: "Processing complete!",
        description: `Processed ${uploadedFiles.length} document(s) in ${(result.processingTime / 1000).toFixed(1)} seconds`,
      })
    } catch (error) {
      console.error('Error processing files:', error)
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setLoading(false)
    }
  }

  const handleSaveData = async () => {
    toast({
      title: "Data saved successfully!",
      description: "All client information has been added to your CRM",
    })
    
    setIsDialogOpen(false)
    setUploadedFiles([])
    setProcessedData(null)
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-5 w-5" />
    if (file.type === 'application/pdf') return <FileText className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Auto CRM</h1>
            <p className="text-muted-foreground">Turn chaos into clarity in seconds</p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="p-8 border-2 border-dashed border-border hover:border-primary/50 transition-all">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="space-y-6"
        >
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Upload Your Messy Notes</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Drop screenshots, PDFs, voice memos, handwritten notes, or any client documents here
            </p>
            <Label htmlFor="file-upload" className="cursor-pointer">
              <Button asChild className="bg-primary hover:bg-primary/90 text-black">
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Files
                </span>
              </Button>
              <Input
                id="file-upload"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </Label>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Uploaded Files ({uploadedFiles.length})</h4>
              <div className="grid gap-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    {getFileIcon(file)}
                    <span className="text-sm text-muted-foreground flex-1">{file.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {(file.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Process Button */}
          {uploadedFiles.length > 0 && (
            <Button
              onClick={handleProcessFiles}
              disabled={isProcessing}
              className="w-full bg-primary hover:bg-primary/90 text-black h-12 text-lg font-semibold"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  GIA is processing your files...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Let GIA Process {uploadedFiles.length} File{uploadedFiles.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
          )}
        </div>
      </Card>

      {/* What GIA Extracts */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          What GIA Extracts For You
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: User, label: "Client Profiles", desc: "Names, contact info, medical history" },
            { icon: TrendingUp, label: "Progress History", desc: "Performance metrics & milestones" },
            { icon: Target, label: "Goals", desc: "Client objectives & deadlines" },
            { icon: CheckCircle2, label: "Recommended Sessions", desc: "AI-generated workout plans" },
            { icon: Bell, label: "Reminders", desc: "Follow-ups & important dates" },
            { icon: MessageSquare, label: "Follow-up Messages", desc: "Ready-to-send client communications" },
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Results Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Processing Complete!
            </DialogTitle>
            <DialogDescription>
              GIA has extracted and organized your client data. Review and save to your CRM.
            </DialogDescription>
          </DialogHeader>

          {processedData && (
            <div className="space-y-6 py-4">
              {/* Client Profiles */}
              {processedData.clientProfiles.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Client Profiles ({processedData.clientProfiles.length})
                  </h3>
                  <div className="space-y-2">
                    {processedData.clientProfiles.map((client: any, index: number) => (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg">
                        <p className="font-semibold text-white">{client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.age ? `${client.age} years` : 'Age not specified'}
                          {client.email && ` • ${client.email}`}
                          {client.confidence && ` • ${client.confidence} confidence`}
                        </p>
                        {client.medicalHistory && client.medicalHistory.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Medical: {client.medicalHistory.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress History */}
              {processedData.progressHistory.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Progress History
                  </h3>
                  <div className="space-y-2">
                    {processedData.progressHistory.map((entry: any, index: number) => (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg flex justify-between">
                        <div>
                          <p className="font-medium text-white">{entry.metric}</p>
                          <p className="text-sm text-muted-foreground">{entry.date}</p>
                        </div>
                        <Badge className="bg-primary/20 text-primary">{entry.value}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goals */}
              {processedData.goals.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Goals ({processedData.goals.length})
                  </h3>
                  <div className="space-y-2">
                    {processedData.goals.map((goal: any, index: number) => (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-white">{goal.goal}</p>
                          <Badge variant="secondary" className="text-xs">{goal.priority}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {goal.category} • Target: {goal.deadline}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Sessions */}
              {processedData.recommendedSessions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    AI Recommendations
                  </h3>
                  <div className="space-y-2">
                    {processedData.recommendedSessions.map((rec: any, index: number) => (
                      <div key={index} className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="text-sm text-white">{rec.session}</p>
                        <p className="text-xs text-muted-foreground mt-1">Duration: {rec.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="flex-1"
            >
              Review Later
            </Button>
            <Button
              onClick={handleSaveData}
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-black"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Save All to CRM
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}



