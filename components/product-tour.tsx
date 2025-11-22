"use client"

import { useState, useEffect } from "react"
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride"
import { useUser } from "@clerk/nextjs"

export function ProductTour() {
  const { user } = useUser()
  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    // Check if user has seen the tour
    if (user) {
      const hasSeenTour = localStorage.getItem(`tour_completed_${user.id}`)
      if (!hasSeenTour) {
        // Small delay before starting tour
        const timer = setTimeout(() => {
          setRun(true)
        }, 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [user])

  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-primary">Welcome to GoodRunss! 🎉</h2>
          <p className="text-base">
            Let's take a quick 2-minute tour to show you the most powerful features of your dashboard.
          </p>
          <p className="text-sm text-muted-foreground">
            You can skip this tour anytime or restart it from Settings.
          </p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[data-tour="dashboard-overview"]',
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-primary">Dashboard Overview</h3>
          <p className="text-sm">
            This is your command center! Track revenue, active clients, sessions, and conversion rates at a glance.
          </p>
        </div>
      ),
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: '[data-tour="booking-link"]',
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-primary">Your Booking Link 🔗</h3>
          <p className="text-sm">
            Share this link on social media, your website, or bio. Clients can book sessions directly!
          </p>
          <p className="text-sm text-muted-foreground">
            💡 Tip: Use the QR code for print materials and flyers.
          </p>
        </div>
      ),
      placement: "left",
      disableBeacon: true,
    },
    {
      target: '[data-tour="calendar"]',
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-primary">Calendar & Sessions 📅</h3>
          <p className="text-sm">
            Manage all your sessions in one place. Add sessions, track attendance, and manage your schedule.
          </p>
        </div>
      ),
      placement: "right",
      disableBeacon: true,
    },
    {
      target: '[data-tour="ai-features"]',
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-primary">AI-Powered Tools ✨</h3>
          <p className="text-sm">
            Meet GIA, your AI assistant! Generate social media posts, workout plans, and marketing content in seconds.
          </p>
          <p className="text-sm text-muted-foreground">
            💡 Save hours every week with AI automation.
          </p>
        </div>
      ),
      placement: "right",
      disableBeacon: true,
    },
    {
      target: '[data-tour="social-share"]',
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-primary">Social Media Sharing 📱</h3>
          <p className="text-sm">
            Share your stats and achievements to Instagram, Twitter, and Snapchat with beautiful graphics.
          </p>
        </div>
      ),
      placement: "right",
      disableBeacon: true,
    },
    {
      target: '[data-tour="referrals"]',
      content: (
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-primary">Referral System 🎁</h3>
          <p className="text-sm">
            Invite other trainers and earn rewards. Track your referrals and grow your network.
          </p>
        </div>
      ),
      placement: "right",
      disableBeacon: true,
    },
    {
      target: "body",
      content: (
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-primary">You're All Set! 🚀</h2>
          <p className="text-base">
            Start by setting up your availability and sharing your booking link with clients.
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-3">
            <p className="text-sm font-semibold text-primary">Quick Start Tips:</p>
            <ul className="text-sm space-y-1 mt-2 text-muted-foreground">
              <li>1. Set up your availability</li>
              <li>2. Create your booking link</li>
              <li>3. Add your first client</li>
              <li>4. Try the AI content generator</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Need help? Check out the Help Center in Settings.
          </p>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
  ]

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type } = data

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      // Mark tour as completed
      if (user) {
        localStorage.setItem(`tour_completed_${user.id}`, "true")
      }
      setRun(false)
      setStepIndex(0)
    } else if (type === "step:after") {
      setStepIndex(index + 1)
    }
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      showProgress
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "hsl(88, 70%, 65%)", // Brand lime green
          textColor: "hsl(0, 0%, 98%)",
          backgroundColor: "hsl(215, 25%, 18%)", // Card background
          overlayColor: "rgba(0, 0, 0, 0.7)",
          arrowColor: "hsl(215, 25%, 18%)",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: "1rem",
          padding: "1.5rem",
        },
        tooltipContent: {
          padding: "0.5rem 0",
        },
        buttonNext: {
          backgroundColor: "hsl(88, 70%, 65%)",
          color: "hsl(215, 30%, 12%)",
          borderRadius: "0.5rem",
          padding: "0.5rem 1.5rem",
          fontSize: "0.875rem",
          fontWeight: "600",
        },
        buttonBack: {
          color: "hsl(88, 70%, 65%)",
          marginRight: "0.5rem",
        },
        buttonSkip: {
          color: "hsl(0, 0%, 55.6%)",
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip Tour",
      }}
    />
  )
}

