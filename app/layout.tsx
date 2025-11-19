import type React from "react"
import "./globals.css"
import { ClientLayout } from "./client-layout"
import { ClerkProvider } from '@clerk/nextjs'

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

export const metadata = {
      generator: 'v0.app'
    };
