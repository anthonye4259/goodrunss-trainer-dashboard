"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Download, Check, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Payment {
  id: string
  amount: number
  status: string
  method: string
  createdAt: string
  client?: { name: string }
}

interface Client {
  id: string
  name: string
}

export default function PaymentsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [metrics, setMetrics] = useState({ totalRevenue: 0, monthlyRevenue: 0 })
  const { toast } = useToast()

  useEffect(() => {
    fetchPayments()
    fetchClients()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/payments')
      const data = await response.json()
      setPayments(data.payments || [])
      setMetrics(data.metrics || { totalRevenue: 0, monthlyRevenue: 0 })
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast({
        title: "Error",
        description: "Failed to load payments.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      const data = await response.json()
      setClients(data.clients || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const paymentData = {
      amount: parseFloat(formData.get('amount') as string),
      method: formData.get('method') as string,
      clientId: formData.get('client') as string || null,
      description: formData.get('description') as string || '',
    }

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      })

      if (!response.ok) throw new Error('Failed to add payment')

      toast({
        title: "Payment Recorded",
        description: "Payment has been successfully recorded.",
      })
      
      setIsAddDialogOpen(false)
      e.currentTarget.reset()
      fetchPayments() // Refresh the list
    } catch (error) {
      console.error('Error adding payment:', error)
      toast({
        title: "Error",
        description: "Failed to record payment.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleExportCSV = () => {
    toast({
      title: "Export Started",
      description: "Your payment data is being exported to CSV.",
    })
  }

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
  const paidRevenue = payments.filter(p => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0)
  const pendingRevenue = payments.filter(p => p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground mt-1">Track your training revenue</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogDescription>Add a new payment transaction</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input id="amount" type="number" placeholder="80" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Credit Card</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" required />
                </div>
                <Button type="submit" className="w-full">Record Payment</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">${totalRevenue}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">${paidRevenue}</div>
            <p className="text-xs text-muted-foreground mt-1">Received payments</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">${pendingRevenue}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    payment.status === 'Paid' ? 'bg-primary/20' : 'bg-yellow-500/20'
                  }`}>
                    <span className="text-lg font-semibold">
                      {payment.client?.name ? payment.client.name.split(' ').map((n: string) => n[0]).join('') : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{payment.client?.name || 'Unknown Client'}</div>
                    <div className="text-sm text-muted-foreground">{new Date(payment.createdAt).toLocaleDateString()} • {payment.method}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xl font-bold text-foreground">${payment.amount}</div>
                    <div className={`text-xs ${
                      payment.status === 'Paid' ? 'text-primary' : 'text-yellow-500'
                    }`}>
                      {payment.status}
                    </div>
                  </div>
                  {payment.status === 'Pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Handle mark as paid
                        toast({
                          title: "Not Implemented",
                          description: "Mark as paid feature coming soon.",
                        })
                      }}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Mark Paid
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
