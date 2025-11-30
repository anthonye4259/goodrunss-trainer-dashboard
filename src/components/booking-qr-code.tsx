'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

interface BookingQRCodeProps {
  bookingUrl: string
  trainerName?: string
}

export function BookingQRCode({ bookingUrl, trainerName }: BookingQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(true)

  useEffect(() => {
    generateQRCode()
  }, [bookingUrl])

  const generateQRCode = async () => {
    if (!canvasRef.current) return
    
    setIsGenerating(true)
    try {
      await QRCode.toCanvas(canvasRef.current, bookingUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQRCode = () => {
    if (!canvasRef.current) return

    // Create a new canvas with extra space for text
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const qrSize = 300
    const padding = 40
    const textHeight = 60
    canvas.width = qrSize + (padding * 2)
    canvas.height = qrSize + (padding * 2) + textHeight

    // White background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw the QR code
    ctx.drawImage(canvasRef.current, padding, padding)

    // Add text below QR code
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 20px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(
      'Scan to Book',
      canvas.width / 2,
      qrSize + padding + 30
    )

    if (trainerName) {
      ctx.font = '16px Inter, sans-serif'
      ctx.fillText(
        `with ${trainerName}`,
        canvas.width / 2,
        qrSize + padding + 52
      )
    }

    // Download
    const link = document.createElement('a')
    link.download = `booking-qr-code-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="space-y-4">
      <div className="relative flex items-center justify-center p-6 bg-white rounded-xl">
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>
      
      <Button 
        onClick={downloadQRCode} 
        variant="outline" 
        className="w-full gap-2"
        disabled={isGenerating}
      >
        <Download className="h-4 w-4" />
        Download QR Code
      </Button>

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>Print this on business cards, flyers, or posters</p>
        <p>Clients can scan with their phone camera to book instantly</p>
      </div>
    </div>
  )
}

