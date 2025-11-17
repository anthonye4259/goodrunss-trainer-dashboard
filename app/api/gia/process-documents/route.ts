/**
 * API Route: Process Documents (Auto CRM)
 * POST /api/gia/process-documents
 * 
 * Uploads documents to Firebase Storage, extracts client data using Claude Vision,
 * and stores structured data in the database
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { initializeApp, getApps } from 'firebase/app'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { parseDocument, generateRecommendations } from '@/lib/services/document-parser'
import type { ProcessDocumentsResponse } from '@/lib/types/auto-crm'

const prisma = new PrismaClient()

// Helper function to convert null to undefined for TypeScript compatibility
function nullsToUndefined<T>(obj: T): T {
  if (obj === null) return undefined as any
  if (typeof obj !== 'object') return obj
  if (obj instanceof Date) return obj
  if (Array.isArray(obj)) return obj.map(nullsToUndefined) as any
  
  const result: any = {}
  for (const key in obj) {
    result[key] = obj[key] === null ? undefined : obj[key]
  }
  return result
}

// Initialize Firebase (only if not already initialized)
if (getApps().length === 0) {
  initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  })
}

const storage = getStorage()

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse multipart form data
    const formData = await request.formData()
    const trainerId = formData.get('trainerId') as string
    const clientName = formData.get('clientName') as string | null
    const files = formData.getAll('files') as File[]

    // Validate
    if (!trainerId) {
      return NextResponse.json(
        { success: false, error: 'Missing trainerId' },
        { status: 400 }
      )
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files uploaded' },
        { status: 400 }
      )
    }

    console.log(`📤 Processing ${files.length} document(s) for trainer ${trainerId}...`)

    // Arrays to store results
    const uploadedDocuments = []
    const extractedProfiles = []
    const extractedProgressList = []
    const extractedGoals = []
    const recommendations = []

    // Process each file
    for (const file of files) {
      try {
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        const fileName = file.name
        const mimeType = file.type
        const fileSize = file.size

        console.log(`📄 Processing: ${fileName} (${mimeType}, ${(fileSize / 1024).toFixed(2)} KB)`)

        // 1. Upload to Firebase Storage
        const storagePath = `crm-documents/${trainerId}/${Date.now()}-${fileName}`
        const storageRef = ref(storage, storagePath)
        
        await uploadBytes(storageRef, fileBuffer, {
          contentType: mimeType,
        })

        const downloadUrl = await getDownloadURL(storageRef)
        console.log(`✅ Uploaded to Firebase: ${storagePath}`)

        // 2. Create document record in database
        const crmDocument = await prisma.crmDocument.create({
          data: {
            trainerId,
            fileName,
            fileUrl: downloadUrl,
            fileType: mimeType.startsWith('image/') ? 'image' : mimeType === 'application/pdf' ? 'pdf' : 'note',
            fileSize,
            status: 'processing',
          },
        })

        uploadedDocuments.push(crmDocument)

        // 3. Parse document with Claude Vision
        const aiAnalysis = await parseDocument(fileBuffer, mimeType, fileName)

        // 4. Update document status
        await prisma.crmDocument.update({
          where: { id: crmDocument.id },
          data: {
            status: 'completed',
            processedAt: new Date(),
            extractedData: (aiAnalysis.extractedData || {}) as any,
            confidence: aiAnalysis.confidence || 0.9,
          },
        })

        // 5. Save extracted data to database
        const { extractedData } = aiAnalysis

        // Save client profile if present
        if (extractedData.clientInfo) {
          const profile = await prisma.extractedClientProfile.create({
            data: {
              documentId: crmDocument.id,
              trainerId,
              name: extractedData.clientInfo.name || clientName || 'Unknown',
              age: extractedData.clientInfo.age || null,
              email: extractedData.clientInfo.email || null,
              phone: extractedData.clientInfo.phone || null,
              sport: null,
              level: null,
              notes: null,
              goals: (extractedData.goals?.map(g => g.goal || g.description || 'Goal') || []) as any,
              preferences: {
                emergencyContact: extractedData.clientInfo.emergencyContact,
                medicalHistory: extractedData.clientInfo.medicalHistory,
                injuries: extractedData.clientInfo.injuries,
                medications: extractedData.clientInfo.medications,
                allergies: extractedData.clientInfo.allergies,
              } as any,
              source: 'document',
              confidence: aiAnalysis.confidence || 0.8,
            },
          })

          extractedProfiles.push(profile)

          // Generate recommendations for this client
          if (extractedData.goals || extractedData.progress) {
            const recs = await generateRecommendations(
              extractedData.clientInfo,
              extractedData.goals,
              extractedData.progress
            )

            for (const recText of recs) {
              const recommendation = await prisma.recommendedSession.create({
                data: {
                  trainerId,
                  clientName: extractedData.clientInfo.name || clientName || 'Unknown',
                  sessionType: 'Recommended Training',
                  description: recText,
                  duration: 45,
                  focus: [] as any,
                  status: 'pending',
                },
              })
              recommendations.push(recommendation)
            }
          }

          // Save goals
          if (extractedData.goals) {
            for (const goalInfo of extractedData.goals) {
              const extractedGoal = await prisma.extractedGoal.create({
                data: {
                  trainerId,
                  documentId: crmDocument.id,
                  clientName: extractedData.clientInfo.name || clientName || 'Unknown',
                  goal: goalInfo.goal || goalInfo.description || 'Unnamed goal',
                  deadline: goalInfo.targetDate || null,
                  priority: goalInfo.priority || null,
                  status: 'active',
                  source: 'document',
                  confidence: aiAnalysis.confidence || 0.8,
                },
              })
              extractedGoals.push(extractedGoal)
            }
          }

          // Save progress entries
          if (extractedData.progress) {
            for (const prog of extractedData.progress) {
              const extractedProgress = await prisma.extractedProgress.create({
                data: {
                  trainerId,
                  documentId: crmDocument.id,
                  clientName: extractedData.clientInfo.name || clientName || 'Unknown',
                  date: prog.date || new Date(),
                  metric: prog.metric || prog.type || 'Progress',
                  value: prog.value || prog.description || 'N/A',
                  notes: prog.notes || null,
                  source: 'document',
                  confidence: aiAnalysis.confidence || 0.8,
                },
              })
              extractedProgressList.push(extractedProgress)
            }
          }
        }

        console.log(`✅ Successfully processed: ${fileName}`)
      } catch (fileError) {
        console.error(`❌ Error processing file ${file.name}:`, fileError)
        // Continue with other files
      }
    }

    const totalTime = Date.now() - startTime

    console.log(`🎉 Processed ${files.length} document(s) in ${totalTime}ms`)
    console.log(`   - ${extractedProfiles.length} client profiles`)
    console.log(`   - ${extractedGoals.length} goals`)
    console.log(`   - ${extractedProgressList.length} progress entries`)
    console.log(`   - ${recommendations.length} AI recommendations`)

    const response: ProcessDocumentsResponse = {
      success: true,
      data: {
        documents: uploadedDocuments as any,
        extractedProfiles: extractedProfiles as any,
        extractedProgress: extractedProgressList as any,
        extractedGoals: extractedGoals as any,
        recommendations: recommendations as any,
      },
      processingTime: totalTime,
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'X-Processing-Time': `${totalTime}ms`,
      },
    })
  } catch (error) {
    console.error('❌ Error in process-documents API:', error)

    const errorMessage = error instanceof Error ? error.message : 'Failed to process documents'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        processingTime: Date.now() - startTime,
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * GET endpoint to retrieve extracted CRM data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trainerId = searchParams.get('trainerId')
    const profileId = searchParams.get('profileId')

    if (!trainerId) {
      return NextResponse.json(
        { success: false, error: 'Missing trainerId' },
        { status: 400 }
      )
    }

    let profiles, progress, goals, recommendations

    if (profileId) {
      // Get data for specific profile
      profiles = await prisma.extractedClientProfile.findMany({
        where: { id: profileId, trainerId },
      })
      progress = await prisma.extractedProgress.findMany({
        where: { extractedClientProfileId: profileId, trainerId },
        orderBy: { progressDate: 'desc' },
      })
      goals = await prisma.extractedGoal.findMany({
        where: { extractedClientProfileId: profileId, trainerId },
        orderBy: { createdAt: 'desc' },
      })
      recommendations = await prisma.recommendedSession.findMany({
        where: { extractedClientProfileId: profileId, trainerId },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      // Get all data for trainer
      profiles = await prisma.extractedClientProfile.findMany({
        where: { trainerId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
      progress = await prisma.extractedProgress.findMany({
        where: { trainerId },
        orderBy: { progressDate: 'desc' },
        take: 100,
      })
      goals = await prisma.extractedGoal.findMany({
        where: { trainerId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
      recommendations = await prisma.recommendedSession.findMany({
        where: { trainerId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        profiles,
        progress,
        goals,
        recommendations,
      },
    })
  } catch (error) {
    console.error('Error fetching CRM data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch CRM data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

