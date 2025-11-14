import { NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma" // TODO: Uncomment when ApiKey model is added
// import crypto from "crypto" // TODO: Uncomment when ApiKey model is added

// POST /api/api-keys - Generate new API key
// TODO: ApiKey model doesn't exist in Prisma schema - need to add it or remove this route
export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        success: false,
        error: "API key management not yet implemented - ApiKey model needs to be added to schema",
      },
      { status: 501 }
    )
    
    // Original implementation commented out - model doesn't exist
    /*
    const body = await request.json()
    const { name, permissions = ["read", "write"] } = body

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Name is required",
        },
        { status: 400 }
      )
    }

    // Generate API key
    const key = `gr_${crypto.randomBytes(32).toString("hex")}`

    // Create in database
    const apiKey = await prisma.apiKey.create({
      data: {
        key,
        name,
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      apiKey: {
        id: apiKey.id,
        key: apiKey.key,
        name: apiKey.name,
      },
    })
    */
  } catch (error: any) {
    console.error("❌ Error creating API key:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

// GET /api/api-keys - List all API keys
// TODO: ApiKey model doesn't exist in Prisma schema - need to add it or remove this route
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      apiKeys: [],
      message: "API key management not yet implemented - ApiKey model needs to be added to schema",
    })
    
    // Original implementation commented out - model doesn't exist
    /*
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        permissions: true,
        createdAt: true,
        lastUsedAt: true,
        // Don't return the actual key for security
        key: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      apiKeys,
    })
    */
  } catch (error: any) {
    console.error("❌ Error fetching API keys:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}

