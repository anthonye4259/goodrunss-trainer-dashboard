import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, Check, X, Clock, TrendingUp } from "lucide-react"

export const metadata: Metadata = {
    title: "Payout Management | Admin",
    description: "Manage ambassador payout requests",
}

export const dynamic = "force-dynamic"

async function getPayoutRequests() {
    const requests = await prisma.payout_requests.findMany({
        include: {
            ambassador: true
        },
        orderBy: {
            requestedAt: "desc"
        }
    })

    return requests
}

export default async function AdminPayoutsPage() {
    const requests = await getPayoutRequests()

    const stats = {
        pending: requests.filter(r => r.status === "PENDING").length,
        approved: requests.filter(r => r.status === "APPROVED").length,
        completed: requests.filter(r => r.status === "COMPLETED").length,
        totalAmount: requests
            .filter(r => r.status === "PENDING")
            .reduce((sum, r) => sum + Number(r.amount), 0)
    }

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Payout Management</h1>
                <p className="text-muted-foreground">Manage ambassador payout requests</p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.approved}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completed}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Payout Requests Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Payout Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4">Ambassador</th>
                                    <th className="text-left p-4">Amount</th>
                                    <th className="text-left p-4">Method</th>
                                    <th className="text-left p-4">Requested</th>
                                    <th className="text-left p-4">Status</th>
                                    <th className="text-left p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((request) => (
                                    <tr key={request.id} className="border-b hover:bg-muted/50">
                                        <td className="p-4">
                                            <div>
                                                <div className="font-medium">{request.ambassador.name}</div>
                                                <div className="text-sm text-muted-foreground">{request.payoutEmail}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium">
                                                ${Number(request.amount).toFixed(2)} {request.currency}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="outline">{request.payoutMethod}</Badge>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm">
                                                {new Date(request.requestedAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge
                                                variant={
                                                    request.status === "COMPLETED" ? "default" :
                                                        request.status === "PENDING" ? "secondary" :
                                                            request.status === "REJECTED" ? "destructive" :
                                                                "outline"
                                                }
                                            >
                                                {request.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            {request.status === "PENDING" && (
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="default">
                                                        <Check className="w-4 h-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button size="sm" variant="destructive">
                                                        <X className="w-4 h-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                            {request.status === "APPROVED" && (
                                                <Button size="sm" variant="secondary">
                                                    <DollarSign className="w-4 h-4 mr-1" />
                                                    Process
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {requests.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                No payout requests yet
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
