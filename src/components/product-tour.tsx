"use client"

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export function ProductTour() {
  const { user } = useUser()

  useEffect(() => {
    // Check if user has seen the tour
    if (user) {
      const hasSeenTour = localStorage.getItem(`tour_completed_${user.id}`)
      if (!hasSeenTour) {
        // Small delay before starting tour
        const timer = setTimeout(() => {
          startTour()
        }, 1500)
        return () => clearTimeout(timer)
      }
    }
  }, [user])

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      steps: [
        {
          popover: {
            title: "Welcome to GoodRunss! 🎉",
            description: `
              <div style="line-height: 1.6;">
                <p style="margin-bottom: 12px;">Let's take a quick 2-minute tour to show you the most powerful features of your dashboard.</p>
                <p style="color: #a0a0a0; font-size: 0.875rem;">You can skip this tour anytime or restart it from Settings.</p>
              </div>
            `,
          },
        },
        {
          element: '[data-tour="dashboard-overview"]',
          popover: {
            title: "Dashboard Overview",
            description: `
              <div style="line-height: 1.6;">
                <p>This is your command center! Track revenue, active clients, sessions, and conversion rates at a glance.</p>
              </div>
            `,
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-tour="booking-link"]',
          popover: {
            title: "Your Booking Link 🔗",
            description: `
              <div style="line-height: 1.6;">
                <p style="margin-bottom: 8px;">Share this link on social media, your website, or bio. Clients can book sessions directly!</p>
                <p style="color: #a0a0a0; font-size: 0.875rem;">💡 Tip: Use the QR code for print materials and flyers.</p>
              </div>
            `,
            side: "left",
            align: "start",
          },
        },
        {
          element: '[data-tour="calendar"]',
          popover: {
            title: "Calendar & Sessions 📅",
            description: `
              <div style="line-height: 1.6;">
                <p>Manage all your sessions in one place. Add sessions, track attendance, and manage your schedule.</p>
              </div>
            `,
            side: "right",
            align: "start",
          },
        },
        {
          element: '[data-tour="ai-features"]',
          popover: {
            title: "AI-Powered Tools ✨",
            description: `
              <div style="line-height: 1.6;">
                <p style="margin-bottom: 8px;">Meet GIA, your AI assistant! Generate social media posts, workout plans, and marketing content in seconds.</p>
                <p style="color: #a0a0a0; font-size: 0.875rem;">💡 Save hours every week with AI automation.</p>
              </div>
            `,
            side: "right",
            align: "start",
          },
        },
        {
          element: '[data-tour="social-share"]',
          popover: {
            title: "Social Media Sharing 📱",
            description: `
              <div style="line-height: 1.6;">
                <p>Share your stats and achievements to Instagram, Twitter, and Snapchat with beautiful graphics.</p>
              </div>
            `,
            side: "right",
            align: "start",
          },
        },
        {
          element: '[data-tour="referrals"]',
          popover: {
            title: "Referral System 🎁",
            description: `
              <div style="line-height: 1.6;">
                <p>Invite other trainers and earn rewards. Track your referrals and grow your network.</p>
              </div>
            `,
            side: "right",
            align: "start",
          },
        },
        {
          popover: {
            title: "You're All Set! 🚀",
            description: `
              <div style="line-height: 1.6;">
                <p style="margin-bottom: 12px;">Start by setting up your availability and sharing your booking link with clients.</p>
                <div style="background: rgba(166, 220, 113, 0.1); border: 1px solid rgba(166, 220, 113, 0.3); border-radius: 8px; padding: 12px; margin-top: 12px;">
                  <p style="font-weight: 600; color: #a6dc71; margin-bottom: 8px; font-size: 0.875rem;">Quick Start Tips:</p>
                  <ul style="font-size: 0.875rem; color: #a0a0a0; line-height: 1.8; padding-left: 20px;">
                    <li>Set up your availability</li>
                    <li>Create your booking link</li>
                    <li>Add your first client</li>
                    <li>Try the AI content generator</li>
                  </ul>
                </div>
                <p style="color: #808080; font-size: 0.75rem; margin-top: 12px;">Need help? Check out the Help Center in Settings.</p>
              </div>
            `,
          },
        },
      ],
      onDestroyStarted: () => {
        // Mark tour as completed when finished or skipped
        if (user) {
          localStorage.setItem(`tour_completed_${user.id}`, "true")
        }
        driverObj.destroy()
      },
    })

    // Custom styling
    const style = document.createElement("style")
    style.textContent = `
      .driver-popover {
        background: hsl(215, 25%, 18%) !important;
        color: hsl(0, 0%, 98%) !important;
        border-radius: 1rem !important;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5) !important;
      }
      .driver-popover-title {
        color: hsl(88, 70%, 65%) !important;
        font-size: 1.25rem !important;
        font-weight: 700 !important;
      }
      .driver-popover-description {
        color: hsl(0, 0%, 90%) !important;
        line-height: 1.6 !important;
      }
      .driver-popover-progress-text {
        color: hsl(88, 70%, 65%) !important;
      }
      .driver-popover-next-btn {
        background: hsl(88, 70%, 65%) !important;
        color: hsl(215, 30%, 12%) !important;
        border: none !important;
        text-shadow: none !important;
        font-weight: 600 !important;
        padding: 0.5rem 1.5rem !important;
        border-radius: 0.5rem !important;
      }
      .driver-popover-prev-btn {
        color: hsl(88, 70%, 65%) !important;
        background: transparent !important;
        border: 1px solid hsl(88, 70%, 65%) !important;
        padding: 0.5rem 1rem !important;
        border-radius: 0.5rem !important;
      }
      .driver-popover-close-btn {
        color: hsl(0, 0%, 60%) !important;
      }
      .driver-popover-arrow-side-left.driver-popover-arrow {
        border-left-color: hsl(215, 25%, 18%) !important;
      }
      .driver-popover-arrow-side-right.driver-popover-arrow {
        border-right-color: hsl(215, 25%, 18%) !important;
      }
      .driver-popover-arrow-side-top.driver-popover-arrow {
        border-top-color: hsl(215, 25%, 18%) !important;
      }
      .driver-popover-arrow-side-bottom.driver-popover-arrow {
        border-bottom-color: hsl(215, 25%, 18%) !important;
      }
    `
    document.head.appendChild(style)

    driverObj.drive()
  }

  return null
}
