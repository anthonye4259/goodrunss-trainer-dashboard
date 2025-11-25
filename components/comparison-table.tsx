"use client"

import { Check, X, Minus } from "lucide-react"

export function ComparisonTable() {
    return (
        <div className="w-full max-w-4xl mx-auto py-8 space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">Why Trainers Switch to GoodRunss .G0</h3>
                <p className="text-muted-foreground">Stop paying for 3 different tools. Get everything in one.</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground">
                        <tr>
                            <th className="px-6 py-4 font-bold">Feature</th>
                            <th className="px-6 py-4 font-bold text-primary text-base">GoodRunss .G0</th>
                            <th className="px-6 py-4 font-medium">Other Apps</th>
                            <th className="px-6 py-4 font-medium">Spreadsheets</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {/* AI Features */}
                        <tr className="bg-primary/5">
                            <td className="px-6 py-4 font-medium">GIA AI Assistant</td>
                            <td className="px-6 py-4 text-primary font-bold"><Check className="w-5 h-5" /></td>
                            <td className="px-6 py-4 text-muted-foreground"><X className="w-5 h-5" /></td>
                            <td className="px-6 py-4 text-muted-foreground"><X className="w-5 h-5" /></td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-medium">Auto CRM Parser</td>
                            <td className="px-6 py-4 text-primary font-bold"><Check className="w-5 h-5" /></td>
                            <td className="px-6 py-4 text-muted-foreground"><X className="w-5 h-5" /></td>
                            <td className="px-6 py-4 text-muted-foreground"><X className="w-5 h-5" /></td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-medium">Smart Lead Matching</td>
                            <td className="px-6 py-4 text-primary font-bold"><Check className="w-5 h-5" /></td>
                            <td className="px-6 py-4 text-muted-foreground"><X className="w-5 h-5" /></td>
                            <td className="px-6 py-4 text-muted-foreground"><X className="w-5 h-5" /></td>
                        </tr>

                        {/* Core Features */}
                        <tr>
                            <td className="px-6 py-4 font-medium">Unlimited Clients</td>
                            <td className="px-6 py-4 text-primary font-bold"><Check className="w-5 h-5" /></td>
                            <td className="px-6 py-4 text-muted-foreground">Extra $$$</td>
                            <td className="px-6 py-4 text-muted-foreground"><Check className="w-5 h-5" /></td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-medium">Payment Processing</td>
                            <td className="px-6 py-4 text-primary font-bold"><Check className="w-5 h-5" /></td>
                            <td className="px-6 py-4 text-muted-foreground"><Check className="w-5 h-5" /></td>
                            <td className="px-6 py-4 text-muted-foreground"><X className="w-5 h-5" /></td>
                        </tr>

                        {/* Pricing */}
                        <tr className="bg-card/50 font-bold">
                            <td className="px-6 py-4">Monthly Cost</td>
                            <td className="px-6 py-4 text-xl text-primary">$15</td>
                            <td className="px-6 py-4 text-muted-foreground">$49 - $99</td>
                            <td className="px-6 py-4 text-muted-foreground">Free (but painful)</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
