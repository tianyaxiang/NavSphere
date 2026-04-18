import useSWR from 'swr'
import { NavigationItem } from '@/types/navigation'

// 获取导航项的 fetcher 函数
async function fetchNavigationItems(): Promise<NavigationItem[]> {
  try {
    const res = await fetch('/api/navigation')
    if (!res.ok) {
      console.error('获取导航项失败，状态码:', res.status)
      throw new Error('获取导航项失败')
    }
    const data = await res.json()
    console.log('获取到的导航数据:', data)
    return data.navigationItems || []
  } catch (error) {
    console.error('获取导航项时发生错误:', error)
    throw error
  }
}

// 自定义 hook 用于获取导航项
export function useNavigationItems() {
  const { data: items, error, isLoading, mutate } = useSWR<NavigationItem[]>(
    '/api/navigation',
    fetchNavigationItems,
    {
      fallbackData: [],
      revalidateOnFocus: false,
      // 错误重试配置
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 1000,
      onError: (error) => {
        console.error('SWR 获取导航项错误:', error)
      }
    }
  )

  return {
    items,
    error,
    isLoading,
    mutate
  }
}
