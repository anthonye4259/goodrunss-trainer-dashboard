"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Mic, Video, Upload, Play, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VoiceVideoUploadProps {
    voiceUrl: string | null
    videoUrl: string | null
    onVoiceChange: (url: string | null) => void
    onVideoChange: (url: string | null) => void
}

export function VoiceVideoUpload({ voiceUrl, videoUrl, onVoiceChange, onVideoChange }: VoiceVideoUploadProps) {
    const { toast } = useToast()
    const [isUploadingVoice, setIsUploadingVoice] = useState(false)
    const [isUploadingVideo, setIsUploadingVideo] = useState(false)

    // Mock upload function - in production this would upload to Vercel Blob or S3
    const handleUpload = async (type: 'voice' | 'video', file: File) => {
        const isVoice = type === 'voice'
        const setUploading = isVoice ? setIsUploadingVoice : setIsUploadingVideo
        const setUrl = isVoice ? onVoiceChange : onVideoChange

        setUploading(true)

        // Simulate upload delay
        setTimeout(() => {
            // Create a fake URL for preview
            const fakeUrl = URL.createObjectURL(file)
            setUrl(fakeUrl)
            setUploading(false)

            toast({
                title: "Upload Successful",
                description: `${isVoice ? "Voice sample" : "Video intro"} uploaded successfully.`,
            })
        }, 1500)
    }

    return (
        <div className="space-y-6">
            {/* Voice Sample Section */}
            <Card className="glass border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mic className="h-5 w-5 text-primary" />
                        Voice Clone
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Upload a 1-2 minute recording of your voice. The AI will analyze your tone, cadence, and accent to clone your voice.
                    </p>

                    {voiceUrl ? (
                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-background/50">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <Play className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Voice Sample.mp3</p>
                                <p className="text-xs text-muted-foreground">Ready for cloning</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => onVoiceChange(null)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-accent/5 transition-colors">
                            <Input
                                type="file"
                                accept="audio/*"
                                className="hidden"
                                id="voice-upload"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleUpload('voice', file)
                                }}
                            />
                            <Label htmlFor="voice-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Upload className="h-6 w-6 text-primary" />
                                </div>
                                <span className="font-medium">Click to upload audio</span>
                                <span className="text-xs text-muted-foreground">MP3, WAV, or M4A (Max 10MB)</span>
                            </Label>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Video Intro Section */}
            <Card className="glass border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-primary" />
                        Video Avatar
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Upload a short video introduction. This will be used to generate your visual AI avatar.
                    </p>

                    {videoUrl ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                            <video src={videoUrl} className="w-full h-full object-cover" controls />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => onVideoChange(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-accent/5 transition-colors">
                            <Input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                id="video-upload"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleUpload('video', file)
                                }}
                            />
                            <Label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Upload className="h-6 w-6 text-primary" />
                                </div>
                                <span className="font-medium">Click to upload video</span>
                                <span className="text-xs text-muted-foreground">MP4 or MOV (Max 50MB)</span>
                            </Label>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
