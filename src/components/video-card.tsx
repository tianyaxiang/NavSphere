'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { PlayCircle, Clock, Eye } from 'lucide-react'
import type { NavigationSubItem } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'

interface VideoCardProps {
    item: NavigationSubItem
    siteConfig?: SiteConfig
}

export function VideoCard({ item, siteConfig }: VideoCardProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)
    const { videoConfig } = item

    const isExternalIcon = item.icon?.startsWith('http') || item.icon?.startsWith('//')
    const isLocalIcon = item.icon && !isExternalIcon

    const coverPath = isLocalIcon && item.icon
        ? item.icon.startsWith('/')
            ? item.icon
            : `/${item.icon}`
        : item.icon || ''

    // 处理可能以 // 开头的 URL
    const normalizedCoverPath = coverPath.startsWith('//')
        ? `https:${coverPath}`
        : coverPath

    const handleCardClick = (e: React.MouseEvent) => {
        if (videoConfig) {
            e.preventDefault()
            setIsOpen(true)
        } else if (item.href) {
            window.open(item.href, '_blank')
        }
    }

    const renderVideoContent = () => {
        if (!videoConfig) return null

        if (videoConfig.type === 'bilibili') {
            const { bvid, aid, cid, p = 1 } = videoConfig
            const src = `//player.bilibili.com/player.html?isOutside=true&aid=${aid}&bvid=${bvid}&cid=${cid}&p=${p}&autoplay=1`

            return (
                <div className="w-full aspect-video">
                    <iframe
                        src={src}
                        scrolling="no"
                        frameBorder="0"
                        allowFullScreen={true}
                        className="w-full h-full rounded-lg border-0"
                    ></iframe>
                </div>
            )
        }

        if (videoConfig.type === 'youtube') {
            const { videoId } = videoConfig
            return (
                <div className="w-full aspect-video">
                    <iframe
                        className="w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                        title={item.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            )
        }

        return null
    }

    // 获取平台标识
    const getPlatformBadge = () => {
        if (videoConfig?.type === 'bilibili') {
            return (
                <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-pink-500/90 text-white rounded-md backdrop-blur-sm">
                    bilibili
                </span>
            )
        }
        if (videoConfig?.type === 'youtube') {
            return (
                <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-red-600/90 text-white rounded-md backdrop-blur-sm">
                    YouTube
                </span>
            )
        }
        return null
    }

    return (
        <>
            <div
                className="group cursor-pointer overflow-hidden rounded-xl bg-card border border-border/50 
                           transition-all duration-300 ease-out hover:shadow-xl hover:shadow-primary/5 
                           hover:border-primary/20 hover:-translate-y-1"
                onClick={handleCardClick}
            >
                {/* 封面图区域 */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                    {/* 封面图 */}
                    {normalizedCoverPath && !imageError ? (
                        <>
                            {/* 骨架屏加载效果 */}
                            {!imageLoaded && (
                                <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-pulse" />
                            )}
                            <img
                                src={normalizedCoverPath}
                                alt={item.title}
                                className={`w-full h-full object-cover transition-all duration-500 
                                           group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                onLoad={() => setImageLoaded(true)}
                                onError={() => setImageError(true)}
                            />
                        </>
                    ) : (
                        /* 默认占位符 */
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
                            <PlayCircle className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                    )}

                    {/* 播放按钮遮罩 */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 
                                    flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/90 dark:bg-white/80 
                                        flex items-center justify-center opacity-0 group-hover:opacity-100 
                                        transform scale-75 group-hover:scale-100 transition-all duration-300
                                        shadow-lg">
                            <PlayCircle className="w-8 h-8 text-primary fill-primary/20" />
                        </div>
                    </div>

                    {/* 平台标识 */}
                    {getPlatformBadge()}

                    {/* 渐变遮罩 - 底部 */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* 标题区域 */}
                <div className="p-3 space-y-2">
                    <h3 className="font-medium text-sm leading-snug line-clamp-2 
                                   group-hover:text-primary transition-colors duration-200">
                        {item.title}
                    </h3>

                    {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.description}
                        </p>
                    )}
                </div>
            </div>

            {/* 视频播放弹窗 */}
            {videoConfig && (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden bg-black border-zinc-800 gap-0">
                        {/* 无障碍访问 */}
                        <div className='sr-only'>
                            <DialogTitle>{item.title}</DialogTitle>
                            <DialogDescription>Playing video: {item.title}</DialogDescription>
                        </div>

                        {/* 视频播放器 */}
                        {renderVideoContent()}

                        {/* 视频信息 */}
                        <div className="p-4 bg-zinc-900">
                            <h3 className="text-white font-medium text-base line-clamp-2">
                                {item.title}
                            </h3>
                            {item.description && (
                                <p className="text-zinc-400 text-sm mt-2 line-clamp-2">
                                    {item.description}
                                </p>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}
