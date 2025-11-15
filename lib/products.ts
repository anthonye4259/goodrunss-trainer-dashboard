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
  // Subscription Plans
  {
    id: "basic-plan",
    name: "Basic",
    description: "Perfect for getting started",
    priceInCents: 2900, // $29/month
    type: "plan",
    features: ["Up to 10 clients", "Basic workout templates", "Email support", "Mobile app access"],
  },
  {
    id: "pro-plan",
    name: "Pro",
    description: "For growing training businesses",
    priceInCents: 7900, // $79/month
    type: "plan",
    popular: true,
    features: [
      "Up to 50 clients",
      "Advanced workout builder",
      "Priority support",
      "Custom branding",
      "Analytics dashboard",
      "Client progress tracking",
    ],
  },
  {
    id: "enterprise-plan",
    name: "Enterprise",
    description: "For established training businesses",
    priceInCents: 14900, // $149/month
    type: "plan",
    features: [
      "Unlimited clients",
      "White-label solution",
      "24/7 phone support",
      "API access",
      "Advanced analytics",
      "Team collaboration",
      "Custom integrations",
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
