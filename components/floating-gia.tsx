"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Sparkles,
  Send,
  Paperclip,
  X,
  Loader2,
  FileText,
  Image as ImageIcon,
  Minimize2,
  Maximize2,
  Maximize,
  Save,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GIAModeSelector, type GIAMode } from "@/components/gia-mode-selector"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  files?: UploadedFile[]
  program?: {
    title: string
    type: string
    sportCategory?: string
    canSave: boolean
    data: any
  }
}

type UploadedFile = {
  name: string
  size: number
  type: string
  url: string
}

export function FloatingGIA() {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<GIAMode>('wellness')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [savedPrograms, setSavedPrograms] = useState<Set<string>>(new Set())
  const [savingProgram, setSavingProgram] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch("/api/gia/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      setUploadedFiles((prev) => [...prev, ...data.files])

      toast({
        title: "Files uploaded!",
        description: `${data.files.length} file(s) ready to analyze`,
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: "Could not upload files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSend = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim() || "(Attached files)",
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    const sentFiles = [...uploadedFiles]
    setUploadedFiles([])

    try {
      const response = await fetch("/api/gia/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          files: sentFiles,
          mode: selectedMode,
        }),
      })

      if (!response.ok) {
        throw new Error("Chat request failed")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        program: data.program ? {
          title: data.program.title,
          type: data.program.type,
          sportCategory: data.program.sportCategory,
          canSave: data.program.canSave,
          data: data.program
        } : undefined
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      toast({
        title: "Request failed",
        description: "GIA is temporarily unavailable. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProgram = async (messageId: string, programData: any) => {
    setSavingProgram(messageId)
    try {
      const response = await fetch("/api/gia/save-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(programData),
      })

      if (!response.ok) {
        throw new Error("Failed to save program")
      }

      const data = await response.json()

      setSavedPrograms(prev => new Set([...prev, messageId]))
      toast({
        title: "Program saved!",
        description: `"${data.program.title}" is now in your library`,
      })
    } catch (error) {
      console.error("Save program error:", error)
      toast({
        title: "Failed to save",
        description: "Could not save program. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSavingProgram(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-3 w-3" />
    return <FileText className="h-3 w-3" />
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-primary to-accent hover:scale-110 transition-all duration-300 z-50"
          size="icon"
        >
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card
          className={cn(
            "fixed shadow-2xl border-border/50 backdrop-blur-xl z-50 transition-all duration-300 flex flex-col overflow-hidden",
            isFullscreen
              ? "inset-4 w-auto h-auto"
              : isMinimized
                ? "bottom-6 right-6 w-80 h-16"
                : "bottom-6 right-6 w-96 h-[700px]",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/40 bg-gradient-to-br from-primary/10 to-accent/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-sm">GIA</h3>
                <p className="text-xs text-muted-foreground">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setIsFullscreen(!isFullscreen)
                  setIsMinimized(false)
                }}
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                <Maximize className="h-4 w-4" />
              </Button>
              {!isFullscreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Mode Selector */}
              <GIAModeSelector
                selectedMode={selectedMode}
                onModeChange={setSelectedMode}
              />

              {/* Messages */}
              <ScrollArea
                className="flex-1 p-4 min-h-0"
                ref={scrollAreaRef}
              >
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2",
                        message.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      {message.role === "assistant" && (
                        <Avatar className="h-7 w-7 bg-primary/10 flex-shrink-0">
                          <AvatarFallback>
                            <Sparkles className="h-3 w-3 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[75%] rounded-lg p-3 text-sm",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground",
                        )}
                      >
                        <div className="space-y-1">
                          {message.content.split("\n").map((line, i) => {
                            if (line.startsWith("**") && line.endsWith("**")) {
                              return (
                                <p key={i} className="font-bold">
                                  {line.replace(/\*\*/g, "")}
                                </p>
                              )
                            }
                            if (line.startsWith("•")) {
                              return (
                                <p key={i} className="text-xs">
                                  {line}
                                </p>
                              )
                            }
                            return line ? <p key={i}>{line}</p> : <br key={i} />
                          })}
                        </div>

                        {message.files && message.files.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.files.map((file, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1 p-1 bg-background/30 rounded text-xs"
                              >
                                {getFileIcon(file.type)}
                                <span className="truncate flex-1">{file.name}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Save Program Button */}
                        {message.role === "assistant" && message.program?.canSave && (
                          <div className="mt-3 pt-3 border-t border-border/40">
                            <Button
                              size="sm"
                              variant={savedPrograms.has(message.id) ? "outline" : "default"}
                              className="w-full"
                              onClick={() => handleSaveProgram(message.id, message.program!.data)}
                              disabled={savedPrograms.has(message.id) || savingProgram === message.id}
                            >
                              {savingProgram === message.id ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : savedPrograms.has(message.id) ? (
                                <>
                                  <Check className="h-3 w-3 mr-2" />
                                  Saved to Library
                                </>
                              ) : (
                                <>
                                  <Save className="h-3 w-3 mr-2" />
                                  Save Program
                                </>
                              )}
                            </Button>
                            {message.program.sportCategory && (
                              <p className="text-xs opacity-60 mt-1 text-center">
                                {message.program.sportCategory} • {message.program.type}
                              </p>
                            )}
                          </div>
                        )}

                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {message.role === "user" && (
                        <Avatar className="h-7 w-7 bg-primary/10 flex-shrink-0">
                          <AvatarFallback className="text-primary text-xs font-bold">
                            You
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-2 justify-start">
                      <Avatar className="h-7 w-7 bg-primary/10">
                        <AvatarFallback>
                          <Sparkles className="h-3 w-3 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-secondary rounded-lg p-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* File Preview */}
              {uploadedFiles.length > 0 && (
                <div className="px-3 py-2 border-t border-border/40 bg-secondary/30">
                  <div className="flex flex-wrap gap-1">
                    {uploadedFiles.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1 px-2 py-1 bg-background rounded text-xs"
                      >
                        {getFileIcon(file.type)}
                        <span className="max-w-[100px] truncate">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0"
                          onClick={() => removeFile(i)}
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <CardContent className="p-3 border-t border-border/40">
                <div className="flex items-end gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.csv,.txt,.doc,.docx"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="h-8 w-8 flex-shrink-0"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="h-4 w-4" />
                    )}
                  </Button>
                  <Textarea
                    placeholder="Ask GIA..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    rows={1}
                    className="flex-1 resize-none text-sm min-h-[32px] max-h-[80px]"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || (!input.trim() && uploadedFiles.length === 0)}
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      )}
    </>
  )
}

