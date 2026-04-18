'use client'

import { useState, useEffect } from 'react'
import type { NavigationData, NavigationItem, NavigationSubItem, NavigationCategory } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'
import { ModeToggle } from '@/components/mode-toggle'
import { ChevronDown, ChevronRight, PlayCircle, Home, LayoutGrid, List } from 'lucide-react'
import { Button } from "@/registry/new-york/ui/button"
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/registry/new-york/ui/scroll-area'

interface VideoPlayerPageProps {
    navigationData: NavigationData
    siteData: SiteConfig
}

export function VideoPlayerPage({ navigationData, siteData }: VideoPlayerPageProps) {
    const [selectedVideo, setSelectedVideo] = useState<NavigationSubItem | null>(null)
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
    const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set())

    // 默认选择第一个视频
    useEffect(() => {
        if (!selectedVideo) {
            for (const category of navigationData.navigationItems) {
                if (category.items && category.items.length > 0) {
                    const firstVideoItem = category.items.find(item => item.videoConfig)
                    if (firstVideoItem) {
                        setSelectedVideo(firstVideoItem)
                        setExpandedCategories(new Set([category.id]))
                        return
                    }
                }
                if (category.subCategories) {
                    for (const sub of category.subCategories) {
                        if (sub.items && sub.items.length > 0) {
                            const firstVideoItem = sub.items.find(item => item.videoConfig)
                            if (firstVideoItem) {
                                setSelectedVideo(firstVideoItem)
                                setExpandedCategories(new Set([category.id]))
                                setExpandedSubCategories(new Set([sub.id]))
                                return
                            }
                        }
                    }
                }
            }
        }
    }, [navigationData, selectedVideo])

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev)
            if (next.has(categoryId)) {
                next.delete(categoryId)
            } else {
                next.add(categoryId)
            }
            return next
        })
    }

    const toggleSubCategory = (subCategoryId: string) => {
        setExpandedSubCategories(prev => {
            const next = new Set(prev)
            if (next.has(subCategoryId)) {
                next.delete(subCategoryId)
            } else {
                next.add(subCategoryId)
            }
            return next
        })
    }

    const renderVideoPlayer = () => {
        if (!selectedVideo?.videoConfig) {
            return (
                <div className="w-full aspect-video bg-zinc-900 rounded-xl flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p>请从右侧列表选择视频播放</p>
                    </div>
                </div>
            )
        }

        const { videoConfig } = selectedVideo

        if (videoConfig.type === 'bilibili') {
            const { bvid, aid, cid, p = 1 } = videoConfig
            const src = `//player.bilibili.com/player.html?isOutside=true&aid=${aid}&bvid=${bvid}&cid=${cid}&p=${p}&autoplay=1`

            return (
                <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                    <iframe
                        key={selectedVideo.id}
                        src={src}
                        scrolling="no"
                        frameBorder="0"
                        allowFullScreen={true}
                        className="w-full h-full border-0"
                    ></iframe>
                </div>
            )
        }

        if (videoConfig.type === 'youtube') {
            const { videoId } = videoConfig
            return (
                <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                    <iframe
                        key={selectedVideo.id}
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                        title={selectedVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            )
        }

        return null
    }

    const renderVideoItem = (item: NavigationSubItem) => {
        const isSelected = selectedVideo?.id === item.id
        const hasVideoConfig = !!item.videoConfig

        return (
            <button
                key={item.id}
                onClick={() => hasVideoConfig && setSelectedVideo(item)}
                disabled={!hasVideoConfig}
                className={cn(
                    "w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-start gap-2",
                    "hover:bg-accent/50",
                    isSelected && "bg-primary/10 text-primary border-l-2 border-primary",
                    !hasVideoConfig && "opacity-50 cursor-not-allowed"
                )}
            >
                <PlayCircle className={cn(
                    "w-4 h-4 mt-0.5 flex-shrink-0",
                    isSelected ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="text-sm line-clamp-2">{item.title}</span>
            </button>
        )
    }

    const renderSubCategory = (sub: NavigationCategory, categoryId: string) => {
        const isExpanded = expandedSubCategories.has(sub.id)
        const videoItems = (sub.items || []).filter(item => item.enabled !== false)

        if (videoItems.length === 0) return null

        return (
            <div key={sub.id} className="ml-2">
                <button
                    onClick={() => toggleSubCategory(sub.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/30 rounded-md transition-colors"
                >
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                    ) : (
                        <ChevronRight className="w-4 h-4" />
                    )}
                    <span>{sub.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground/60">{videoItems.length}</span>
                </button>
                {isExpanded && (
                    <div className="ml-4 mt-1 space-y-0.5">
                        {videoItems.map(item => renderVideoItem(item))}
                    </div>
                )}
            </div>
        )
    }

    const renderCategory = (category: NavigationItem) => {
        const isExpanded = expandedCategories.has(category.id)
        const hasSubCategories = category.subCategories && category.subCategories.length > 0
        const directItems = (category.items || []).filter(item => item.enabled !== false)
        const totalItems = hasSubCategories
            ? category.subCategories!.reduce((sum, sub) => sum + (sub.items?.length || 0), 0)
            : directItems.length

        if (totalItems === 0) return null

        return (
            <div key={category.id} className="mb-2">
                <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 font-medium hover:bg-accent/50 rounded-lg transition-colors"
                >
                    {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-primary" />
                    ) : (
                        <ChevronRight className="w-5 h-5" />
                    )}
                    <span>{category.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {totalItems}
                    </span>
                </button>
                {isExpanded && (
                    <div className="mt-1 space-y-1">
                        {hasSubCategories ? (
                            category.subCategories!.map(sub => renderSubCategory(sub, category.id))
                        ) : (
                            <div className="ml-4 space-y-0.5">
                                {directItems.map(item => renderVideoItem(item))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* 顶部导航栏 */}
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center px-4 gap-4">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <PlayCircle className="w-6 h-6 text-primary" />
                        <span>视频中心</span>
                    </Link>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <Button variant="ghost" size="icon">
                                <Home className="w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="/videos">
                            <Button variant="ghost" size="icon">
                                <LayoutGrid className="w-5 h-5" />
                            </Button>
                        </Link>
                        <ModeToggle />
                    </div>
                </div>
            </header>

            {/* 主内容区域 */}
            <div className="flex h-[calc(100vh-3.5rem)]">
                {/* 左侧播放器区域 */}
                <div className="flex-1 p-4 lg:p-6 overflow-auto">
                    <div className="max-w-5xl mx-auto space-y-4">
                        {/* 视频播放器 */}
                        {renderVideoPlayer()}

                        {/* 视频信息 */}
                        {selectedVideo && (
                            <div className="space-y-3">
                                <h1 className="text-xl font-semibold">
                                    {selectedVideo.title}
                                </h1>
                                {selectedVideo.description && (
                                    <p className="text-muted-foreground text-sm">
                                        {selectedVideo.description}
                                    </p>
                                )}
                                {selectedVideo.videoConfig && (
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "px-2 py-0.5 text-xs font-medium rounded",
                                            selectedVideo.videoConfig.type === 'bilibili'
                                                ? "bg-pink-500/10 text-pink-500"
                                                : "bg-red-500/10 text-red-500"
                                        )}>
                                            {selectedVideo.videoConfig.type === 'bilibili' ? 'Bilibili' : 'YouTube'}
                                        </span>
                                        {selectedVideo.href && (
                                            <a
                                                href={selectedVideo.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary hover:underline"
                                            >
                                                在原站打开 →
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 右侧播放列表 */}
                <div className="hidden md:block w-80 lg:w-96 border-l bg-muted/30">
                    <div className="sticky top-0 p-4 border-b bg-background/95 backdrop-blur">
                        <div className="flex items-center gap-2">
                            <List className="w-5 h-5 text-primary" />
                            <h2 className="font-semibold">播放列表</h2>
                        </div>
                    </div>
                    <ScrollArea className="h-[calc(100vh-7rem)]">
                        <div className="p-3 space-y-1">
                            {navigationData.navigationItems.map(category => renderCategory(category))}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* 移动端底部播放列表 */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur">
                <ScrollArea className="h-48">
                    <div className="p-3 space-y-1">
                        {navigationData.navigationItems.map(category => renderCategory(category))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
