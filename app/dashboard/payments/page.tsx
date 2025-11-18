"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, TrendingUp, Clock, Download, Plus, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Payments will be loaded from your database
export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Fetch payments on mount
  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/payments')
      if (!response.ok) throw new Error('Failed to fetch payments')
      const data = await response.json()
      setPayments(data.payments || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast({
        title: "Error loading payments",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0)
  const paidCount = payments.filter((p) => p.status === "paid").length

  const handleRecordPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.get("client") as string,
          amount: Number(formData.get("amount")),
          date: formData.get("date") as string,
          status: "paid",
          method: formData.get("method") as string,
          sessionType: formData.get("sessionType") as string,
        }),
      })

      if (!response.ok) throw new Error('Failed to record payment')

      const data = await response.json()
      
      // Refresh the payments list
      await fetchPayments()
      
      setIsAddDialogOpen(false)
      toast({
        title: "Payment recorded",
        description: `Payment of $${data.payment.amount} from ${data.payment.clientName} has been recorded.`,
      })
    } catch (error) {
      console.error('Error recording payment:', error)
      toast({
        title: "Error recording payment",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const markAsPaid = (id: string) => {
    setPayments(payments.map((p) => (p.id === id ? { ...p, status: "paid" as const } : p)))
    toast({
      title: "Payment updated",
      description: "Payment has been marked as paid.",
    })
  }

  const exportToCSV = () => {
    const csv = [
      ["Date", "Client", "Amount", "Status", "Method", "Type"].join(","),
      ...payments.map((p) => [p.date, p.clientName, p.amount, p.status, p.method, p.sessionType].join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`
    a.click()

    toast({
      title: "Export successful",
      description: "Payment data has been exported to CSV.",
    })
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Payments</h1>
          <p className="mt-2 text-muted-foreground">Track your earnings and transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent" onClick={exportToCSV}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleRecordPayment}>
                <DialogHeader>
                  <DialogTitle>Record New Payment</DialogTitle>
                  <DialogDescription>Enter the payment details below.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="client">Client Name</Label>
                    <Input id="client" name="client" placeholder="Sarah Johnson" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input id="amount" name="amount" type="number" min="0" step="0.01" placeholder="150.00" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select name="method" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="PayPal">PayPal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sessionType">Session Type</Label>
                    <Select name="sessionType" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Training">Training</SelectItem>
                        <SelectItem value="Assessment">Assessment</SelectItem>
                        <SelectItem value="Consultation">Consultation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Record Payment
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{paidCount} payments received</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {payments.filter((p) => p.status === "pending").length} pending payments
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-primary mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +18% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{payment.clientName}</TableCell>
                  <TableCell>{payment.sessionType}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell className="font-semibold">${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={payment.status === "paid" ? "default" : "secondary"}
                      className={payment.status === "paid" ? "bg-primary/20 text-primary" : ""}
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {payment.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 bg-transparent"
                        onClick={() => markAsPaid(payment.id)}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Mark Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
