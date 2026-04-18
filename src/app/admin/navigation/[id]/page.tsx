'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/registry/new-york/ui/button"
import { useToast } from "@/registry/new-york/hooks/use-toast"
import { NavigationItem } from '@/types/navigation'
import { Icons } from '@/components/icons'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/new-york/ui/dropdown-menu"
import { Skeleton } from "@/registry/new-york/ui/skeleton"
import { 
  MoreHorizontal, 
  Search, 
  Inbox,
  FolderTree,
  Edit,
  Trash2
} from "lucide-react"

export default function NavigationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [items, setItems] = useState<NavigationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!params?.id) {
      router.push('/admin/navigation')
      return
    }
    fetchItems()
  }, [params?.id, router])

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/navigation/${params!.id}/items`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setItems(data)
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

  const handleItemsManage = (itemId: string) => {
    router.push(`/admin/navigation/${params!.id}/items/${itemId}`)
  }

  const handleCategoryManage = (itemId: string) => {
    router.push(`/admin/navigation/${params!.id}/categories/${itemId}`)
  }

  const handleEdit = async (item: NavigationItem) => {
    try {
      const response = await fetch(`/api/navigation/${params!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })

      if (!response.ok) throw new Error('Failed to update')

      await fetchItems()
      toast({
        title: "成功",
        description: "更新成功"
      })
    } catch (error) {
      toast({
        title: "错误",
        description: "更新失败",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('确定要删除这个导航吗？')) return

    try {
      const response = await fetch(`/api/navigation/${params!.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId })
      })

      if (!response.ok) throw new Error('Failed to delete')

      await fetchItems()
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

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>标题</TableHead>
              <TableHead>子分类数</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  {searchQuery ? (
                    <div className="text-muted-foreground">
                      <Search className="mx-auto h-12 w-12 opacity-50" />
                      <p className="mt-2">没有找到匹配的导航</p>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      <Inbox className="mx-auto h-12 w-12 opacity-50" />
                      <p className="mt-2">暂无导航数据</p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.subCategories?.length || 0}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">打开菜单</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem
                          onClick={() => handleItemsManage(item.id)}
                        >
                          <Icons.list className="mr-2 h-4 w-4" />
                          子项目管理
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCategoryManage(item.id)}
                        >
                          <FolderTree className="mr-2 h-4 w-4" />
                          分类管理
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          编辑导航
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除导航
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}