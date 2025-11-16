export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  type: "plan" | "addon"
  features?: string[]
  popular?: boolean
}

// Source of truth for all products
export const PRODUCTS: Product[] = [
  // Subscription Plans (Early Access Pricing)
  {
    id: "3-month",
    name: "3 Month Plan",
    description: "Perfect to get started • Early Access Pricing",
    priceInCents: 4000, // $40 total (paid upfront)
    type: "plan",
    popular: true,
    features: [
      "Unlimited clients",
      "AI Session Plan Generator",
      "Auto CRM Document Parser",
      "Client Lead Matching",
      "Advanced analytics & insights",
      "Priority support",
    ],
  },
  {
    id: "6-month",
    name: "6 Month Plan",
    description: "Best for trying it out • Early Access Pricing",
    priceInCents: 7500, // $75 total (paid upfront)
    type: "plan",
    features: [
      "Unlimited clients",
      "AI Session Plan Generator",
      "Auto CRM Document Parser",
      "Client Lead Matching",
      "Advanced analytics & insights",
      "Priority support",
    ],
  },
  {
    id: "1-year",
    name: "1 Year Plan",
    description: "Best value — save the most • Early Access Pricing",
    priceInCents: 10000, // $100 total (paid upfront)
    type: "plan",
    features: [
      "Unlimited clients",
      "AI Session Plan Generator",
      "Auto CRM Document Parser",
      "Client Lead Matching",
      "Advanced analytics & insights",
      "Priority support",
    ],
  },
  // Add-ons
  {
    id: "extra-storage",
    name: "Extra Storage",
    description: "100GB additional storage for videos and documents",
    priceInCents: 1900, // $19/month
    type: "addon",
  },
  {
    id: "advanced-analytics",
    name: "Advanced Analytics",
    description: "Detailed insights and custom reports",
    priceInCents: 2900, // $29/month
    type: "addon",
  },
  {
    id: "white-label",
    name: "White Label",
    description: "Remove GoodRunss branding and use your own",
    priceInCents: 4900, // $49/month
    type: "addon",
  },
  {
    id: "priority-support",
    name: "Priority Support",
    description: "24/7 priority support with dedicated account manager",
    priceInCents: 3900, // $39/month
    type: "addon",
  },
]
