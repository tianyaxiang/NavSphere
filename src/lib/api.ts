import { NavigationItem } from '@/types/navigation'

// 删除导航
export async function deleteNavigation(id: string) {
  try {
    const response = await fetch(`/api/navigation/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '删除导航失败')
    }

    return await response.json()
  } catch (error) {
    console.error('删除导航错误:', error)
    throw error
  }
}

// 更新导航
export async function updateNavigation(id: string, data: Partial<NavigationItem>) {
  try {
    const response = await fetch(`/api/navigation/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '更新导航失败')
    }

    return await response.json()
  } catch (error) {
    console.error('更新导航错误:', error)
    throw error
  }
}

// 更新导航顺序
export async function updateNavigationOrder(items: NavigationItem[]) {
  try {
    const response = await fetch('/api/navigation/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(items)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '更新导航顺序失败')
    }

    return await response.json()
  } catch (error) {
    console.error('更新导航顺序错误:', error)
    throw error
  }
}
