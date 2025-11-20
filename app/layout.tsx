import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ClientLayout } from "./client-layout"
import { ClerkProvider } from '@clerk/nextjs'

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  generator: 'v0.app',
  title: 'GoodRunss Trainer Dashboard',
  description: 'Manage your training business with ease',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body>
          <ClientLayout>{children}</ClientLayout>
        </body>
      </html>
    </ClerkProvider>
  )
}
