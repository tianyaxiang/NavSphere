'use client'
export const runtime = 'edge'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Menu, Database, Folders, FolderTree, Globe, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  // 添加状态来存储统计数据
  const [stats, setStats] = useState({
    parentCategories: 0,
    subCategories: 0,
    totalCategories: 0,
    totalSites: 0,
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 获取统计数据
  const fetchStats = async (showLoading = false) => {
    try {
      if (showLoading) setIsRefreshing(true)
      console.log('Fetching stats...')
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      console.log('Received stats:', data)
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      if (showLoading) setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  // 页面获得焦点时刷新统计数据
  useEffect(() => {
    const handleFocus = () => {
      fetchStats()
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // 统计卡片数据
  const statsItems = [
    {
      title: '分类总数',
      value: stats.totalCategories,
      icon: Database,
      description: '所有分类数量'
    },
    {
      title: '一级分类数量',
      value: stats.parentCategories,
      icon: Folders,
      description: '网站一级分类总数'
    },
    {
      title: '二级分类数量',
      value: stats.subCategories,
      icon: FolderTree,
      description: '网站二级分类总数'
    },
    {
      title: '站点总数',
      value: stats.totalSites,
      icon: Globe,
      description: '收录的网站总数'
    },
  ]

  const dashboardItems = [
    {
      title: '站点设置',
      icon: Settings,
      href: '/admin/site',
      description: '管理网站的基本信息，如标题、描述、Logo等'
    },
    {
      title: '导航管理',
      icon: Menu,
      href: '/admin/navigation',
      description: '管理网站的导航菜单分类和子项目'
    },
    {
      title: '资源管理',
      icon: Database,
      href: '/admin/resources',
      description: '管理网站的资源内容和分类'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">控制台</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchStats(true)}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          刷新统计
        </Button>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsItems.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 原有的功能卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dashboardItems.map(item => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center space-x-4">
                <item.icon className="w-8 h-8 text-muted-foreground" />
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
} 