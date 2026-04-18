'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/registry/new-york/ui/button"
import { useToast } from "@/registry/new-york/hooks/use-toast"
import { Icons } from "@/components/icons"
import { NavigationItem, NavigationSubItem } from '@/types/navigation'
import { Input } from "@/registry/new-york/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
} from "@/registry/new-york/ui/dialog"
import { AddVideoItemForm } from '../../components/AddVideoItemForm'
import { Skeleton } from "@/registry/new-york/ui/skeleton"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/registry/new-york/ui/select"
import { Badge } from "@/registry/new-york/ui/badge"

interface EditingItem {
    index: number
    item: NavigationSubItem
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>
                <Skeleton className="h-10 w-[100px]" />
            </div>
            <div className="grid gap-2">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between p-4 rounded-lg border"
                    >
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <div>
                                <Skeleton className="h-4 w-[200px] mb-2" />
                                <Skeleton className="h-3 w-[150px]" />
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function VideoItemsPage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const { toast } = useToast()
    const [navigation, setNavigation] = useState<NavigationItem | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [enabledFilter, setEnabledFilter] = useState<'all' | 'enabled' | 'disabled'>('all')
    const [editingItem, setEditingItem] = useState<EditingItem | null>(null)
    const [deletingItem, setDeletingItem] = useState<EditingItem | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

    useEffect(() => {
        if (!params?.id) {
            router.push('/admin/videos')
            return
        }
        fetchNavigation()
    }, [params?.id, router])

    const fetchNavigation = async () => {
        setIsLoading(true)
        try {
            if (!params?.id) throw new Error('Navigation ID not found')
            const navigationId = params.id

            // We reuse the generic navigation structure but fetch from videos.json via a different API endpoint logic if we were strictly separating, 
            // but here we might need a specific endpoint to fetch a single video category wrapper.
            // Wait, we need an endpoint to get a single video category to list its items.
            // We can reuse the same pattern: GET /api/videos -> list all categories. 
            // But we need GET /api/videos/[id] -> get specific category.

            // Since we haven't created GET /api/videos/[id] specifically for one item yet (only PUT/DELETE), let's double check.
            // Ah, we created DELETE and PUT in /api/videos/[id]/route.ts. We missed GET.
            // We should add GET to /api/videos/[id]/route.ts or just fetch all and filter client side (less efficient).
            // Let's add GET to /api/videos/[id]/route.ts first.

            // Assuming GET is available now (we will add it next):
            const response = await fetch(`/api/videos/${navigationId}`)
            if (!response.ok) throw new Error('Failed to fetch')

            const data = await response.json()
            setNavigation(data)
        } catch (error) {
            console.error(error)
            toast({
                title: "错误",
                description: "获取数据失败",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const addItem = async (values: NavigationSubItem) => {
        try {
            if (!params?.id) throw new Error('Navigation ID not found')
            const navigationId = params.id

            const response = await fetch(`/api/videos/${navigationId}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            })

            if (!response.ok) throw new Error('Failed to save')

            await fetchNavigation()
            toast({
                title: "成功",
                description: "添加成功"
            })
            setIsAddDialogOpen(false)
        } catch (error) {
            toast({
                title: "错误",
                description: "保存失败",
                variant: "destructive"
            })
        }
    }

    const updateItem = async (index: number, values: NavigationSubItem) => {
        try {
            if (!params?.id) throw new Error('Navigation ID not found')
            const navigationId = params.id

            const response = await fetch(`/api/videos/${navigationId}/items`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ index, item: values })
            })

            if (!response.ok) throw new Error('Failed to save')

            await fetchNavigation()
            toast({
                title: "成功",
                description: "保存成功"
            })
            setEditingItem(null)
        } catch (error) {
            toast({
                title: "错误",
                description: "保存失败",
                variant: "destructive"
            })
        }
    }

    const deleteItem = async (index: number) => {
        try {
            if (!params?.id) throw new Error('Navigation ID not found')
            const navigationId = params.id

            const response = await fetch(`/api/videos/${navigationId}/items`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ index })
            })

            if (!response.ok) throw new Error('Failed to delete')

            await fetchNavigation()
            toast({
                title: "成功",
                description: "删除成功"
            })
            setDeletingItem(null)
        } catch (error) {
            toast({
                title: "错误",
                description: "删除失败",
                variant: "destructive"
            })
        }
    }

    const filteredItems = navigation?.items?.filter(item => {
        const matchesSearch =
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.href.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesEnabled =
            enabledFilter === "all" ? true :
                enabledFilter === "enabled" ? item.enabled :
                    enabledFilter === "disabled" ? !item.enabled :
                        true

        return matchesSearch && matchesEnabled
    }) || []

    if (isLoading) {
        return <LoadingSkeleton />
    }

    if (!navigation) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <p className="text-muted-foreground">视频分类不存在</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="h-8 w-8"
                        title="返回"
                    >
                        <Icons.arrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="text-sm text-muted-foreground mb-1">
                            {navigation?.title}
                        </div>
                    </div>
                    <div className="relative flex-1 max-w-sm">
                        <Icons.search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="搜索视频..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-1 top-1 h-7 w-7 p-0"
                            >
                                <Icons.x className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <Select
                        value={enabledFilter}
                        onValueChange={(value: 'all' | 'enabled' | 'disabled') => setEnabledFilter(value)}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="按状态筛选" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">全部</SelectItem>
                            <SelectItem value="enabled">已启用</SelectItem>
                            <SelectItem value="disabled">已禁用</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Icons.plus className="mr-2 h-4 w-4" />
                            添加视频
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>添加视频</DialogTitle>
                        </DialogHeader>
                        <AddVideoItemForm
                            onSubmit={async (values) => {
                                await addItem(values)
                            }}
                            onCancel={() => setIsAddDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {navigation?.items && navigation.items.length > 0 ? (
                <div className="grid gap-2">
                    {filteredItems.map((item, index) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:border-primary/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 overflow-hidden relative">
                                    {item.icon ? (
                                        <img src={item.icon} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <Icons.video className="h-6 w-6 text-primary" />
                                    )}
                                    {item.videoConfig && (
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                            <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                                <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-black border-b-4 border-b-transparent ml-0.5"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium leading-none">{item.title}</span>
                                        {!item.enabled && (
                                            <Badge variant="secondary" className="text-xs">已禁用</Badge>
                                        )}
                                        {item.videoConfig && (
                                            <Badge variant="outline" className="text-[10px] h-5">
                                                {item.videoConfig.type === 'bilibili' ? 'Bilibili' : 'YouTube'}
                                            </Badge>
                                        )}
                                    </div>
                                    {item.description && (
                                        <div className="text-xs text-muted-foreground mt-1 line-clamp-1 max-w-[400px]">
                                            {item.description}
                                        </div>
                                    )}
                                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[400px]">
                                        {item.href}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => window.open(item.href, '_blank')}
                                    title="访问链接"
                                >
                                    <Icons.globe className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setEditingItem({ index, item })}
                                    title="编辑"
                                >
                                    <Icons.pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setDeletingItem({ index, item })}
                                    title="删除"
                                >
                                    <Icons.trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            {navigation?.items?.length === 0 ? (
                                <p>暂无视频</p>
                            ) : (
                                <p>未找到匹配的视频</p>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-10 text-muted-foreground">
                    暂无视频
                </div>
            )}

            <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>编辑视频</DialogTitle>
                    </DialogHeader>
                    <AddVideoItemForm
                        defaultValues={editingItem?.item}
                        onSubmit={(values) => {
                            if (editingItem) {
                                return updateItem(editingItem.index, values)
                            }
                            return Promise.resolve()
                        }}
                        onCancel={() => setEditingItem(null)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>删除确认</DialogTitle>
                        <DialogDescription>
                            确定要删除视频 &ldquo;{deletingItem?.item.title}&rdquo; 吗？此操作无法撤销。
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setDeletingItem(null)}
                        >
                            取消
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (deletingItem) {
                                    deleteItem(deletingItem.index)
                                }
                            }}
                        >
                            删除
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
