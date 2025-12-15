"use client"

import { Star, Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
    {
        name: "Sarah K.",
        role: "Pilates Instructor",
        location: "Los Angeles, CA",
        quote: "GIA handles all my client communication and booking. I just show up and teach—everything else is done for me.",
        rating: 5,
    },
    {
        name: "Marcus T.",
        role: "Pickleball Coach",
        location: "Austin, TX",
        quote: "Clients book directly through GoodRunss and get automatic reminders. My no-show rate dropped to almost zero.",
        rating: 5,
    },
    {
        name: "Jennifer L.",
        role: "Basketball Trainer",
        location: "Seattle, WA",
        quote: "GIA writes my social posts and follows up with leads. I've never had this many clients without trying.",
        rating: 5,
    },
]

export function Testimonials() {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">Trusted by 500+ Trainers</h3>
                <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">4.9/5 from trainers worldwide</span>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                {testimonials.map((testimonial, index) => (
                    <Card key={index} className="border-border/50 backdrop-blur-xl bg-card/50">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-1">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                                ))}
                            </div>

                            <div className="relative">
                                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/20" />
                                <p className="text-sm leading-relaxed pl-6">
                                    "{testimonial.quote}"
                                </p>
                            </div>

                            <div className="pt-2 border-t border-border/30">
                                <p className="font-semibold text-sm">{testimonial.name}</p>
                                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
