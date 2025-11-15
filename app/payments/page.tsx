"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, TrendingUp, Clock, CheckCircle, XCircle, Plus, Download } from "lucide-react"

type Payment = {
  id: string
  client: string
  amount: number
  date: string
  status: "completed" | "pending" | "failed"
  method: string
  sessionType: string
}

const initialPayments: Payment[] = [
  {
    id: "1",
    client: "Sarah Johnson",
    amount: 150,
    date: "2024-01-15",
    status: "completed",
    method: "Credit Card",
    sessionType: "Basketball Training",
  },
  {
    id: "2",
    client: "Mike Chen",
    amount: 120,
    date: "2024-01-14",
    status: "completed",
    method: "PayPal",
    sessionType: "Tennis Lesson",
  },
  {
    id: "3",
    client: "Emma Davis",
    amount: 180,
    date: "2024-01-14",
    status: "pending",
    method: "Bank Transfer",
    sessionType: "Running Program",
  },
  {
    id: "4",
    client: "James Wilson",
    amount: 100,
    date: "2024-01-13",
    status: "completed",
    method: "Credit Card",
    sessionType: "Soccer Training",
  },
]

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(initialPayments)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newPayment, setNewPayment] = useState({
    client: "",
    amount: "",
    method: "credit-card",
    sessionType: "",
  })

  const totalEarnings = payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0)
  const pendingPayments = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0)

  const handleAddPayment = () => {
    const payment: Payment = {
      id: Date.now().toString(),
      client: newPayment.client,
      amount: Number.parseFloat(newPayment.amount),
      date: new Date().toISOString().split("T")[0],
      status: "completed",
      method: newPayment.method,
      sessionType: newPayment.sessionType,
    }
    setPayments([payment, ...payments])
    setIsAddDialogOpen(false)
    setNewPayment({ client: "", amount: "", method: "credit-card", sessionType: "" })
  }

  const handleMarkPaid = (id: string) => {
    setPayments(payments.map((p) => (p.id === id ? { ...p, status: "completed" as const } : p)))
    setSelectedPayment(null)
  }

  const handleExportPayments = () => {
    alert("Exporting payment history...")
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-balance">Payments & Earnings</h1>
          <p className="mt-2 text-muted-foreground">Track your income and manage payments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-transparent" onClick={handleExportPayments}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Record New Payment</DialogTitle>
                <DialogDescription>Add a payment to your records</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="client">Client Name</Label>
                  <Input
                    id="client"
                    value={newPayment.client}
                    onChange={(e) => setNewPayment({ ...newPayment, client: e.target.value })}
                    placeholder="Enter client name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <Select value={newPayment.method} onValueChange={(v) => setNewPayment({ ...newPayment, method: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit-card">Credit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sessionType">Session Type</Label>
                  <Input
                    id="sessionType"
                    value={newPayment.sessionType}
                    onChange={(e) => setNewPayment({ ...newPayment, sessionType: e.target.value })}
                    placeholder="e.g., Basketball Training"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddPayment}
                  disabled={!newPayment.client || !newPayment.amount || !newPayment.sessionType}
                >
                  Record Payment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-3xl font-bold text-primary">${totalEarnings.toLocaleString()}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold">${pendingPayments.toLocaleString()}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/20">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-3xl font-bold">$9,850</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Avg Session</p>
                <p className="text-3xl font-bold">$147</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-4 cursor-pointer transition-smooth hover:border-primary/50"
                onClick={() => setSelectedPayment(payment)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      payment.status === "completed"
                        ? "bg-green-500/20"
                        : payment.status === "pending"
                          ? "bg-yellow-500/20"
                          : "bg-red-500/20"
                    }`}
                  >
                    {payment.status === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : payment.status === "pending" ? (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{payment.client}</p>
                    <p className="text-sm text-muted-foreground">{payment.sessionType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-semibold text-lg">${payment.amount}</p>
                    <p className="text-xs text-muted-foreground">{payment.method}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{new Date(payment.date).toLocaleDateString()}</p>
                    <Badge
                      variant={
                        payment.status === "completed"
                          ? "default"
                          : payment.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-xs"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>View payment information</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client</Label>
                  <p className="font-semibold">{selectedPayment.client}</p>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <p className="text-2xl font-bold text-primary">${selectedPayment.amount}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <p className="font-medium">{new Date(selectedPayment.date).toLocaleDateString()}</p>
                </div>
                <div className="space-y-2">
                  <Label>Method</Label>
                  <p className="font-medium">{selectedPayment.method}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Session Type</Label>
                <p className="font-medium">{selectedPayment.sessionType}</p>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Badge
                  variant={
                    selectedPayment.status === "completed"
                      ? "default"
                      : selectedPayment.status === "pending"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {selectedPayment.status}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedPayment?.status === "pending" && (
              <Button onClick={() => handleMarkPaid(selectedPayment.id)}>Mark as Paid</Button>
            )}
            <Button variant="outline" onClick={() => setSelectedPayment(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
