import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read file content
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 })
    }

    // Parse CSV
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const rows = lines.slice(1)

    // Validate required fields
    const requiredFields = ['name', 'email']
    const missingFields = requiredFields.filter(field => !headers.includes(field))
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 })
    }

    let imported = 0
    let failed = 0
    const errors: string[] = []

    // Get trainer's user ID
    const trainer = await prisma.users.findUnique({
      where: { clerkId: user.id }
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    // Import each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i].split(',').map(cell => cell.trim())
      
      if (row.length !== headers.length) {
        errors.push(`Row ${i + 2}: Column count mismatch`)
        failed++
        continue
      }

      const data: any = {}
      headers.forEach((header, index) => {
        data[header] = row[index] || null
      })

      // Validate email
      if (!data.email || !data.email.includes('@')) {
        errors.push(`Row ${i + 2}: Invalid email`)
        failed++
        continue
      }

      try {
        await prisma.clients.create({
          data: {
            trainerId: trainer.id,
            name: data.name || 'Unknown',
            email: data.email,
            phone: data.phone || null,
            notes: data.notes || null,
          },
        })
        imported++
      } catch (error: any) {
        if (error.code === 'P2002') {
          errors.push(`Row ${i + 2}: Client with email ${data.email} already exists`)
        } else {
          errors.push(`Row ${i + 2}: ${error.message}`)
        }
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      failed,
      errors: errors.slice(0, 10), // Return first 10 errors
    })
  } catch (error: any) {
    console.error('[CSV Import] Error:', error)
    return NextResponse.json(
      { error: 'Import failed', details: error.message },
      { status: 500 }
    )
  }
}

