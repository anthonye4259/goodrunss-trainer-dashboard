"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Video, Plus, Play, Share2, Eye, Trash2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function VideoLibraryPage() {
  const { toast } = useToast()
  const [videos, setVideos] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [difficulty, setDifficulty] = useState("beginner")
  const [isPublic, setIsPublic] = useState(false)

  // Fetch videos on mount
  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch('/api/videos')
        const data = await response.json()
        
        if (data.success && data.videos) {
          setVideos(data.videos)
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error)
        toast({
          title: "Error",
          description: "Failed to load videos",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchVideos()
  }, [])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setCategory("")
    setVideoUrl("")
    setThumbnailUrl("")
    setDifficulty("beginner")
    setIsPublic(false)
  }

  const handleUpload = async () => {
    if (!title || !category || !videoUrl) {
      toast({
        title: "Error",
        description: "Title, category, and video URL are required",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl || null,
          category,
          difficulty,
          is_public: isPublic,
        }),
      })

      const data = await response.json()

      if (data.success && data.video) {
        setVideos([...videos, data.video])
        toast({
          title: "Success",
          description: "Video added successfully",
        })
        setIsDialogOpen(false)
        resetForm()
      } else {
        throw new Error(data.error || "Failed to add video")
      }
    } catch (error: any) {
      console.error("Video upload error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add video",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)

    try {
      const response = await fetch(`/api/videos?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setVideos(videos.filter((v) => v.id !== id))
        toast({
          title: "Success",
          description: "Video deleted successfully",
        })
      } else {
        throw new Error(data.error || "Failed to delete video")
      }
    } catch (error: any) {
      console.error("Video delete error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete video",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading video library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Video Library</h1>
          <p className="text-muted-foreground mt-1">Manage your training videos and exercise demonstrations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-black">
              <Plus className="mr-2 h-4 w-4" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Video</DialogTitle>
              <DialogDescription>Upload a training video or exercise demonstration</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="title">Video Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Proper Squat Form"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this video covers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="videoUrl">Video URL *</Label>
                <Input
                  id="videoUrl"
                  placeholder="https://youtube.com/watch?v=... or direct URL"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  YouTube, Vimeo, or direct video file URL
                </p>
              </div>

              <div>
                <Label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</Label>
                <Input
                  id="thumbnailUrl"
                  placeholder="https://example.com/thumbnail.jpg"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Strength, Cardio, Yoga"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isPublic" className="cursor-pointer">
                  Make this video public (visible to all clients)
                </Label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={loading} className="flex-1 bg-primary hover:bg-primary/90 text-black">
                {loading ? "Uploading..." : "Add Video"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Videos</p>
              <p className="text-2xl font-bold text-white">{videos.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Views</p>
              <p className="text-2xl font-bold text-white">
                {videos.reduce((sum, v) => sum + (v.view_count || 0), 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Share2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Public Videos</p>
              <p className="text-2xl font-bold text-white">
                {videos.filter((v) => v.is_public).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Videos Grid */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-white mb-4">All Videos</h2>
        {videos.length === 0 ? (
          <div className="text-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No videos uploaded yet</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="outline"
              className="mt-4"
            >
              Upload First Video
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden bg-muted/30">
                <div className="relative aspect-video bg-muted">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <Play className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                    {video.category}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-1">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{video.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {video.view_count || 0} views
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {video.difficulty || 'beginner'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(video.video_url, '_blank')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Watch
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(video.id)}
                      disabled={loading}
                      className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
