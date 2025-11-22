import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CacheBuster } from "@/components/cache-buster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GoodRunss Trainer Dashboard",
  description: "AI-powered sports & wellness dashboard",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CacheBuster />
        {children}
      </body>
    </html>
  )
}
