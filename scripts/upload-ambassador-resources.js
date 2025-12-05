// Script to upload all ambassador resources to Vercel Blob Storage
// Run with: node scripts/upload-ambassador-resources.js

const fs = require('fs').promises
const path = require('path')

const RESOURCES_DIR = path.join(__dirname, '../public/ambassador-resources')
const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const files = [
    'AMBASSADOR EMAIL.png',
    'Cold Outreach Email Templates.docx',
    'BUILT FOR TRAINERS video.mp4',
    'STORY TEMPLATE 3.mp4',
    'STORY TEMPLATE 4.mp4',
    'template 5.mp4',
    'Post Template.png',
    'TEMPLATE 1.png',
    'TEMPLATE 2.png',
    'PROMO VIDEO SCRIPTS_.docx'
]

async function uploadFile(filename) {
    console.log(`Uploading ${filename}...`)

    try {
        const response = await fetch(`${API_URL}/api/ambassador/upload-resource`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename })
        })

        const data = await response.json()

        if (data.success) {
            console.log(`✅ ${filename} uploaded successfully`)
            console.log(`   URL: ${data.url}`)
            return { filename, url: data.url }
        } else {
            console.error(`❌ Failed to upload ${filename}:`, data.error)
            return null
        }
    } catch (error) {
        console.error(`❌ Error uploading ${filename}:`, error.message)
        return null
    }
}

async function uploadAll() {
    console.log('Starting upload of ambassador resources to Vercel Blob...\n')

    const results = []

    for (const file of files) {
        const result = await uploadFile(file)
        if (result) {
            results.push(result)
        }
        // Wait a bit between uploads
        await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('\n=== Upload Complete ===')
    console.log(`Successfully uploaded ${results.length}/${files.length} files\n`)

    // Save URLs to a JSON file for reference
    const urlMap = {}
    results.forEach(r => {
        urlMap[r.filename] = r.url
    })

    await fs.writeFile(
        path.join(__dirname, '../ambassador-resource-urls.json'),
        JSON.stringify(urlMap, null, 2)
    )

    console.log('URLs saved to ambassador-resource-urls.json')
}

uploadAll().catch(console.error)
