"use client"

import { Bell, MessageSquare, HelpCircle, Globe } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"

export function Header() {
  const router = useRouter()
  const { toast } = useToast()
  const { language, setLanguage } = useLanguage()
  const { user, isLoaded } = useUser()
  const [userEmail, setUserEmail] = useState<string>("")
  const [userName, setUserName] = useState<string>("")

  useEffect(() => {
    if (isLoaded && user) {
      setUserEmail(user.primaryEmailAddress?.emailAddress || "")
      setUserName(user.fullName || user.firstName || "Trainer")
    }
  }, [isLoaded, user])

  const handleLogout = () => {
    localStorage.removeItem("trainer_authenticated")
    localStorage.removeItem("trainer_email")
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    })
    router.push("/login")
  }

  const languages = [
    { code: "en", name: "English", native: "English" },
    { code: "es", name: "Spanish", native: "Español" },
    { code: "fr", name: "French", native: "Français" },
    { code: "pt", name: "Portuguese", native: "Português" },
    { code: "ar", name: "Arabic", native: "عربي" },
    { code: "zh", name: "Chinese", native: "中国人" },
    { code: "hi", name: "Hindi", native: "हिंदी" },
    { code: "bn", name: "Bengali", native: "বাংলা" },
    { code: "ru", name: "Russian", native: "Русский" },
    { code: "ur", name: "Urdu", native: "اردو" },
  ]

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/95 backdrop-blur-sm px-4 md:px-8 flex-shrink-0">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg blur-md opacity-50" />
          <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white flex items-center justify-center p-1">
            <Image 
              src="/goodrunss-logo.svg" 
              alt="GoodRunss" 
              width={28}
              height={28}
              className="object-contain w-full h-full"
            />
          </div>
        </div>

        <div className="relative">
          <h1 className="text-lg md:text-2xl font-bold tracking-tighter bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-shift">
            GOODRUNSS
          </h1>
          <div className="text-[10px] md:text-xs font-semibold tracking-widest text-primary/60 uppercase -mt-1">
            Trainer Dashboard
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
              <Globe className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card border-primary/20" align="end">
            <DropdownMenuLabel className="text-primary text-base font-semibold">Language</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-primary/20" />
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code as any)}
                className={`cursor-pointer focus:bg-primary/10 ${
                  language === lang.code ? "bg-primary/10 text-primary" : "text-foreground hover:bg-primary/10"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{lang.name}</span>
                  <span className="text-sm text-muted-foreground">{lang.native}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors">
              <Bell className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <span className="absolute right-1 top-1 md:right-1.5 md:top-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 bg-card border-primary/20" align="end">
            <DropdownMenuLabel className="text-primary text-base font-semibold">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-primary/20" />

            <DropdownMenuItem className="flex flex-col items-start py-3 px-4 hover:bg-primary/10 cursor-pointer focus:bg-primary/10">
              <div className="font-semibold text-primary">New client signed up</div>
              <div className="text-sm text-primary/80 mt-0.5">Sarah Johnson joined your program</div>
              <div className="text-xs text-primary/50 mt-1">2 hours ago</div>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex flex-col items-start py-3 px-4 hover:bg-primary/10 cursor-pointer focus:bg-primary/10">
              <div className="font-semibold text-primary">Session reminder</div>
              <div className="text-sm text-primary/80 mt-0.5">Mike Chen - Tomorrow at 9:00 AM</div>
              <div className="text-xs text-primary/50 mt-1">5 hours ago</div>
            </DropdownMenuItem>

            <DropdownMenuItem className="flex flex-col items-start py-3 px-4 hover:bg-primary/10 cursor-pointer focus:bg-primary/10">
              <div className="font-semibold text-primary">Payment received</div>
              <div className="text-sm text-primary/80 mt-0.5">$80 from Emily Davis</div>
              <div className="text-xs text-primary/50 mt-1">1 day ago</div>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-primary/20" />
            <DropdownMenuItem className="text-primary justify-center font-medium hover:bg-primary/10 cursor-pointer focus:bg-primary/10">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
                <MessageSquare className="h-5 w-5 text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 bg-card border-primary/20" align="end">
              <DropdownMenuLabel className="text-primary text-base font-semibold">Messages</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-primary/20" />

              <DropdownMenuItem className="flex flex-col items-start py-3 px-4 hover:bg-primary/10 cursor-pointer focus:bg-primary/10">
                <div className="font-semibold text-primary">Sarah Johnson</div>
                <div className="text-sm text-primary/80 mt-0.5">Can we reschedule tomorrow's session?</div>
                <div className="text-xs text-primary/50 mt-1">1 hour ago</div>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex flex-col items-start py-3 px-4 hover:bg-primary/10 cursor-pointer focus:bg-primary/10">
                <div className="font-semibold text-primary">Mike Chen</div>
                <div className="text-sm text-primary/80 mt-0.5">Thanks for the workout plan!</div>
                <div className="text-xs text-primary/50 mt-1">3 hours ago</div>
              </DropdownMenuItem>

              <DropdownMenuItem className="flex flex-col items-start py-3 px-4 hover:bg-primary/10 cursor-pointer focus:bg-primary/10">
                <div className="font-semibold text-primary">Emily Davis</div>
                <div className="text-sm text-primary/80 mt-0.5">What time is our session on Friday?</div>
                <div className="text-xs text-primary/50 mt-1">Yesterday</div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-primary/20" />
              <Link href="/dashboard/messages">
                <DropdownMenuItem className="text-primary justify-center font-medium hover:bg-primary/10 cursor-pointer focus:bg-primary/10">
                  View all messages
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="hidden sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
                <HelpCircle className="h-5 w-5 text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card border-primary/20" align="end">
              <DropdownMenuLabel className="text-primary text-base font-semibold">Help & Support</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-primary/20" />
              <DropdownMenuItem className="text-primary hover:bg-primary/10 cursor-pointer focus:bg-primary/10">
                Documentation
              </DropdownMenuItem>
              <DropdownMenuItem className="text-primary hover:bg-primary/10 cursor-pointer focus:bg-primary/10">
                Video Tutorials
              </DropdownMenuItem>
              <DropdownMenuItem className="text-primary hover:bg-primary/10 cursor-pointer focus:bg-primary/10">
                Contact Support
              </DropdownMenuItem>
              <DropdownMenuItem className="text-primary hover:bg-primary/10 cursor-pointer focus:bg-primary/10">
                Keyboard Shortcuts
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-primary/20" />
              <DropdownMenuItem className="text-primary hover:bg-primary/10 cursor-pointer focus:bg-primary/10">
                What's New
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary/10 transition-colors">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.imageUrl} alt={userName} />
                <AvatarFallback className="bg-primary text-background font-semibold">
                  {userName.split(' ').map(n => n[0]).join('').toUpperCase() || 'T'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-card border-primary/20" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-primary">{userName || "Trainer"}</p>
                <p className="text-xs text-primary/70">{userEmail || "Loading..."}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-primary/20" />
            <Link href="/dashboard/settings">
              <DropdownMenuItem className="text-primary hover:bg-primary/10 cursor-pointer focus:bg-primary/10">
                Profile
              </DropdownMenuItem>
            </Link>
            <Link href="/dashboard/settings">
              <DropdownMenuItem className="text-primary hover:bg-primary/10 cursor-pointer focus:bg-primary/10">
                Settings
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="bg-primary/20" />
            <DropdownMenuItem
              className="text-destructive hover:bg-destructive/10 cursor-pointer focus:bg-destructive/10"
              onClick={handleLogout}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
