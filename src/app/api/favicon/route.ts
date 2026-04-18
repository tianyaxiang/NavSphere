import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server';

export const runtime = 'edge'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');

    if (!domain) {
        return NextResponse.json({ error: '缺少有效的 domain 参数' }, { status: 400 });
    }

    const faviconUrl = `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;

    try {
        const response = await fetch(faviconUrl);
        if (!response.ok) {
            return NextResponse.json({ error: '无法访问该网站或未找到 Favicon' }, { status: response.status });
        }
        const arrayBuffer = await response.arrayBuffer();
        return new NextResponse(arrayBuffer, {
            headers: {
                'Content-Type': 'image/x-icon',
                'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
            },
        });
    } catch (error) {
        console.error('Error fetching favicon:', error);
        return NextResponse.json({ error: '发生错误，请重试。' }, { status: 500 });
    }
} 