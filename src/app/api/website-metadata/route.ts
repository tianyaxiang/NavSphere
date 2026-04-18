import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uint8ArrayToBase64 } from '@/lib/buffer-utils'

export const runtime = 'edge'

interface VideoConfig {
    type: 'bilibili' | 'youtube'
    videoId?: string
    bvid?: string
    aid?: string
    cid?: string
    p?: number
}

interface WebsiteMetadata {
    title: string
    description: string
    icon: string
    image?: string
    videoConfig?: VideoConfig
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session?.user?.accessToken) {
            return new Response('Unauthorized', { status: 401 })
        }

        const { url } = await request.json()

        if (!url || !isValidUrl(url)) {
            return NextResponse.json({ error: '请提供有效的网站链接' }, { status: 400 })
        }

        const metadata = await fetchWebsiteMetadata(url)

        // 确保 metadata 对象包含所有必需的属性
        if (!metadata || typeof metadata !== 'object') {
            throw new Error('Failed to fetch valid metadata')
        }

        // 处理封面/OG图片
        if (metadata.image) {
            try {
                // 使用页面 URL 作为 Referer，并将文件前缀设为 'cover'，存储到 assets/cover 目录
                const imageUrl = await downloadAndUploadIcon(
                    metadata.image,
                    session.user.accessToken,
                    url,
                    'cover',
                    'assets/cover'
                )
                metadata.image = imageUrl
            } catch (error) {
                console.warn('Failed to download image:', error)
                // 失败保留原URL
            }
        }

        // 如果获取到了 favicon，下载并上传到 GitHub
        // 对于视频链接（如 Bilibili），如果已有封面图片，则不需要处理 favicon
        const isVideoUrl = extractBilibiliVideoId(url) !== null
        const skipFavicon = isVideoUrl && metadata.image

        if (metadata.icon && !skipFavicon) {
            try {
                // 使用页面 URL 作为 Referer
                const iconUrl = await downloadAndUploadIcon(metadata.icon, session.user.accessToken, url, 'favicon')
                metadata.icon = iconUrl

            } catch (error) {
                console.warn('Failed to download icon:', error)
                // 如果图标下载失败，尝试使用 Google favicon 服务
                try {
                    const domain = new URL(url).hostname
                    const fallbackIconUrl = await downloadGoogleFavicon(domain, session.user.accessToken)
                    metadata.icon = fallbackIconUrl
                } catch (fallbackError) {
                    console.warn('Failed to download Google favicon:', fallbackError)
                    // 保持原始 URL
                }
            }
        }

        return NextResponse.json(metadata)
    } catch (error) {
        console.error('Failed to fetch website metadata:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : '获取网站信息失败' },
            { status: 500 }
        )
    }
}

function isValidUrl(string: string): boolean {
    try {
        new URL(string)
        return true
    } catch (_) {
        return false
    }
}

// 从 Bilibili 链接中提取 BV 或 AV 号
function extractBilibiliVideoId(url: string): { bvid?: string; aid?: string } | null {
    try {
        const urlObj = new URL(url)
        if (!urlObj.hostname.includes('bilibili.com')) {
            return null
        }

        // 匹配 BV 号: /video/BVxxxxxxx 或 /video/BV1xxxxx
        const bvidMatch = urlObj.pathname.match(/\/video\/(BV[a-zA-Z0-9]+)/)
        if (bvidMatch) {
            return { bvid: bvidMatch[1] }
        }

        // 匹配 AV 号: /video/avxxxxxxx
        const avidMatch = urlObj.pathname.match(/\/video\/av(\d+)/)
        if (avidMatch) {
            return { aid: avidMatch[1] }
        }

        return null
    } catch {
        return null
    }
}

// 通过 Bilibili API 获取视频信息
async function fetchBilibiliVideoInfo(videoId: { bvid?: string; aid?: string }): Promise<WebsiteMetadata | null> {
    try {
        let apiUrl: string
        if (videoId.bvid) {
            apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${videoId.bvid}`
        } else if (videoId.aid) {
            apiUrl = `https://api.bilibili.com/x/web-interface/view?aid=${videoId.aid}`
        } else {
            return null
        }

        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
                'Referer': 'https://www.bilibili.com/'
            },
            signal: AbortSignal.timeout(5000)
        })

        if (!response.ok) {
            console.warn('Bilibili API request failed:', response.status)
            return null
        }

        const data = await response.json()

        if (data.code !== 0 || !data.data) {
            console.warn('Bilibili API returned error:', data.message)
            return null
        }

        const videoData = data.data

        // 获取第一个分P的cid
        const firstPage = videoData.pages?.[0]
        const cid = firstPage?.cid?.toString() || videoData.cid?.toString()

        return {
            title: videoData.title || '',
            description: videoData.desc || '',
            icon: '/assets/icons/bilibili.svg', // 使用本地 Bilibili 图标
            image: videoData.pic || undefined, // Bilibili 视频封面
            videoConfig: {
                type: 'bilibili',
                bvid: videoData.bvid,
                aid: videoData.aid?.toString(),
                cid: cid,
                p: 1
            }
        }
    } catch (error) {
        console.warn('Failed to fetch Bilibili video info:', error)
        return null
    }
}

async function fetchWebsiteMetadata(url: string): Promise<WebsiteMetadata> {
    try {
        // 优先处理 Bilibili 视频链接
        const bilibiliVideoId = extractBilibiliVideoId(url)
        if (bilibiliVideoId) {
            const bilibiliInfo = await fetchBilibiliVideoInfo(bilibiliVideoId)
            if (bilibiliInfo) {
                return bilibiliInfo
            }
            // 如果 Bilibili API 失败，继续走通用逻辑
        }

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Cache-Control': 'max-age=0',
            'Sec-Ch-Ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"macOS"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1'
        }

        const response = await fetch(url, {
            headers: headers,
            redirect: 'follow',
            signal: AbortSignal.timeout(1500)
        })

        if (response.ok) {
            const html = await response.text()
            return parseMetadataFromHtml(html, url)
        } else if (response.status === 403) {
            console.warn(`网站拒绝访问 (403): 该网站可能阻止了自动化访问`)
            return getFallbackMetadata(url)
        } else if (response.status === 404) {
            return getFallbackMetadata(url)
        } else if (response.status >= 500) {
            return getFallbackMetadata(url)
        } else {
            console.warn(`无法访问网站: ${response.status}`)
            return getFallbackMetadata(url)
        }
    } catch (error) {
        if (error instanceof Error && error.name === 'TimeoutError') {
            console.warn('请求超时，网站响应过慢')
        } else {
            console.warn('获取网站元数据失败:', error)
        }
        return getFallbackMetadata(url)
    }
}

function getFallbackMetadata(url: string): WebsiteMetadata {
    try {
        const urlObj = new URL(url)
        const hostname = urlObj.hostname

        // 生成基本的网站信息
        const title = hostname.replace(/^www\./, '').split('.')[0]
        const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1)

        return {
            title: capitalizedTitle,
            description: `访问 ${hostname}`,
            icon: `https://www.google.com/s2/favicons?sz=128&domain=${hostname}`
        }
    } catch {
        return {
            title: '未知网站',
            description: '无法获取网站信息',
            icon: ''
        }
    }
}

function parseMetadataFromHtml(html: string, url: string): WebsiteMetadata {

    // 解析 HTML 获取元数据
    const title = extractMetaContent(html, 'title') ||
        extractMetaContent(html, 'og:title') ||
        extractMetaContent(html, 'twitter:title') ||
        new URL(url).hostname

    const description = extractMetaContent(html, 'description') ||
        extractMetaContent(html, 'og:description') ||
        extractMetaContent(html, 'twitter:description') ||
        ''

    // 解析 OG Image
    const image = extractMetaContent(html, 'og:image') ||
        extractMetaContent(html, 'twitter:image') ||
        extractMetaContent(html, 'image')

    // 获取 favicon
    const icon = extractFavicon(html, url)

    return {
        title: title.trim(),
        description: description.trim(),
        icon: icon || '',
        image: image || undefined
    }
}

function extractMetaContent(html: string, name: string): string | null {
    // 匹配 title 标签
    if (name === 'title') {
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
        return titleMatch ? titleMatch[1] : null
    }

    // 匹配 meta 标签
    const patterns = [
        new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i'),
        new RegExp(`<meta[^>]*property=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${name}["']`, 'i'),
        new RegExp(`<meta[^>]*itemprop=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*itemprop=["']${name}["']`, 'i')
    ]

    for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match) {
            return match[1]
        }
    }

    return null
}

function extractFavicon(html: string, baseUrl: string): string | null {
    const base = new URL(baseUrl)

    // 尝试从 HTML 中提取 favicon
    const faviconPatterns = [
        /<link[^>]*rel=["']icon["'][^>]*href=["']([^"']*)["']/i,
        /<link[^>]*href=["']([^"']*)["'][^>]*rel=["']icon["']/i,
        /<link[^>]*rel=["']shortcut icon["'][^>]*href=["']([^"']*)["']/i,
        /<link[^>]*href=["']([^"']*)["'][^>]*rel=["']shortcut icon["']/i,
        /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']*)["']/i,
        /<link[^>]*href=["']([^"']*)["'][^>]*rel=["']apple-touch-icon["']/i
    ]

    for (const pattern of faviconPatterns) {
        const match = html.match(pattern)
        if (match) {
            const href = match[1]
            if (href.startsWith('http')) {
                return href
            } else if (href.startsWith('//')) {
                return base.protocol + href
            } else if (href.startsWith('/')) {
                return base.origin + href
            } else {
                return base.origin + '/' + href
            }
        }
    }

    // 如果没有找到，使用 Google 的 favicon 服务作为备用
    return `https://www.google.com/s2/favicons?sz=128&domain=${base.hostname}`
}

async function downloadGoogleFavicon(domain: string, token: string): Promise<string> {
    const googleFaviconUrl = `https://www.google.com/s2/favicons?sz=128&domain=${domain}`

    try {
        const response = await fetch(googleFaviconUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
                'Accept': 'image/*,*/*'
            },
            signal: AbortSignal.timeout(10000)
        })

        if (response.ok) {
            const arrayBuffer = await response.arrayBuffer()
            const binaryData = new Uint8Array(arrayBuffer)
            const { path } = await uploadImageToGitHub(binaryData, token, 'png', 'favicon')
            return path
        } else {
            throw new Error(`Failed to download Google favicon: ${response.status}`)
        }
    } catch (error) {
        throw new Error(`Google favicon download failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

async function downloadAndUploadIcon(
    iconUrl: string,
    token: string,
    referer?: string,
    prefix: string = 'favicon',
    folder: string = 'assets'
): Promise<string> {
    // 判断是否是 Bilibili CDN 图片
    const isBilibiliCdn = iconUrl.includes('hdslb.com') || iconUrl.includes('bilibili.com')

    // 多种策略尝试下载图片
    const strategies: Array<{ headers: HeadersInit; delay?: number }> = []

    if (isBilibiliCdn) {
        // Bilibili CDN 专用策略
        strategies.push({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Referer': 'https://www.bilibili.com/',
                'Origin': 'https://www.bilibili.com'
            }
        })
    }

    // 通用策略: 完整浏览器模拟
    strategies.push({
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Referer': referer || new URL(iconUrl).origin + '/',
            'Sec-Ch-Ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"macOS"',
            'Sec-Fetch-Dest': 'image',
            'Sec-Fetch-Mode': 'no-cors',
            'Sec-Fetch-Site': 'cross-site'
        },
        delay: 1000
    })

    let lastError: Error | null = null

    for (const strategy of strategies) {
        try {
            const response = await fetch(iconUrl, {
                headers: strategy.headers,
                redirect: 'follow',
                signal: AbortSignal.timeout(15000)
            })

            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer()
                const binaryData = new Uint8Array(arrayBuffer)

                // 上传到 GitHub
                const { path } = await uploadImageToGitHub(
                    binaryData,
                    token,
                    getFileExtension(iconUrl),
                    prefix,
                    folder
                )
                return path
            } else {
                lastError = new Error(`HTTP ${response.status}: ${response.statusText}`)
                console.warn(`Strategy failed with status ${response.status}, trying next strategy...`)
            }
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error')
            console.warn(`Strategy failed with error:`, error)
        }
    }

    // 如果所有策略都失败了，抛出最后一个错误
    throw lastError || new Error('All download strategies failed')
}

function getFileExtension(url: string): string {
    try {
        const pathname = new URL(url).pathname
        const extension = pathname.split('.').pop()?.toLowerCase()

        if (extension && ['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp'].includes(extension)) {
            return extension
        }
        return 'png' // 默认扩展名
    } catch {
        return 'png'
    }
}

async function uploadImageToGitHub(
    binaryData: Uint8Array,
    token: string,
    extension: string = 'png',
    prefix: string = 'favicon',
    folder: string = 'assets'
): Promise<{ path: string, commitHash: string }> {
    const owner = process.env.GITHUB_OWNER!
    const repo = process.env.GITHUB_REPO!
    const branch = process.env.GITHUB_BRANCH || 'main'

    // 移除 folder 开头和结尾的斜杠，避免路径错误
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '')
    const path = `/${cleanFolder}/${prefix}_${Date.now()}.${extension}`
    const githubPath = 'public' + path

    // Convert Uint8Array to Base64
    const base64String = uint8ArrayToBase64(binaryData)
    const currentFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${githubPath}?ref=${branch}`

    const response = await fetch(currentFileUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
            message: `Upload ${prefix} ${githubPath}`,
            content: base64String,
            branch: branch,
        }),
    })

    if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to upload image to GitHub:', errorData)
        throw new Error(`Failed to upload image to GitHub: ${errorData.message || 'Unknown error'}`)
    }

    const responseData = await response.json()
    const commitHash = responseData.commit.sha

    return { path, commitHash }
}