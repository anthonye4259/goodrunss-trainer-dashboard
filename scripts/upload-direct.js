// Direct upload to Vercel Blob using SDK
// Run with: node scripts/upload-direct.js

require('dotenv').config()
const { put } = require('@vercel/blob')
const fs = require('fs').promises
const path = require('path')

const RESOURCES_DIR = path.join(__dirname, '../public/ambassador-resources')

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
        const filePath = path.join(RESOURCES_DIR, filename)
        const fileBuffer = await fs.readFile(filePath)

        const blob = await put(`ambassador-resources/${filename}`, fileBuffer, {
            access: 'public',
            addRandomSuffix: false,
            token: process.env.BLOB_READ_WRITE_TOKEN
        })

        console.log(`✅ ${filename} uploaded successfully`)
        console.log(`   URL: ${blob.url}`)
        return { filename, url: blob.url }
    } catch (error) {
        console.error(`❌ Error uploading ${filename}:`, error.message)
        return null
    }
}

async function uploadAll() {
    console.log('Starting direct upload to Vercel Blob...\n')

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

    // Save URLs to a JSON file
    const urlMap = {}
    results.forEach(r => {
        urlMap[r.filename] = r.url
    })

    await fs.writeFile(
        path.join(__dirname, '../ambassador-resource-urls.json'),
        JSON.stringify(urlMap, null, 2)
    )

    console.log('URLs saved to ambassador-resource-urls.json')
    console.log('\nNext step: Update app/ambassador/library/page.tsx with these URLs')
}

uploadAll().catch(console.error)
