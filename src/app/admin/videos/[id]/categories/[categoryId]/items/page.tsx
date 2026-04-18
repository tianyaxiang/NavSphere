'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/registry/new-york/ui/button"
import { useToast } from "@/registry/new-york/hooks/use-toast"
import { Icons } from "@/components/icons"
import { NavigationItem, NavigationSubItem, NavigationCategory } from '@/types/navigation'
import { Input } from "@/registry/new-york/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/registry/new-york/ui/dialog"
import { AddVideoItemForm } from '../../../../components/AddVideoItemForm'
import { Skeleton } from "@/registry/new-york/ui/skeleton"
import { Badge } from "@/registry/new-york/ui/badge"

// Basically the same as VideoItemsPage but logic differs for fetching/saving

export default function SubCategoryVideoItemsPage() {
    const params = useParams<{ id: string, categoryId: string }>()
    const router = useRouter()
    const { toast } = useToast()
    // We fetch the main navigation, then find the subcategory
    const [navigation, setNavigation] = useState<NavigationItem | null>(null)
    const [subCategory, setSubCategory] = useState<NavigationCategory | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [editingItem, setEditingItem] = useState<{ index: number; item: NavigationSubItem } | null>(null)
    const [deletingItem, setDeletingItem] = useState<{ index: number; item: NavigationSubItem } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

    useEffect(() => {
        if (!params?.id || !params?.categoryId) {
            router.push('/admin/videos')
            return
        }
        fetchNavigation()
    }, [params?.id, params?.categoryId])

    const fetchNavigation = async () => {
        setIsLoading(true)
        try {
            if (!params?.id) throw new Error('ID Missing')
            const response = await fetch(`/api/videos/${params.id}`)
            if (!response.ok) throw new Error('Failed to fetch')
            const data = await response.json() as NavigationItem
            setNavigation(data)

            const foundSub = data.subCategories?.find((cat) => cat.id === params.categoryId)
            if (foundSub) {
                setSubCategory(foundSub)
            } else {
                // Subcategory not found
                toast({ title: "错误", description: "子分类不存在", variant: "destructive" })
                router.push(`/admin/videos/${params.id}/categories`)
            }
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

    // To save changes to a subcategory item, we update the whole navigation object via the main PUT endpoint
    // because we don't have a granular endpoint for subcategory items yet.

    const saveSubCategoryChanges = async (newSubCategoryItems: NavigationSubItem[]) => {
        if (!navigation || !subCategory || !params?.id) return

        // Create updated subcategory list
        const updatedSubCategories = navigation.subCategories?.map((cat) => {
            if (cat.id === subCategory.id) {
                return { ...cat, items: newSubCategoryItems }
            }
            return cat
        })

        const updatedNavigation = { ...navigation, subCategories: updatedSubCategories }

        try {
            const response = await fetch(`/api/videos/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedNavigation)
            })
            if (!response.ok) throw new Error('Failed to save')

            await fetchNavigation()
            toast({ title: "成功", description: "操作成功" })
        } catch (error) {
            toast({ title: "错误", description: "保存失败", variant: "destructive" })
        }
    }

    const addItem = async (values: NavigationSubItem) => {
        if (!subCategory) return
        const newItems = [...(subCategory.items || []), values]
        await saveSubCategoryChanges(newItems)
        setIsAddDialogOpen(false)
    }

    const updateItem = async (index: number, values: NavigationSubItem) => {
        if (!subCategory) return
        const newItems = [...(subCategory.items || [])]
        newItems[index] = values
        await saveSubCategoryChanges(newItems)
        setEditingItem(null)
    }

    const deleteItem = async (index: number) => {
        if (!subCategory) return
        const newItems = [...(subCategory.items || [])]
        newItems.splice(index, 1)
        await saveSubCategoryChanges(newItems)
        setDeletingItem(null)
    }

    // Filtering
    const filteredItems = subCategory?.items?.filter((item: NavigationSubItem) => {
        const matchesSearch =
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.href.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
    }) || []

    if (isLoading) return <div className="p-8">Loading...</div>

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
                            {navigation?.title} / {subCategory?.title}
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
                    </div>
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

            {subCategory?.items && subCategory.items.length > 0 ? (
                <div className="grid gap-2">
                    {filteredItems.map((item: NavigationSubItem, index: number) => (
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
                            <p>未找到匹配的视频</p>
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
                            确定要删除视频 &ldquo;{deletingItem?.item.title}&rdquo; 吗？
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDeletingItem(null)}>取消</Button>
                        <Button variant="destructive" onClick={() => {
                            if (deletingItem) deleteItem(deletingItem.index)
                        }}>删除</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}
