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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Play, Share2, Trash2, Video, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"

interface ExerciseVideo {
  id: string
  title: string
  description: string
  category: string
  duration: string
  thumbnail: string
  uploadDate: string
  views: number
  shares: number
}

export default function VideoLibraryPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [videos, setVideos] = useState<ExerciseVideo[]>([
    {
      id: "1",
      title: "Proper Squat Form",
      description: "Learn the fundamentals of a perfect squat",
      category: "Strength",
      duration: "3:45",
      thumbnail: "/placeholder.svg?height=200&width=350",
      uploadDate: "2025-01-10",
      views: 124,
      shares: 15,
    },
    {
      id: "2",
      title: "Yoga Sun Salutation",
      description: "Complete sun salutation sequence",
      category: "Yoga",
      duration: "8:20",
      thumbnail: "/placeholder.svg?height=200&width=350",
      uploadDate: "2025-01-08",
      views: 87,
      shares: 22,
    },
  ])

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")

  const handleUpload = async () => {
    if (!title || !category) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newVideo: ExerciseVideo = {
      id: Date.now().toString(),
      title,
      description,
      category,
      duration: "0:00",
      thumbnail: "/placeholder.svg?height=200&width=350",
      uploadDate: new Date().toISOString().split("T")[0],
      views: 0,
      shares: 0,
    }

    setVideos([newVideo, ...videos])
    toast({ title: "Video uploaded successfully" })
    setLoading(false)
    setOpen(false)
    setTitle("")
    setDescription("")
    setCategory("")
  }

  const totalViews = videos.reduce((sum, v) => sum + v.views, 0)
  const totalShares = videos.reduce((sum, v) => sum + v.shares, 0)

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Video Exercise Library</h1>
            <p className="text-muted-foreground mt-1">Upload and share exercise demonstrations with clients</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-black">
                <Upload className="mr-2 h-4 w-4" /> Upload Video
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Exercise Video</DialogTitle>
                <DialogDescription>Add a new video to your library</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Video Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Proper Squat Form"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Strength">Strength</SelectItem>
                      <SelectItem value="Cardio">Cardio</SelectItem>
                      <SelectItem value="Flexibility">Flexibility</SelectItem>
                      <SelectItem value="Yoga">Yoga</SelectItem>
                      <SelectItem value="Pilates">Pilates</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Video File</Label>
                  <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">MP4, MOV up to 500MB</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={loading} className="bg-primary hover:bg-primary/90 text-black">
                  {loading ? <Spinner className="h-4 w-4" /> : "Upload"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
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
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold text-white">{totalViews}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Shares</p>
                <p className="text-2xl font-bold text-white">{totalShares}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden group">
              <div className="relative">
                <img
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="lg" className="rounded-full">
                    <Play className="h-6 w-6" />
                  </Button>
                </div>
                <Badge className="absolute top-2 right-2 bg-black/70 text-white">{video.duration}</Badge>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-white">{video.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{video.category}</Badge>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {video.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="h-3 w-3" /> {video.shares}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Share2 className="h-4 w-4 mr-1" /> Share
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
