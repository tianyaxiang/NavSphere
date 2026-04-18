import { VideoPlayerPage } from '@/components/video-player-page'
import { Metadata } from 'next/types'
import videosData from '@/navsphere/content/videos.json'
import siteDataRaw from '@/navsphere/content/site.json'
import { getProcessedData } from '@/lib/data-loader'

function getData() {
    return getProcessedData(videosData, siteDataRaw)
}

export function generateMetadata(): Metadata {
    const { siteData } = getData()

    return {
        title: `视频播放器 - ${siteData.basic.title}`,
        description: '视频播放中心',
        keywords: 'Bilibili, YouTube, Videos, Player',
        icons: {
            icon: siteData.appearance.favicon,
        },
    }
}

export default function VideoPlayerRoute() {
    const { navigationData, siteData } = getData()

    return (
        <VideoPlayerPage navigationData={navigationData} siteData={siteData} />
    )
}
