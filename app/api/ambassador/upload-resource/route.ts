import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
    try {
        const { filename } = await request.json()

        if (!filename) {
            return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
        }

        // Read file from public/ambassador-resources
        const filePath = join(process.cwd(), 'public', 'ambassador-resources', filename)
        const fileBuffer = await readFile(filePath)

        // Upload to Vercel Blob
        const blob = await put(`ambassador-resources/${filename}`, fileBuffer, {
            access: 'public',
            addRandomSuffix: false,
        })

        return NextResponse.json({
            success: true,
            url: blob.url,
            filename: filename
        })

    } catch (error: any) {
        console.error('Upload error:', error)
        return NextResponse.json({
            error: error.message || 'Failed to upload file'
        }, { status: 500 })
    }
}
