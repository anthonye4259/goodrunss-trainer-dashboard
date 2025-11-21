"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2, Search, Gift, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminTrainersPage() {
  const [trainers, setTrainers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [grantFreeDialogOpen, setGrantFreeDialogOpen] = useState(false)
  const [newTrainerDialogOpen, setNewTrainerDialogOpen] = useState(false)
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null)
  const [processing, setProcessing] = useState(false)
  
  // New trainer form
  const [newTrainerName, setNewTrainerName] = useState("")
  const [newTrainerEmail, setNewTrainerEmail] = useState("")
  
  const { toast } = useToast()

  useEffect(() => {
    fetchTrainers()
  }, [])

  const fetchTrainers = async () => {
    try {
      const response = await fetch('/api/admin/trainers')
      if (response.ok) {
        const data = await response.json()
        setTrainers(data.trainers || [])
      }
    } catch (error) {
      console.error('Error fetching trainers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGrantFreeAccess = async () => {
    if (!selectedTrainer) return
    
    setProcessing(true)
    try {
      const response = await fetch('/api/admin/grant-free-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedTrainer.clerkId,
          userEmail: selectedTrainer.email,
        }),
      })

      if (response.ok) {
        toast({
          title: "Free Access Granted!",
          description: `${selectedTrainer.name} now has lifetime free access.`,
        })
        setGrantFreeDialogOpen(false)
        fetchTrainers() // Refresh list
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to grant free access",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to grant free access",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleCreateFreeTrainer = async () => {
    if (!newTrainerName || !newTrainerEmail) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and email",
        variant: "destructive",
      })
      return
    }
    
    setProcessing(true)
    try {
      const response = await fetch('/api/admin/create-free-trainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTrainerName,
          email: newTrainerEmail,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Trainer Created!",
          description: `${newTrainerName} has been created with free access. They'll receive an email to set their password.`,
        })
        setNewTrainerDialogOpen(false)
        setNewTrainerName("")
        setNewTrainerEmail("")
        fetchTrainers() // Refresh list
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create trainer",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create trainer",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const filteredTrainers = trainers.filter(trainer =>
    trainer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trainer Management</h1>
          <p className="text-muted-foreground mt-1">Manage all trainers and subscriptions</p>
        </div>
        <Button onClick={() => setNewTrainerDialogOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Create Free Trainer
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Trainers List */}
      <Card>
        <CardHeader>
          <CardTitle>All Trainers ({filteredTrainers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTrainers.length > 0 ? (
            <div className="space-y-4">
              {filteredTrainers.map((trainer) => (
                <div
                  key={trainer.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold">{trainer.name || 'No name'}</p>
                        <p className="text-sm text-muted-foreground">{trainer.email}</p>
                      </div>
                      {trainer.subscription?.planName?.includes('Free') && (
                        <Badge variant="secondary" className="gap-1">
                          <Gift className="h-3 w-3" />
                          Free
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>
                        Plan: <span className="font-medium">{trainer.subscription?.planName || 'None'}</span>
                      </span>
                      <span>
                        Status: <span className={`font-medium ${
                          trainer.subscription?.status === 'active' ? 'text-green-600' : 
                          trainer.subscription?.status === 'trialing' ? 'text-blue-600' : 
                          'text-gray-600'
                        }`}>
                          {trainer.subscription?.status || 'None'}
                        </span>
                      </span>
                      <span>
                        Joined: {new Date(trainer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    {!trainer.subscription?.planName?.includes('Free') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTrainer(trainer)
                          setGrantFreeDialogOpen(true)
                        }}
                        className="gap-2"
                      >
                        <Gift className="h-4 w-4" />
                        Grant Free Access
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? 'No trainers found' : 'No trainers yet'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Grant Free Access Dialog */}
      <Dialog open={grantFreeDialogOpen} onOpenChange={setGrantFreeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Lifetime Free Access</DialogTitle>
            <DialogDescription>
              This will give {selectedTrainer?.name} lifetime free access to the platform.
              They will never be charged.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <p className="text-sm"><strong>Name:</strong> {selectedTrainer?.name}</p>
              <p className="text-sm"><strong>Email:</strong> {selectedTrainer?.email}</p>
              <p className="text-sm"><strong>Current Plan:</strong> {selectedTrainer?.subscription?.planName || 'None'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrantFreeDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleGrantFreeAccess} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Granting...
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  Grant Free Access
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Free Trainer Dialog */}
      <Dialog open={newTrainerDialogOpen} onOpenChange={setNewTrainerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Trainer with Free Access</DialogTitle>
            <DialogDescription>
              Create a new trainer account with lifetime free access. They'll receive an email to set their password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Jane Doe"
                value={newTrainerName}
                onChange={(e) => setNewTrainerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                value={newTrainerEmail}
                onChange={(e) => setNewTrainerEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTrainerDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleCreateFreeTrainer} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Trainer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

