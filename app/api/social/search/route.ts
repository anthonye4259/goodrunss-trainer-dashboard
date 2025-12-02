import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import { searchReddit } from '@/lib/social/reddit'

export async function GET(req: NextRequest) {
    try {
        const dbUser = await getOrCreateUser()
        if (!dbUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const query = searchParams.get('q')
        const after = searchParams.get('after') || undefined

        if (!query) {
            return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 })
        }

        const result = await searchReddit(query, 25, after)

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Social search error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
