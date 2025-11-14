// 🚀 EARLY ACCESS PRICING - Limited Time Special Offer
// Simple pricing for early adopters

export const products = [
  {
    id: "early-access-3mo",
    name: "3 Months",
    description: "Everything you need to run a professional training business—client management, AI-powered content generation, smart scheduling, payment processing, and more. Get 3 months of unlimited access for less than what you charge for a single session. Perfect for trainers who want to experience the power of AI automation without a long-term commitment. Start booking more clients, generating social content in seconds, and tracking progress like a pro—all from one dashboard.",
    price: 40,
    pricePerMonth: 13.33,
    originalPrice: 99,
    priceId: process.env.STRIPE_PRICE_ID_3_MONTHS || "price_3mo_early_access",
    interval: "3 months (one-time payment)",
    emoji: "🚀",
    features: [
      "Unlimited clients & sessions",
      "AI Assistant (GIA) - Specialty-aware content",
      "Client management & progress tracking",
      "Smart calendar with conflict detection",
      "Payment processing & invoicing",
      "Push notifications",
      "Video exercise library",
      "Group class management",
      "Automated check-ins & retention alerts",
      "Priority support",
      "All features unlocked"
    ],
    badge: null,
    popular: false,
    savings: "Save $59 vs standard pricing"
  },
  {
    id: "early-access-6mo",
    name: "6 Months",
    description: "Our most popular plan for serious trainers ready to scale. Six months gives you time to build momentum, automate your entire workflow, and watch your client base grow while you focus on what you do best—training. Get GIA, your AI assistant, generating workout plans, social posts, and client communications tailored to your specialty (basketball, yoga, pilates, and 20+ more). Includes unlimited clients, group class management, video library, automated check-ins, and retention tracking. Pay once, grow for six months. Most trainers who commit to 6 months see 2-3x growth in their business.",
    price: 80,
    pricePerMonth: 13.33,
    originalPrice: 198,
    priceId: process.env.STRIPE_PRICE_ID_6_MONTHS || "price_6mo_early_access",
    interval: "6 months (one-time payment)",
    emoji: "⭐",
    features: [
      "Unlimited clients & sessions",
      "AI Assistant (GIA) - Specialty-aware content",
      "Client management & progress tracking",
      "Smart calendar with conflict detection",
      "Payment processing & invoicing",
      "Push notifications",
      "Video exercise library",
      "Group class management",
      "Automated check-ins & retention alerts",
      "Priority support",
      "All features unlocked",
      "🌟 Best value for money"
    ],
    badge: "Most Popular",
    popular: true,
    savings: "Save $118 vs standard pricing"
  },
  {
    id: "early-access-12mo",
    name: "1 Year",
    description: "The absolute best value for ambitious trainers building a real business. Lock in just $10/month ($120 total) and get a full year of unlimited access to every feature—unlimited clients, AI-generated content customized to your sport, advanced analytics, group classes, video library, automated retention alerts, and priority support. This is the plan for trainers who are serious about going full-time, scaling to 50+ clients, and automating the boring stuff so you can focus on changing lives. Pay once for the entire year and never worry about monthly fees. This early access pricing won't last forever—secure your spot now and build the training empire you've always dreamed of.",
    price: 120,
    pricePerMonth: 10.00,
    originalPrice: 357,
    priceId: process.env.STRIPE_PRICE_ID_12_MONTHS || "price_12mo_early_access",
    interval: "12 months (one-time payment)",
    emoji: "💎",
    features: [
      "Unlimited clients & sessions",
      "AI Assistant (GIA) - Specialty-aware content",
      "Client management & progress tracking",
      "Smart calendar with conflict detection",
      "Payment processing & invoicing",
      "Push notifications",
      "Video exercise library",
      "Group class management",
      "Automated check-ins & retention alerts",
      "Priority support",
      "All features unlocked",
      "💎 Lowest monthly cost (only $10/mo!)",
      "Full year commitment"
    ],
    badge: "Best Deal",
    popular: false,
    savings: "Save $237 vs standard pricing"
  },
]

// Helper to get product by ID
export function getProductById(id: string) {
  return products.find((p) => p.id === id)
}

// Helper to get default product (for early access)
export function getDefaultProduct() {
  return products.find((p) => p.id === "early-access") || products[0]
}

