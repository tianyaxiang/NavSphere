import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { commitFile, getFileContent } from '@/lib/github'
import type { NavigationItem, NavigationData } from '@/types/navigation'

export const runtime = 'edge'

const VIDEOS_FILE_PATH = 'src/navsphere/content/videos.json'

export async function GET() {
    try {
        const data = await getFileContent(VIDEOS_FILE_PATH)
        return NextResponse.json(data)
    } catch (error) {
        console.error('Failed to fetch videos data:', error)
        return NextResponse.json({
            navigationItems: []
        })
    }
}

async function validateAndSaveVideosData(data: NavigationData, accessToken: string) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid videos data: not an object')
    }

    if (!('navigationItems' in data)) {
        throw new Error('Invalid videos data: missing navigationItems')
    }

    if (!Array.isArray(data.navigationItems)) {
        throw new Error('Invalid videos data: navigationItems must be an array')
    }

    await commitFile(
        VIDEOS_FILE_PATH,
        JSON.stringify(data, null, 2),
        'Update videos data',
        accessToken
    )
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.accessToken) {
            return new Response('Unauthorized', { status: 401 })
        }

        const data = await request.json()
        await validateAndSaveVideosData(data, session.user.accessToken)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to save videos data:', error)
        return NextResponse.json(
            {
                error: 'Failed to save videos data',
                details: (error as Error).message
            },
            { status: 500 }
        )
    }
}

export async function PUT(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.accessToken) {
            return new Response('Unauthorized', { status: 401 })
        }

        const data = await request.json()
        await validateAndSaveVideosData(data, session.user.accessToken)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to update videos data:', error)
        return NextResponse.json(
            {
                error: 'Failed to update videos data',
                details: (error as Error).message
            },
            { status: 500 }
        )
    }
}
