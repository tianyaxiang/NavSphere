'use client'

export const runtime = 'edge'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/registry/new-york/ui/button"
import { useToast } from "@/registry/new-york/hooks/use-toast"
import { Icons } from "@/components/icons"
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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/new-york/ui/table"
import { Checkbox } from "@/registry/new-york/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/registry/new-york/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york/ui/select"
import { Label } from "@/registry/new-york/ui/label"
import { Textarea } from "@/registry/new-york/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/new-york/ui/tooltip"

import { NavigationSubItem } from '@/types/navigation'

interface SubCategory {
  id: string
  title: string
  icon?: string
  items: NavigationSubItem[]
}

interface Category {
  id: string
  title: string
  icon?: string
  items: NavigationSubItem[]
  subCategories?: SubCategory[]
}

interface Site {
  id: string
  name: string
  url: string
  description?: string
  createdAt: string
  updatedAt: string
}

export default function SiteListPage() {
  console.log('Component rendering')


  const { toast } = useToast()
  const [sites, setSites] = useState<Site[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSites, setSelectedSites] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const [navigationData, setNavigationData] = useState<Category[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('all')
  const [isAddingSubmitting, setIsAddingSubmitting] = useState(false)
  const [isEditingSubmitting, setIsEditingSubmitting] = useState(false)
  const [showDeleteSiteDialog, setShowDeleteSiteDialog] = useState(false)
  const [deletingSite, setDeletingSite] = useState<Site | null>(null)
  const [isUploadingAddIcon, setIsUploadingAddIcon] = useState(false)
  const [isUploadingEditIcon, setIsUploadingEditIcon] = useState(false)
  const [isBatchDeleting, setIsBatchDeleting] = useState(false)
  const [isFetchingAddMetadata, setIsFetchingAddMetadata] = useState(false)
  const [isFetchingEditMetadata, setIsFetchingEditMetadata] = useState(false)
  const lastFetchedAddUrl = useRef<string>('')
  const lastFetchedEditUrl = useRef<string>('')
  const [newSite, setNewSite] = useState({
    name: '',
    url: '',
    description: '',
    icon: '',
    categoryId: '',
    subCategoryId: ''
  })
  const [editSite, setEditSite] = useState({
    name: '',
    url: '',
    description: '',
    icon: '',
    categoryId: '',
    subCategoryId: ''
  })


  useEffect(() => {
    console.log('useEffect triggered')
    fetchSites()
  }, [])

  // 监听添加站点URL变化，自动获取网站信息
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (newSite.url &&
        isValidUrl(newSite.url) &&
        showAddDialog &&
        !isFetchingAddMetadata &&
        newSite.url !== lastFetchedAddUrl.current) {
        lastFetchedAddUrl.current = newSite.url
        fetchWebsiteMetadata(newSite.url, false, true)
      }
    }, 1000) // 延迟1秒执行，避免频繁请求

    return () => clearTimeout(timeoutId)
  }, [newSite.url, showAddDialog])

  // 监听编辑站点URL变化，自动获取网站信息
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (editSite.url &&
        isValidUrl(editSite.url) &&
        showEditDialog &&
        editingSite &&
        !isFetchingEditMetadata &&
        editSite.url !== lastFetchedEditUrl.current) {
        // 只有当URL与原始URL不同时才自动获取
        if (editSite.url !== editingSite.url) {
          lastFetchedEditUrl.current = editSite.url
          fetchWebsiteMetadata(editSite.url, true, true)
        }
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [editSite.url, showEditDialog, editingSite])



  const extractSites = (navigationItems: Category[]): Site[] => {
    let allSites: Site[] = [];

    navigationItems.forEach((category: Category) => {
      // Add sites from main category items
      if (category.items && Array.isArray(category.items)) {
        const sites: Site[] = category.items.map((item: NavigationSubItem): Site => ({
          id: item.id,
          name: item.title,
          url: item.href,
          description: item.description,
          createdAt: '',
          updatedAt: '',
        }));
        allSites = [...allSites, ...sites];
      }

      // Add sites from subcategories
      if (category.subCategories && Array.isArray(category.subCategories)) {
        category.subCategories.forEach((subCategory: SubCategory) => {
          if (subCategory.items && Array.isArray(subCategory.items)) {
            const subSites: Site[] = subCategory.items.map((item: NavigationSubItem): Site => ({
              id: item.id,
              name: item.title,
              url: item.href,
              description: item.description,
              createdAt: '',
              updatedAt: '',
            }));
            allSites = [...allSites, ...subSites];
          }
        });
      }
    });

    return allSites;
  };

  const fetchSites = async () => {
    if (!isInitialLoading) setIsLoading(true);
    try {
      console.log('Making API request');
      const response = await fetch('/api/navigation');
      console.log('API response received:', response.status);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      console.log('Received data:', data);

      // Store navigation data for category selection
      setNavigationData(data.navigationItems);

      // Extract all sites from the navigation structure
      const allSites = extractSites(data.navigationItems);
      console.log('Extracted sites:', allSites);
      setSites(allSites);
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: "错误",
        description: "获取数据失败",
        variant: "destructive"
      });
      setSites([]);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  // 获取站点所属的分类
  const getSiteCategory = (siteId: string): string => {
    for (const category of navigationData) {
      // 检查主分类的items
      if (category.items?.some(item => item.id === siteId)) {
        return category.id
      }
      // 检查子分类的items
      if (category.subCategories) {
        for (const subCategory of category.subCategories) {
          if (subCategory.items?.some(item => item.id === siteId)) {
            return category.id
          }
        }
      }
    }
    return ''
  }

  // 获取站点所属的子分类
  const getSiteSubCategory = (siteId: string): string => {
    for (const category of navigationData) {
      // 检查主分类的items - 如果在主分类中，返回空字符串表示无子分类
      if (category.items?.some(item => item.id === siteId)) {
        return ''
      }
      // 检查子分类的items
      if (category.subCategories) {
        for (const subCategory of category.subCategories) {
          if (subCategory.items?.some(item => item.id === siteId)) {
            return subCategory.id
          }
        }
      }
    }
    return ''
  }

  // 获取站点的分类信息（用于显示）
  const getSiteCategoryInfo = (siteId: string): { categoryName: string; subCategoryName: string } => {
    for (const category of navigationData) {
      // 检查主分类的items
      if (category.items?.some(item => item.id === siteId)) {
        return {
          categoryName: category.title,
          subCategoryName: ''
        }
      }
      // 检查子分类的items
      if (category.subCategories) {
        for (const subCategory of category.subCategories) {
          if (subCategory.items?.some(item => item.id === siteId)) {
            return {
              categoryName: category.title,
              subCategoryName: subCategory.title
            }
          }
        }
      }
    }
    return {
      categoryName: '',
      subCategoryName: ''
    }
  }

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || getSiteCategory(site.id) === categoryFilter

    const matchesSubCategory = subCategoryFilter === 'all' ||
      (subCategoryFilter === 'none' && getSiteSubCategory(site.id) === '') ||
      getSiteSubCategory(site.id) === subCategoryFilter

    return matchesSearch && matchesCategory && matchesSubCategory
  })

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Delete 键删除选中的站点
      if (event.key === 'Delete' && selectedSites.length > 0 && !showDeleteDialog) {
        event.preventDefault()
        setShowDeleteDialog(true)
      }
      // Escape 键取消选择
      if (event.key === 'Escape' && selectedSites.length > 0) {
        event.preventDefault()
        setSelectedSites([])
      }
      // Ctrl+A 处理
      if (event.ctrlKey && event.key === 'a') {
        const activeElement = document.activeElement
        const isInputFocused = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.hasAttribute('contenteditable')
        )

        // 如果有弹窗打开或者输入框有焦点，让浏览器处理默认行为（选中输入框内容）
        if (showAddDialog || showEditDialog || isInputFocused) {
          return // 不阻止默认行为，让输入框正常选中内容
        }

        // 只有在主列表区域且有站点时才全选站点
        if (filteredSites.length > 0) {
          event.preventDefault()
          setSelectedSites(filteredSites.map(site => site.id))
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedSites, showDeleteDialog, filteredSites, showAddDialog, showEditDialog])

  const handleSelectAll = (checked: boolean | string) => {
    if (checked === true) {
      setSelectedSites(filteredSites.map(site => site.id))
    } else {
      setSelectedSites([])
    }
  }

  const handleSelectOne = (checked: boolean | string, siteId: string) => {
    if (checked === true) {
      setSelectedSites([...selectedSites, siteId])
    } else {
      setSelectedSites(selectedSites.filter(id => id !== siteId))
    }
  }

  const handleBatchDelete = async () => {
    if (isBatchDeleting) return

    setIsBatchDeleting(true)
    try {
      // Create a copy of navigation data
      const updatedNavigationData = [...navigationData]

      // Remove all selected sites from the navigation structure
      for (const siteId of selectedSites) {
        let found = false

        for (let categoryIndex = 0; categoryIndex < updatedNavigationData.length; categoryIndex++) {
          const category = updatedNavigationData[categoryIndex]

          // Check main category items
          if (category.items) {
            const itemIndex = category.items.findIndex(item => item.id === siteId)
            if (itemIndex !== -1) {
              updatedNavigationData[categoryIndex].items!.splice(itemIndex, 1)
              found = true
              break
            }
          }

          // Check subcategory items
          if (category.subCategories && !found) {
            for (let subIndex = 0; subIndex < category.subCategories.length; subIndex++) {
              const subCategory = category.subCategories[subIndex]
              if (subCategory.items) {
                const itemIndex = subCategory.items.findIndex(item => item.id === siteId)
                if (itemIndex !== -1) {
                  updatedNavigationData[categoryIndex].subCategories![subIndex].items.splice(itemIndex, 1)
                  found = true
                  break
                }
              }
            }
          }

          if (found) break
        }
      }

      // Save to API
      const response = await fetch('/api/navigation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          navigationItems: updatedNavigationData
        }),
      })

      if (!response.ok) throw new Error('Failed to save')

      toast({
        title: "成功",
        description: `已删除选中的 ${selectedSites.length} 个站点`,
      })

      // Refresh the sites list
      fetchSites()
      setSelectedSites([])
    } catch (error) {
      console.error('Batch delete error:', error)
      toast({
        title: "错误",
        description: "批量删除失败",
        variant: "destructive"
      })
    } finally {
      setIsBatchDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleAddSite = async () => {
    // 防止重复提交
    if (isAddingSubmitting) {
      return
    }

    if (!newSite.name || !newSite.url || !newSite.categoryId) {
      toast({
        title: "错误",
        description: "请填写必填字段",
        variant: "destructive"
      })
      return
    }

    setIsAddingSubmitting(true)
    try {
      // Create a copy of navigation data
      const updatedNavigationData = [...navigationData]

      // Find the target category
      const categoryIndex = updatedNavigationData.findIndex(cat => cat.id === newSite.categoryId)
      if (categoryIndex === -1) {
        throw new Error('Category not found')
      }

      const newItem: NavigationSubItem = {
        id: `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: newSite.name,
        href: newSite.url,
        description: newSite.description,
        icon: newSite.icon,
        enabled: true
      }

      // Add to subcategory if specified, otherwise add to main category
      if (newSite.subCategoryId) {
        const subCategoryIndex = updatedNavigationData[categoryIndex].subCategories?.findIndex(
          sub => sub.id === newSite.subCategoryId
        )
        if (subCategoryIndex !== undefined && subCategoryIndex !== -1) {
          if (!updatedNavigationData[categoryIndex].subCategories![subCategoryIndex].items) {
            updatedNavigationData[categoryIndex].subCategories![subCategoryIndex].items = []
          }
          updatedNavigationData[categoryIndex].subCategories![subCategoryIndex].items.push(newItem)
        }
      } else {
        if (!updatedNavigationData[categoryIndex].items) {
          updatedNavigationData[categoryIndex].items = []
        }
        updatedNavigationData[categoryIndex].items.push(newItem)
      }

      // Save to API
      const response = await fetch('/api/navigation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          navigationItems: updatedNavigationData
        }),
      })

      if (!response.ok) throw new Error('Failed to save')

      toast({
        title: "成功",
        description: "站点添加成功",
      })

      // Reset form and close dialog
      setNewSite({
        name: '',
        url: '',
        description: '',
        icon: '',
        categoryId: '',
        subCategoryId: ''
      })
      setShowAddDialog(false)

      // Refresh the sites list
      fetchSites()
    } catch (error) {
      console.error('Add site error:', error)
      toast({
        title: "错误",
        description: "添加站点失败",
        variant: "destructive"
      })
    } finally {
      setIsAddingSubmitting(false)
    }
  }

  const handleEditSite = async () => {
    // 防止重复提交
    if (isEditingSubmitting) {
      return
    }

    if (!editSite.name || !editSite.url || !editSite.categoryId || !editingSite) {
      toast({
        title: "错误",
        description: "请填写必填字段",
        variant: "destructive"
      })
      return
    }

    setIsEditingSubmitting(true)
    try {
      // Create a copy of navigation data
      const updatedNavigationData = [...navigationData]

      // Create updated item
      const updatedItem: NavigationSubItem = {
        id: editingSite.id,
        title: editSite.name,
        href: editSite.url,
        description: editSite.description,
        icon: editSite.icon,
        enabled: true
      }

      // Find current location and target location
      let currentLocation: { categoryIndex: number; subCategoryIndex?: number; itemIndex: number } | null = null
      let targetLocation: { categoryIndex: number; subCategoryIndex?: number } | null = null

      // Find current location
      for (let categoryIndex = 0; categoryIndex < updatedNavigationData.length; categoryIndex++) {
        const category = updatedNavigationData[categoryIndex]

        // Check main category items
        if (category.items) {
          const itemIndex = category.items.findIndex(item => item.id === editingSite.id)
          if (itemIndex !== -1) {
            currentLocation = { categoryIndex, itemIndex }
            break
          }
        }

        // Check subcategory items
        if (category.subCategories) {
          for (let subIndex = 0; subIndex < category.subCategories.length; subIndex++) {
            const subCategory = category.subCategories[subIndex]
            if (subCategory.items) {
              const itemIndex = subCategory.items.findIndex(item => item.id === editingSite.id)
              if (itemIndex !== -1) {
                currentLocation = { categoryIndex, subCategoryIndex: subIndex, itemIndex }
                break
              }
            }
          }
          if (currentLocation) break
        }
      }

      // Find target location
      const targetCategoryIndex = updatedNavigationData.findIndex(cat => cat.id === editSite.categoryId)
      if (targetCategoryIndex === -1) {
        throw new Error('Target category not found')
      }

      if (editSite.subCategoryId && editSite.subCategoryId !== "none") {
        const targetSubCategoryIndex = updatedNavigationData[targetCategoryIndex].subCategories?.findIndex(
          sub => sub.id === editSite.subCategoryId
        )
        if (targetSubCategoryIndex !== undefined && targetSubCategoryIndex !== -1) {
          targetLocation = { categoryIndex: targetCategoryIndex, subCategoryIndex: targetSubCategoryIndex }
        }
      } else {
        targetLocation = { categoryIndex: targetCategoryIndex }
      }

      if (!currentLocation || !targetLocation) {
        throw new Error('Could not find current or target location')
      }

      // Check if location changed
      const locationChanged =
        currentLocation.categoryIndex !== targetLocation.categoryIndex ||
        currentLocation.subCategoryIndex !== targetLocation.subCategoryIndex

      if (locationChanged) {
        // Remove from current location
        if (currentLocation.subCategoryIndex !== undefined) {
          updatedNavigationData[currentLocation.categoryIndex].subCategories![currentLocation.subCategoryIndex].items.splice(currentLocation.itemIndex, 1)
        } else {
          updatedNavigationData[currentLocation.categoryIndex].items!.splice(currentLocation.itemIndex, 1)
        }

        // Add to target location
        if (targetLocation.subCategoryIndex !== undefined) {
          if (!updatedNavigationData[targetLocation.categoryIndex].subCategories![targetLocation.subCategoryIndex].items) {
            updatedNavigationData[targetLocation.categoryIndex].subCategories![targetLocation.subCategoryIndex].items = []
          }
          updatedNavigationData[targetLocation.categoryIndex].subCategories![targetLocation.subCategoryIndex].items.push(updatedItem)
        } else {
          if (!updatedNavigationData[targetLocation.categoryIndex].items) {
            updatedNavigationData[targetLocation.categoryIndex].items = []
          }
          updatedNavigationData[targetLocation.categoryIndex].items.push(updatedItem)
        }
      } else {
        // Update in place (same location)
        if (currentLocation.subCategoryIndex !== undefined) {
          updatedNavigationData[currentLocation.categoryIndex].subCategories![currentLocation.subCategoryIndex].items[currentLocation.itemIndex] = updatedItem
        } else {
          updatedNavigationData[currentLocation.categoryIndex].items![currentLocation.itemIndex] = updatedItem
        }
      }

      // Save to API
      const response = await fetch('/api/navigation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          navigationItems: updatedNavigationData
        }),
      })

      if (!response.ok) throw new Error('Failed to save')

      toast({
        title: "成功",
        description: "站点更新成功",
      })

      // Reset form and close dialog
      setEditSite({
        name: '',
        url: '',
        description: '',
        icon: '',
        categoryId: '',
        subCategoryId: ''
      })
      setEditingSite(null)
      setShowEditDialog(false)

      // Refresh the sites list
      fetchSites()
    } catch (error) {
      console.error('Edit site error:', error)
      toast({
        title: "错误",
        description: "更新站点失败",
        variant: "destructive"
      })
    } finally {
      setIsEditingSubmitting(false)
    }
  }

  const openEditDialog = (site: Site) => {
    setEditingSite(site)

    // Find the category and subcategory for this site, and get the icon
    let categoryId = ''
    let subCategoryId = ''
    let icon = ''

    for (const category of navigationData) {
      // Check main category items
      const mainItem = category.items?.find(item => item.id === site.id)
      if (mainItem) {
        categoryId = category.id
        icon = mainItem.icon || ''
        break
      }
      // Check subcategory items
      if (category.subCategories) {
        for (const subCategory of category.subCategories) {
          const subItem = subCategory.items?.find(item => item.id === site.id)
          if (subItem) {
            categoryId = category.id
            subCategoryId = subCategory.id
            icon = subItem.icon || ''
            break
          }
        }
        if (categoryId) break
      }
    }

    setEditSite({
      name: site.name,
      url: site.url,
      description: site.description || '',
      icon: icon,
      categoryId,
      subCategoryId
    })
    setShowEditDialog(true)
  }

  const handleDeleteSite = async () => {
    if (!deletingSite) return

    try {
      // Create a copy of navigation data
      const updatedNavigationData = [...navigationData]

      // Find and remove the site
      let found = false
      for (let categoryIndex = 0; categoryIndex < updatedNavigationData.length; categoryIndex++) {
        const category = updatedNavigationData[categoryIndex]

        // Check main category items
        if (category.items) {
          const itemIndex = category.items.findIndex(item => item.id === deletingSite.id)
          if (itemIndex !== -1) {
            updatedNavigationData[categoryIndex].items!.splice(itemIndex, 1)
            found = true
            break
          }
        }

        // Check subcategory items
        if (category.subCategories && !found) {
          for (let subIndex = 0; subIndex < category.subCategories.length; subIndex++) {
            const subCategory = category.subCategories[subIndex]
            if (subCategory.items) {
              const itemIndex = subCategory.items.findIndex(item => item.id === deletingSite.id)
              if (itemIndex !== -1) {
                updatedNavigationData[categoryIndex].subCategories![subIndex].items.splice(itemIndex, 1)
                found = true
                break
              }
            }
          }
        }

        if (found) break
      }

      if (!found) {
        throw new Error('Site not found')
      }

      // Save to API
      const response = await fetch('/api/navigation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          navigationItems: updatedNavigationData
        }),
      })

      if (!response.ok) throw new Error('Failed to save')

      toast({
        title: "成功",
        description: "站点删除成功",
      })

      // Close dialog and refresh
      setShowDeleteSiteDialog(false)
      setDeletingSite(null)
      fetchSites()
    } catch (error) {
      console.error('Delete site error:', error)
      toast({
        title: "错误",
        description: "删除站点失败",
        variant: "destructive"
      })
    }
  }

  const openDeleteDialog = (site: Site) => {
    setDeletingSite(site)
    setShowDeleteSiteDialog(true)
  }

  // 描述显示组件
  const DescriptionCell = ({ description }: { description?: string }) => {
    if (!description) return <span className="text-muted-foreground">-</span>

    const maxLength = 50
    const isLong = description.length > maxLength
    const truncated = isLong ? description.substring(0, maxLength) + '...' : description

    if (!isLong) {
      return <span className="text-sm">{description}</span>
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-sm cursor-help hover:text-primary transition-colors">
            {truncated}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="whitespace-pre-wrap">{description}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const fetchWebsiteMetadata = async (url: string, isEdit: boolean = false, forceUpdate: boolean = false) => {
    const setFetching = isEdit ? setIsFetchingEditMetadata : setIsFetchingAddMetadata
    const setSite = isEdit ? setEditSite : setNewSite
    const site = isEdit ? editSite : newSite

    const isFetching = isEdit ? isFetchingEditMetadata : isFetchingAddMetadata
    if (isFetching) return

    setFetching(true)
    try {
      const response = await fetch('/api/website-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error('获取网站信息失败')
      }

      const metadata = await response.json()

      // 根据forceUpdate决定是否覆盖已有信息
      const updates: any = {}
      if (forceUpdate || !site.name) {
        updates.name = metadata.title
      }
      if (forceUpdate || !site.description) {
        updates.description = metadata.description
      }
      if ((forceUpdate || !site.icon) && metadata.icon) {
        updates.icon = metadata.icon
      }

      if (Object.keys(updates).length > 0) {
        setSite({ ...site, ...updates })
        toast({
          title: "成功",
          description: "已自动获取网站信息"
        })
      } else {
        toast({
          title: "提示",
          description: "网站信息已是最新，无需更新"
        })
      }
    } catch (error) {
      console.error('Failed to fetch website metadata:', error)
      toast({
        title: "提示",
        description: "自动获取网站信息失败，请手动填写",
        variant: "destructive"
      })
    }

    // 确保在所有操作完成后设置loading状态为false
    // 使用setTimeout确保状态更新不被批处理影响
    setTimeout(() => {
      setFetching(false)
    }, 0)
  }

  const handleIconUpload = async (file: File, isEdit: boolean = false) => {
    const setUploading = isEdit ? setIsUploadingEditIcon : setIsUploadingAddIcon
    const setSite = isEdit ? setEditSite : setNewSite
    const site = isEdit ? editSite : newSite

    try {
      setUploading(true)

      // 将文件转换为 base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const response = await fetch('/api/resource', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64
        }),
      })

      if (!response.ok) {
        throw new Error(`上传失败: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.imageUrl) {
        setSite({ ...site, icon: data.imageUrl })
        toast({
          title: "成功",
          description: "图标上传成功",
        })
      } else {
        throw new Error('未获取到上传后的图片URL')
      }

    } catch (error) {
      console.error('上传失败:', error)
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : '上传失败，请重试',
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">
                共 {sites.length} 个站点
                {filteredSites.length !== sites.length && (
                  <span>，显示 {filteredSites.length} 个</span>
                )}
              </span>
            </div>
            <div className="flex gap-4">
              <div className="relative max-w-sm">
                <Input
                  placeholder="搜索站点..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-8"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                    onClick={() => setSearchQuery('')}
                  >
                    <Icons.x className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Select
                value={categoryFilter}
                onValueChange={(value) => {
                  setCategoryFilter(value)
                  setSubCategoryFilter('all') // 重置子分类筛选
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="按分类筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {navigationData.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* 子分类筛选器 */}
              <Select
                value={subCategoryFilter}
                onValueChange={setSubCategoryFilter}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="按子分类筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部子分类</SelectItem>
                  <SelectItem value="none">无子分类</SelectItem>
                  {categoryFilter !== 'all' &&
                    navigationData
                      .find(cat => cat.id === categoryFilter)
                      ?.subCategories?.map((subCategory) => (
                        <SelectItem key={subCategory.id} value={subCategory.id}>
                          {subCategory.title}
                        </SelectItem>
                      ))
                  }
                  {categoryFilter === 'all' &&
                    navigationData
                      .flatMap(cat => cat.subCategories || [])
                      .map((subCategory) => (
                        <SelectItem key={subCategory.id} value={subCategory.id}>
                          {subCategory.title}
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {selectedSites.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="whitespace-nowrap"
                disabled={isBatchDeleting}
              >
                {isBatchDeleting ? (
                  <>
                    <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
                    删除中...
                  </>
                ) : (
                  <>
                    <Icons.trash className="mr-2 h-4 w-4" />
                    删除选中 ({selectedSites.length})
                  </>
                )}
              </Button>
            )}

            <Dialog open={showAddDialog} onOpenChange={(open) => {
              if (open) {
                // 重置表单
                setNewSite({
                  name: '',
                  url: '',
                  description: '',
                  icon: '',
                  categoryId: '',
                  subCategoryId: ''
                })
                lastFetchedAddUrl.current = ''
                setShowAddDialog(true)
              } else if (!isAddingSubmitting) {
                setShowAddDialog(false)
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Icons.plus className="mr-2 h-4 w-4" />
                  添加站点
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>添加站点</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="url">站点链接 *</Label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Input
                          id="url"
                          value={newSite.url}
                          onChange={(e) => setNewSite({ ...newSite, url: e.target.value })}
                          placeholder="输入网站链接，将自动获取网站信息"
                          disabled={isAddingSubmitting}
                        />
                        {isFetchingAddMetadata && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Icons.loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!newSite.url || !isValidUrl(newSite.url) || isFetchingAddMetadata || isAddingSubmitting}
                        onClick={() => fetchWebsiteMetadata(newSite.url, false, true)}
                      >
                        {isFetchingAddMetadata ? (
                          <Icons.loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Icons.refresh className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      输入完整的网站链接后，系统将自动获取网站标题、描述和图标
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">站点名称 *</Label>
                    <Input
                      id="name"
                      value={newSite.name}
                      onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                      placeholder="站点名称（可自动获取）"
                      disabled={isAddingSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="icon">站点图标</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <Input
                          id="icon"
                          value={newSite.icon}
                          onChange={(e) => setNewSite({ ...newSite, icon: e.target.value })}
                          placeholder="图标URL（可自动获取）"
                          disabled={isAddingSubmitting}
                        />
                        {newSite.icon && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <img
                              src={newSite.icon}
                              alt="图标预览"
                              className="w-4 h-4 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="relative"
                        disabled={isAddingSubmitting || isUploadingAddIcon}
                        onClick={() => {
                          const fileInput = document.getElementById('add-icon-upload')
                          fileInput?.click()
                        }}
                      >
                        {isUploadingAddIcon ? (
                          <>
                            <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
                            上传中...
                          </>
                        ) : (
                          <>
                            <Icons.upload className="mr-2 h-4 w-4" />
                            上传图片
                          </>
                        )}
                        <input
                          id="add-icon-upload"
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              await handleIconUpload(file, false)
                              // 清空文件输入
                              const fileInput = document.getElementById('add-icon-upload') as HTMLInputElement
                              if (fileInput) {
                                fileInput.value = ''
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      系统会自动获取网站图标，也可手动输入URL或上传本地图片
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">分类 *</Label>
                    <Select
                      value={newSite.categoryId}
                      onValueChange={(value) => {
                        setNewSite({ ...newSite, categoryId: value, subCategoryId: '' })
                      }}
                      disabled={isAddingSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        {navigationData.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {newSite.categoryId && navigationData.find(cat => cat.id === newSite.categoryId)?.subCategories && (
                    <div className="grid gap-2">
                      <Label htmlFor="subcategory">子分类</Label>
                      <Select
                        value={newSite.subCategoryId || "none"}
                        onValueChange={(value) => setNewSite({ ...newSite, subCategoryId: value === "none" ? "" : value })}
                        disabled={isAddingSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择子分类（可选）" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">无子分类</SelectItem>
                          {navigationData
                            .find(cat => cat.id === newSite.categoryId)
                            ?.subCategories?.map((subCategory) => (
                              <SelectItem key={subCategory.id} value={subCategory.id}>
                                {subCategory.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="description">描述</Label>
                    <Textarea
                      id="description"
                      value={newSite.description}
                      onChange={(e) => setNewSite({ ...newSite, description: e.target.value })}
                      placeholder="输入站点描述（可选）"
                      className="resize-none"
                      disabled={isAddingSubmitting}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                    disabled={isAddingSubmitting}
                  >
                    取消
                  </Button>
                  <Button onClick={handleAddSite} disabled={isAddingSubmitting}>
                    {isAddingSubmitting && (
                      <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isAddingSubmitting ? "添加中..." : "添加站点"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* 编辑站点对话框 */}
            <Dialog open={showEditDialog} onOpenChange={(open) => {
              if (!open && !isEditingSubmitting) {
                setShowEditDialog(false)
              }
            }}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>编辑站点</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-url">站点链接 *</Label>
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Input
                          id="edit-url"
                          value={editSite.url}
                          onChange={(e) => setEditSite({ ...editSite, url: e.target.value })}
                          placeholder="输入网站链接，将自动获取网站信息"
                          disabled={isEditingSubmitting}
                        />
                        {isFetchingEditMetadata && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Icons.loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!editSite.url || !isValidUrl(editSite.url) || isFetchingEditMetadata || isEditingSubmitting}
                        onClick={() => fetchWebsiteMetadata(editSite.url, true, true)}
                      >
                        {isFetchingEditMetadata ? (
                          <Icons.loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Icons.refresh className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      输入完整的网站链接后，系统将自动获取网站标题、描述和图标
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">站点名称 *</Label>
                    <Input
                      id="edit-name"
                      value={editSite.name}
                      onChange={(e) => setEditSite({ ...editSite, name: e.target.value })}
                      placeholder="站点名称（可自动获取）"
                      disabled={isEditingSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-icon">站点图标</Label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <Input
                          id="edit-icon"
                          value={editSite.icon}
                          onChange={(e) => setEditSite({ ...editSite, icon: e.target.value })}
                          placeholder="图标URL（可自动获取）"
                          disabled={isEditingSubmitting}
                        />
                        {editSite.icon && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <img
                              src={editSite.icon}
                              alt="图标预览"
                              className="w-4 h-4 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="relative"
                        disabled={isEditingSubmitting || isUploadingEditIcon}
                        onClick={() => {
                          const fileInput = document.getElementById('edit-icon-upload')
                          fileInput?.click()
                        }}
                      >
                        {isUploadingEditIcon ? (
                          <>
                            <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
                            上传中...
                          </>
                        ) : (
                          <>
                            <Icons.upload className="mr-2 h-4 w-4" />
                            上传图片
                          </>
                        )}
                        <input
                          id="edit-icon-upload"
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              await handleIconUpload(file, true)
                              // 清空文件输入
                              const fileInput = document.getElementById('edit-icon-upload') as HTMLInputElement
                              if (fileInput) {
                                fileInput.value = ''
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      系统会自动获取网站图标，也可手动输入URL或上传本地图片
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-category">分类 *</Label>
                    <Select
                      value={editSite.categoryId}
                      onValueChange={(value) => {
                        setEditSite({ ...editSite, categoryId: value, subCategoryId: '' })
                      }}
                      disabled={isEditingSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        {navigationData.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {editSite.categoryId && navigationData.find(cat => cat.id === editSite.categoryId)?.subCategories && (
                    <div className="grid gap-2">
                      <Label htmlFor="edit-subcategory">子分类</Label>
                      <Select
                        value={editSite.subCategoryId || "none"}
                        onValueChange={(value) => setEditSite({ ...editSite, subCategoryId: value === "none" ? "" : value })}
                        disabled={isEditingSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择子分类（可选）" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">无子分类</SelectItem>
                          {navigationData
                            .find(cat => cat.id === editSite.categoryId)
                            ?.subCategories?.map((subCategory) => (
                              <SelectItem key={subCategory.id} value={subCategory.id}>
                                {subCategory.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">描述</Label>
                    <Textarea
                      id="edit-description"
                      value={editSite.description}
                      onChange={(e) => setEditSite({ ...editSite, description: e.target.value })}
                      placeholder="输入站点描述（可选）"
                      className="resize-none"
                      disabled={isEditingSubmitting}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditDialog(false)}
                    disabled={isEditingSubmitting}
                  >
                    取消
                  </Button>
                  <Button onClick={handleEditSite} disabled={isEditingSubmitting}>
                    {isEditingSubmitting && (
                      <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isEditingSubmitting ? "更新中..." : "更新站点"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>



        {/* 选择状态栏 */}
        {selectedSites.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Icons.check className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                已选择 {selectedSites.length} 个站点
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSites([])}
                className="text-blue-600 border-blue-200 hover:bg-blue-100"
              >
                取消选择
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isBatchDeleting}
              >
                {isBatchDeleting ? (
                  <>
                    <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
                    删除中...
                  </>
                ) : (
                  <>
                    <Icons.trash className="mr-2 h-4 w-4" />
                    批量删除
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {isInitialLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Icons.loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : isLoading ? (
          <div className="opacity-50 pointer-events-none">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          filteredSites.length > 0 &&
                          selectedSites.length === filteredSites.length
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="w-[200px]">名称</TableHead>
                    <TableHead className="w-[250px]">链接</TableHead>
                    <TableHead className="w-[120px]">一级分类</TableHead>
                    <TableHead className="w-[120px]">二级分类</TableHead>
                    <TableHead className="w-[200px]">描述</TableHead>
                    <TableHead className="w-[120px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSites.map((site) => (
                    <TableRow key={site.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedSites.includes(site.id)}
                          onCheckedChange={(checked) => handleSelectOne(checked, site.id)}
                          aria-label={`Select ${site.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getSiteCategoryInfo(site.id).categoryName && (
                            <div className="w-2 h-2 rounded-full bg-primary/20"></div>
                          )}
                          <span className="truncate">{site.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={site.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 hover:underline text-sm truncate block max-w-[230px]"
                          title={site.url}
                        >
                          {site.url}
                        </a>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {getSiteCategoryInfo(site.id).categoryName || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getSiteCategoryInfo(site.id).subCategoryName ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {getSiteCategoryInfo(site.id).subCategoryName}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DescriptionCell description={site.description} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(site)}
                            title="编辑"
                          >
                            <Icons.pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => openDeleteDialog(site)}
                            title="删除"
                          >
                            <Icons.trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : filteredSites.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        filteredSites.length > 0 &&
                        selectedSites.length === filteredSites.length
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="w-[200px]">名称</TableHead>
                  <TableHead className="w-[250px]">链接</TableHead>
                  <TableHead className="w-[120px]">一级分类</TableHead>
                  <TableHead className="w-[120px]">二级分类</TableHead>
                  <TableHead className="w-[200px]">描述</TableHead>
                  <TableHead className="w-[120px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedSites.includes(site.id)}
                        onCheckedChange={(checked) => handleSelectOne(checked, site.id)}
                        aria-label={`Select ${site.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getSiteCategoryInfo(site.id).categoryName && (
                          <div className="w-2 h-2 rounded-full bg-primary/20"></div>
                        )}
                        <span className="truncate">{site.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 hover:underline text-sm truncate block max-w-[230px]"
                        title={site.url}
                      >
                        {site.url}
                      </a>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {getSiteCategoryInfo(site.id).categoryName || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getSiteCategoryInfo(site.id).subCategoryName ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {getSiteCategoryInfo(site.id).subCategoryName}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DescriptionCell description={site.description} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(site)}
                          title="编辑"
                        >
                          <Icons.pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => openDeleteDialog(site)}
                          title="删除"
                        >
                          <Icons.trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Icons.search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {sites.length === 0 ? "暂无站点" : "未找到匹配的站点"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {sites.length === 0
                ? "开始添加您的第一个站点吧"
                : "尝试调整搜索条件或筛选器"
              }
            </p>
            {sites.length === 0 && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Icons.plus className="mr-2 h-4 w-4" />
                添加站点
              </Button>
            )}
            {sites.length > 0 && filteredSites.length === 0 && (
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setCategoryFilter('all')
                    setSubCategoryFilter('all')
                  }}
                >
                  清除筛选
                </Button>
              </div>
            )}
          </div>
        )}

        <AlertDialog open={showDeleteDialog} onOpenChange={(open) => {
          if (!open && !isBatchDeleting) {
            setShowDeleteDialog(false)
          }
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除选中的 {selectedSites.length} 个站点吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isBatchDeleting}>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBatchDelete}
                disabled={isBatchDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isBatchDeleting ? (
                  <>
                    <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
                    删除中...
                  </>
                ) : (
                  '删除'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 删除单个站点对话框 */}
        <AlertDialog open={showDeleteSiteDialog} onOpenChange={setShowDeleteSiteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除站点</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除站点 &ldquo;{deletingSite?.name}&rdquo; 吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSite}
                className="bg-red-600 hover:bg-red-700"
              >
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
} 