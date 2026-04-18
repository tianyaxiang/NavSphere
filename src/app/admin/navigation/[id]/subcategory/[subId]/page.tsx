'use client'
export const runtime = 'edge'

import * as React from "react"
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { NavigationItem, NavigationSubItem } from '@/types/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function SubCategoryItemsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [category, setCategory] = useState<NavigationItem | null>(null)
  const [subCategory, setSubCategory] = useState<NavigationSubItem | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      if (!params?.id) {
        throw new Error('Navigation ID not found')
      }

      const navigationId = Array.isArray(params.id) ? params.id[0] : params.id
      const response = await fetch(`/api/navigation/${navigationId}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setCategory(data)
      
      const sub = data.subCategories?.find((s: NavigationSubItem) => String(s.id) === params.subId)
      if (sub) {
        setSubCategory(sub)
      } else {
        throw new Error('Subcategory not found')
      }
    } catch (error) {
      toast({
        title: '错误',
        description: '加载数据失败',
        variant: 'destructive'
      })
      router.back()
    }
  }

  // ... 添加其他必要的函数

  if (!category || !subCategory) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">
            {category.title} - {subCategory.title} - 子项目管理
          </h3>
          <p className="text-sm text-muted-foreground">
            管理子分类的子项目
          </p>
        </div>
        {/* ... 添加操作按钮 */}
      </div>

      {/* ... 添加表格和其他内容 */}
    </div>
  )
} 