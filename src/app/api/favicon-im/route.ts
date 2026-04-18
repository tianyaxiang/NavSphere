import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server';

export const runtime = 'edge'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');
    const larger = searchParams.get('larger') === 'true';

    if (!domain) {
        return NextResponse.json({ error: '缺少有效的 domain 参数' }, { status: 400 });
    }

    // 构建 favicon.im 的 URL
    const faviconUrl = `https://favicon.im/zh/${domain}?larger=true' }`;

    try {
        const response = await fetch(faviconUrl);
        if (!response.ok) {
            return NextResponse.json({ error: '无法访问该网站或未找到 Favicon' }, { status: response.status });
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/png';
        
        return new NextResponse(arrayBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
            },
        });
    } catch (error) {
        console.error('Error fetching favicon from favicon.im:', error);
        return NextResponse.json({ error: '发生错误，请重试。' }, { status: 500 });
    }
}