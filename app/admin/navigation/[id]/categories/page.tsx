'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/registry/new-york/ui/button"
import { useToast } from "@/registry/new-york/hooks/use-toast"
import {
  Plus,
  Folder,
  Search,
  X,
  ArrowLeft,
  List,
  Pencil,
  Trash,
  ChevronsUp,
  ChevronsDown
} from 'lucide-react'
import { NavigationItem, NavigationCategory } from '@/types/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/registry/new-york/ui/dialog"
import { AddCategoryForm } from '../../components/AddCategoryForm'
import { Input } from "@/registry/new-york/ui/input"
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

import { Badge } from "@/registry/new-york/ui/badge"
import { Skeleton } from "@/registry/new-york/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york/ui/select"

export default function CategoriesPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [navigation, setNavigation] = useState<NavigationItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingCategory, setEditingCategory] = useState<{ index: number; category: NavigationCategory } | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<{ index: number; category: NavigationCategory } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all')

  useEffect(() => {
    if (!params?.id) {
      router.push('/admin/navigation')
      return
    }
    fetchNavigation()
  }, [params?.id])

  const fetchNavigation = async () => {
    if (!params?.id) {
      throw new Error('Navigation ID not found')
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/navigation/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setNavigation(data)
    } catch (error) {
      toast({
        title: "错误",
        description: "加载数据失败",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addCategory = async (values: {
    title: string,
    icon: string,
    description?: string,
    enabled: boolean
  }) => {
    if (!params?.id || !navigation) return

    try {
      const newCategory: NavigationCategory = {
        id: crypto.randomUUID(),
        title: values.title,
        icon: values.icon,
        description: values.description,
        enabled: values.enabled,
        items: []
      }

      const updatedNavigation: NavigationItem = {
        ...navigation,
        subCategories: [...(navigation.subCategories || []), newCategory]
      }

      const response = await fetch(`/api/navigation/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNavigation)
      })

      if (!response.ok) throw new Error('Failed to save')

      await fetchNavigation()
      toast({
        title: "成功",
        description: "添加成功"
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "保存失败",
        variant: "destructive"
      })
    }
  }

  const editCategory = async (values: {
    title: string,
    icon: string,
    description?: string,
    enabled: boolean
  }) => {
    if (!params?.id || !navigation || !editingCategory) return

    try {
      const updatedCategories = navigation.subCategories?.map((cat, index) =>
        index === editingCategory.index
          ? {
            ...cat,
            title: values.title,
            icon: values.icon,
            description: values.description,
            enabled: values.enabled
          }
          : cat
      ) || []

      const updatedNavigation: NavigationItem = {
        ...navigation,
        subCategories: updatedCategories
      }

      const response = await fetch(`/api/navigation/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNavigation)
      })

      if (!response.ok) throw new Error('Failed to save')

      const updatedData = await response.json()
      setNavigation(updatedData)
      setEditingCategory(null)

      toast({
        title: "成功",
        description: "更新成功"
      })
    } catch (error) {
      toast({
        title: "错误",
        description: "保存失败",
        variant: "destructive"
      })
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!params?.id) {
      throw new Error('Navigation ID not found')
    }

    try {
      const response = await fetch(`/api/navigation/${params.id}/categories`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId })
      })

      if (!response.ok) throw new Error('Failed to delete')

      await fetchNavigation()
      toast({
        title: "成功",
        description: "删除成功"
      })
    } catch (error) {
      toast({
        title: "错误",
        description: "删除失败",
        variant: "destructive"
      })
    }
  }

  const moveCategory = async (fromIndex: number, toIndex: number) => {
    if (!params?.id) {
      throw new Error('Navigation ID not found')
    }

    if (!navigation?.subCategories) return

    const newCategories = [...navigation.subCategories]
    const [removed] = newCategories.splice(fromIndex, 1)
    newCategories.splice(toIndex, 0, removed)

    const updatedNavigation = {
      ...navigation,
      subCategories: newCategories
    }

    try {
      const response = await fetch(`/api/navigation/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNavigation)
      })

      if (!response.ok) throw new Error('Failed to save order')

      const updatedData = await response.json()
      setNavigation(updatedData)
    } catch (error) {
      toast({
        title: "错误",
        description: "保存顺序失败",
        variant: "destructive"
      })
    }
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result

    if (!destination || destination.index === source.index || !navigation?.subCategories) return

    moveCategory(source.index, destination.index)
  }

  const moveToTop = async (id: string) => {
    if (!params?.id) {
      throw new Error('Navigation ID not found')
    }

    if (!navigation?.subCategories) return
    const index = navigation.subCategories.findIndex(cat => cat.id === id)
    if (index > 0) {
      moveCategory(index, 0)
    }
  }

  const moveToBottom = async (id: string) => {
    if (!params?.id) {
      throw new Error('Navigation ID not found')
    }

    if (!navigation?.subCategories) return
    const index = navigation.subCategories.findIndex(cat => cat.id === id)
    if (index < (navigation.subCategories.length - 1)) {
      moveCategory(index, navigation.subCategories.length - 1)
    }
  }



  const filteredCategories = navigation?.subCategories?.filter(category => {
    const matchesSearch = category.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all'
      ? true
      : statusFilter === 'enabled'
        ? category.enabled
        : !category.enabled
    return matchesSearch && matchesStatus
  }) || []

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
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {isLoading ? (
            <Skeleton className="h-7 w-32" />
          ) : (
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {navigation?.title || '未命名导航'}
            </h2>
          )}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索分类..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                disabled={isLoading}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1 h-7 w-7 p-0"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: 'all' | 'enabled' | 'disabled') => setStatusFilter(value)}
              disabled={isLoading}
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
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" />
              添加分类
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加分类</DialogTitle>
            </DialogHeader>
            <AddCategoryForm
              onSubmit={addCategory}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="grid gap-2">
                {filteredCategories.map((category, index) => (
                  <Draggable key={category.id} draggableId={category.id} index={index}>
                    {(provided) => (
                      <div
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        className="group relative"
                      >
                        <div
                          className="flex items-center justify-between py-2 px-4 bg-card rounded-lg border shadow-sm transition-colors hover:bg-accent/10"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                              <Folder className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium leading-none">{category.title}</span>
                                <Badge 
                                  variant={(category.enabled ?? true) ? "default" : "secondary"}
                                  className={
                                    (category.enabled ?? true)
                                      ? "text-xs bg-green-100 text-green-800 hover:bg-green-100" 
                                      : "text-xs bg-gray-100 text-gray-600 hover:bg-gray-100"
                                  }
                                >
                                  {(category.enabled ?? true) ? "已启用" : "已禁用"}
                                </Badge>
                              </div>
                              {category.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {category.description}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">
                                {category.items?.length || 0} 个项目
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {/* 置顶置底按钮 - 在hover时显示 */}
                            <div className="hidden group-hover:flex items-center gap-1 mr-2">
                              {index > 0 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => moveToTop(category.id)}
                                  title="置顶"
                                >
                                  <ChevronsUp className="h-4 w-4" />
                                </Button>
                              )}
                              {index < (navigation?.subCategories?.length || 0) - 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => moveToBottom(category.id)}
                                  title="置底"
                                >
                                  <ChevronsDown className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            {/* 常规操作按钮 */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (params?.id) {
                                  router.push(`/admin/navigation/${params.id}/categories/${category.id}/items`)
                                }
                              }}
                              title="管理子项目"
                            >
                              <List className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingCategory({ index, category })}
                              title="编辑"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingCategory({ index, category })}
                              title="删除"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {filteredCategories.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    {navigation?.subCategories?.length === 0 ? (
                      <p>暂无分类</p>
                    ) : (
                      <p>未找到匹配的分类</p>
                    )}
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑分类</DialogTitle>
          </DialogHeader>
          <AddCategoryForm
            defaultValues={{
              title: editingCategory?.category.title || '',
              icon: editingCategory?.category.icon || '',
              description: editingCategory?.category.description || '',
              enabled: editingCategory?.category.enabled ?? true
            }}
            onSubmit={editCategory}
            onCancel={() => setEditingCategory(null)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除确认</DialogTitle>
            <DialogDescription>
              确定要删除分类 &ldquo;{deletingCategory?.category.title}&rdquo; 吗？此操作无法撤销，分类下的所有项目也将被删除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeletingCategory(null)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingCategory) {
                  deleteCategory(deletingCategory.category.id)
                  setDeletingCategory(null)
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