import { VideoContent } from '@/components/video-content'
import { Metadata } from 'next/types'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Container } from '@/components/ui/container'
import videosData from '@/navsphere/content/videos.json'
import siteDataRaw from '@/navsphere/content/site.json'
import { getProcessedData } from '@/lib/data-loader'

function getData() {
    return getProcessedData(videosData, siteDataRaw)
}

export function generateMetadata(): Metadata {
    const { siteData } = getData()

    return {
        title: `Videos - ${siteData.basic.title}`,
        description: 'Video Navigation',
        keywords: 'Bilibili, YouTube, Videos',
        icons: {
            icon: siteData.appearance.favicon,
        },
    }
}

export default function VideosPage() {
    const { navigationData, siteData } = getData()

    return (
        <Container>
            <VideoContent navigationData={navigationData} siteData={siteData} />
            <ScrollToTop />
        </Container>
    )
}
