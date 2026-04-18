'use client'

export const runtime = 'edge'

import { useState } from "react"
import { Button } from "@/registry/new-york/ui/button"
import { VideoCategoryCard } from "./components/VideoCategoryCard"
import { AddVideoCategoryForm } from "./components/AddVideoCategoryForm"
import { Input } from "@/registry/new-york/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/registry/new-york/ui/dialog"
import { useToast } from "@/registry/new-york/hooks/use-toast"
import { Skeleton } from "@/registry/new-york/ui/skeleton"
import useSWR from 'swr'
import { NavigationItem } from "@/types/navigation"
import { Plus, AlertTriangle, Inbox } from 'lucide-react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/registry/new-york/ui/select"


async function fetcher(url: string): Promise<NavigationItem[]> {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch video categories')
    const data = await res.json()
    return data.navigationItems || []
}

export default function VideosAdminPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [showEnabled, setShowEnabled] = useState<boolean | null>(null)
    const { toast } = useToast()

    const { data: items = [], error, isLoading, mutate } = useSWR<NavigationItem[]>(
        '/api/videos',
        fetcher,
        {
            fallbackData: [],
            revalidateOnFocus: false,
        }
    )

    const handleAdd = async (values: {
        title: string;
        icon: string;
        description?: string;
        enabled?: boolean
    }) => {
        try {
            const newItem: NavigationItem = {
                id: Date.now().toString(),
                title: values.title,
                icon: values.icon,
                description: values.description || '',
                enabled: values.enabled ?? true,
                items: [],
                subCategories: []
            }

            const response = await fetch('/api/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    navigationItems: [
                        ...items,
                        newItem
                    ]
                })
            })

            if (!response.ok) {
                throw new Error('Failed to add')
            }

            setIsDialogOpen(false)
            mutate()
            toast({
                title: "成功",
                description: "添加成功"
            })
        } catch (error) {
            console.error('添加分类错误:', error)
            toast({
                title: "错误",
                description: "添加失败",
                variant: "destructive"
            })
        }
    }

    const filteredItems = items
        .filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (showEnabled === null || item.enabled === showEnabled)
        )

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center gap-4 flex-1">
                    <Input
                        placeholder="搜索视频分类..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-[300px]"
                    />
                    <Select
                        value={showEnabled === null ? "all" : String(showEnabled)}
                        onValueChange={(value) => {
                            if (value === "all") {
                                setShowEnabled(null)
                            } else {
                                setShowEnabled(value === "true")
                            }
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="状态筛选" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">全部</SelectItem>
                            <SelectItem value="true">已启用</SelectItem>
                            <SelectItem value="false">已禁用</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    添加分类
                </Button>
            </div>
            <div className="space-y-4">
                {error ? (
                    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                            <AlertTriangle className="h-10 w-10 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">加载失败</h3>
                            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                获取数据时发生错误，请稍后重试。
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => mutate()}
                            >
                                重试
                            </Button>
                        </div>
                    </div>
                ) : isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-4 rounded-lg border">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-6 w-6 rounded" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : filteredItems.length === 0 ? (
                    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                            <Inbox className="h-10 w-10 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">暂无分类</h3>
                            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                {searchQuery ? "没有找到匹配的分类。" : "还没有添加任何分类，点击上方的添加按钮开始创建。"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredItems.map((item, index) => (
                            <VideoCategoryCard
                                key={item.id}
                                item={item}
                                index={index}
                                onUpdate={mutate}
                            />
                        ))}
                    </div>
                )}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>添加视频分类</DialogTitle>
                    </DialogHeader>
                    <AddVideoCategoryForm
                        onSubmit={handleAdd}
                        onCancel={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
