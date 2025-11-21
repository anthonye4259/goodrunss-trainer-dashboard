"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Play, Trash2, Video, Eye, Loader2, Plus, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExerciseVideo {
  id: string
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  duration: number | null
  category: string | null
  tags: string[]
  specialty: string | null
  difficulty: string | null
  equipment: string[]
  view_count: number
  is_public: boolean
  created_at: string
}

export default function VideoLibraryPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [open, setOpen] = useState(false)
  const [videos, setVideos] = useState<ExerciseVideo[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    duration: "",
    category: "",
    difficulty: "",
    tags: "",
    equipment: "",
    isPublic: false
  })

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (categoryFilter !== 'all') params.append('category', categoryFilter)

      const res = await fetch(`/api/video-library?${params.toString()}`)
      const data = await res.json()
      
      if (data.success) {
        setVideos(data.videos)
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
      toast({
        title: "Error",
        description: "Failed to load videos",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!formData.title || !formData.videoUrl) {
      toast({
        title: "Missing fields",
        description: "Title and video URL are required",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      const res = await fetch('/api/video-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          videoUrl: formData.videoUrl,
          thumbnailUrl: formData.thumbnailUrl || null,
          duration: formData.duration ? parseInt(formData.duration) : null,
          category: formData.category || null,
          difficulty: formData.difficulty || null,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
          equipment: formData.equipment ? formData.equipment.split(',').map(e => e.trim()) : [],
          isPublic: formData.isPublic
        })
      })

      const data = await res.json()
      
      if (data.success) {
        toast({
          title: "✅ Video uploaded!",
          description: `"${formData.title}" has been added to your library`
        })
        setOpen(false)
        resetForm()
        fetchVideos()
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error: any) {
      console.error('Error uploading video:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload video",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (videoId: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return

    try {
      const res = await fetch(`/api/video-library?id=${videoId}`, {
        method: 'DELETE'
      })

      const data = await res.json()
      
      if (data.success) {
        toast({
          title: "✅ Video deleted",
          description: `"${title}" has been removed`
        })
        fetchVideos()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      duration: "",
      category: "",
      difficulty: "",
      tags: "",
      equipment: "",
      isPublic: false
    })
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const filteredVideos = videos.filter(video => {
    const matchesSearch = !searchQuery || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = categoryFilter === 'all' || video.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(videos.map(v => v.category).filter(Boolean)))

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Video Library</h1>
            <p className="text-muted-foreground">Manage your exercise and training videos</p>
          </div>
          <Button onClick={() => setOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Upload Video
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchVideos}>
              Refresh
            </Button>
          </div>
        </Card>

        {/* Videos Grid */}
        {loading ? (
          <Card className="bg-card border-border p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading videos...</p>
            </div>
          </Card>
        ) : filteredVideos.length === 0 ? (
          <Card className="bg-card border-border p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Video className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No videos yet</h3>
              <p className="text-muted-foreground mb-6">Upload your first exercise video to get started</p>
              <Button onClick={() => setOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="bg-card border-border overflow-hidden hover:border-primary/50 transition-colors">
                {/* Thumbnail */}
                <div className="relative h-48 bg-muted flex items-center justify-center">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    <Video className="w-16 h-16 text-muted-foreground" />
                  )}
                  <div className="absolute top-2 right-2">
                    {video.is_public ? (
                      <Badge className="bg-green-500/20 text-green-300">Public</Badge>
                    ) : (
                      <Badge className="bg-gray-500/20 text-gray-300">Private</Badge>
                    )}
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{video.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {video.category && (
                      <Badge variant="outline" className="text-xs">{video.category}</Badge>
                    )}
                    {video.difficulty && (
                      <Badge variant="outline" className="text-xs">{video.difficulty}</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {video.view_count} views
                    </div>
                    <span>{new Date(video.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(video.video_url, '_blank')}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Watch
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(video.id, video.title)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Video</DialogTitle>
            <DialogDescription>
              Add a new exercise or training video to your library
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Proper Squat Form"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL *</Label>
              <Input
                id="videoUrl"
                placeholder="https://youtube.com/watch?v=... or direct video URL"
                value={formData.videoUrl}
                onChange={(e) => updateFormData("videoUrl", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">YouTube, Vimeo, or direct video file URL</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this video teaches..."
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="flexibility">Flexibility</SelectItem>
                    <SelectItem value="technique">Technique</SelectItem>
                    <SelectItem value="warmup">Warm-up</SelectItem>
                    <SelectItem value="cooldown">Cool-down</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(value) => updateFormData("difficulty", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 180 (for 3 minutes)"
                value={formData.duration}
                onChange={(e) => updateFormData("duration", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
              <Input
                id="thumbnailUrl"
                placeholder="https://..."
                value={formData.thumbnailUrl}
                onChange={(e) => updateFormData("thumbnailUrl", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., squats, legs, compound"
                value={formData.tags}
                onChange={(e) => updateFormData("tags", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment">Equipment (comma-separated)</Label>
              <Input
                id="equipment"
                placeholder="e.g., barbell, dumbbells"
                value={formData.equipment}
                onChange={(e) => updateFormData("equipment", e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => updateFormData("isPublic", e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isPublic">Make this video public (visible to clients)</Label>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading} className="bg-primary hover:bg-primary/90">
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
