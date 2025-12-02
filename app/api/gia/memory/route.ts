import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import { getMemories, updateMemory, deleteMemory, clearAllMemories } from '@/lib/gia/memory'

export async function GET(req: NextRequest) {
    try {
        const dbUser = await getOrCreateUser()
        if (!dbUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const category = searchParams.get('category') as any

        const memories = await getMemories(dbUser.id, category)

        return NextResponse.json({ memories })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const dbUser = await getOrCreateUser()
        if (!dbUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { key, value } = await req.json()

        if (!key || !value) {
            return NextResponse.json({ error: 'Missing key or value' }, { status: 400 })
        }

        const memory = await updateMemory(dbUser.id, key, value)

        if (!memory) {
            return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
        }

        return NextResponse.json({ memory })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const dbUser = await getOrCreateUser()
        if (!dbUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const key = searchParams.get('key')
        const clearAll = searchParams.get('clearAll') === 'true'

        if (clearAll) {
            const count = await clearAllMemories(dbUser.id)
            return NextResponse.json({ success: true, count })
        }

        if (!key) {
            return NextResponse.json({ error: 'Missing key' }, { status: 400 })
        }

        const success = await deleteMemory(dbUser.id, key)

        if (!success) {
            return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
