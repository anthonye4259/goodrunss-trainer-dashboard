import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { put } from '@vercel/blob'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const uploadedFiles = []

    for (const file of files) {
      // Upload to Vercel Blob
      const blob = await put(`gia/${user.id}/${Date.now()}-${file.name}`, file, {
        access: 'public',
      })

      uploadedFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        url: blob.url,
      })
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    })
  } catch (error: any) {
    console.error('[GIA Upload] Error:', error)
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    )
  }
}

