"use client"

import { useState } from "react"
import { PRODUCTS } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Sparkles } from "lucide-react"
import Checkout from "@/components/checkout"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function BillingPage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)

  const plans = PRODUCTS.filter((p) => p.type === "plan")
  const addons = PRODUCTS.filter((p) => p.type === "addon")

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-primary bg-clip-text text-transparent">
            Upgrade Your Training Business
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your needs and unlock powerful features to grow your training business
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Subscription Plans</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative p-6 space-y-6 transition-all hover:scale-105 ${
                  plan.popular ? "border-2 border-primary shadow-lg shadow-primary/20" : "border-border/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="space-y-1">
                  <div className="text-4xl font-bold text-primary">{formatPrice(plan.priceInCents)}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>

                <ul className="space-y-3">
                  {plan.features?.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => setSelectedProduct(plan.id)}
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  Get Started
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Add-ons */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Add-ons</h2>
            <p className="text-muted-foreground">Enhance your plan with additional features and capabilities</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {addons.map((addon) => (
              <Card key={addon.id} className="p-6 space-y-4 border-border/50 hover:border-primary/50 transition-all">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">{addon.name}</h3>
                  <p className="text-sm text-muted-foreground">{addon.description}</p>
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">{formatPrice(addon.priceInCents)}</div>
                  <div className="text-xs text-muted-foreground">per month</div>
                </div>

                <Button onClick={() => setSelectedProduct(addon.id)} variant="outline" className="w-full" size="sm">
                  Add to Plan
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
          </DialogHeader>
          {selectedProduct && <Checkout productId={selectedProduct} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
