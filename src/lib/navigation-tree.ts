import type { NavigationItem, NavigationCategory, NavigationSubItem } from '@/types/navigation'

export interface ItemLocation {
  categoryIndex: number
  subCategoryIndex?: number
  itemIndex: number
}

// 在整棵树里定位某个站点项;找不到返回 null。
export function findItemLocation(items: NavigationItem[], itemId: string): ItemLocation | null {
  for (let categoryIndex = 0; categoryIndex < items.length; categoryIndex++) {
    const category = items[categoryIndex]
    if (category.items) {
      const itemIndex = category.items.findIndex((it) => it.id === itemId)
      if (itemIndex !== -1) return { categoryIndex, itemIndex }
    }
    if (category.subCategories) {
      for (let subCategoryIndex = 0; subCategoryIndex < category.subCategories.length; subCategoryIndex++) {
        const sub = category.subCategories[subCategoryIndex]
        if (sub.items) {
          const itemIndex = sub.items.findIndex((it) => it.id === itemId)
          if (itemIndex !== -1) return { categoryIndex, subCategoryIndex, itemIndex }
        }
      }
    }
  }
  return null
}

// 把站点项移动到目标(一级分类,可选二级分类)。不可变:返回新数组,源=目标时原样返回。
export function moveItem(
  items: NavigationItem[],
  itemId: string,
  target: { categoryId: string; subCategoryId?: string }
): NavigationItem[] {
  const location = findItemLocation(items, itemId)
  if (!location) return items

  // 定位原始 item 对象(保留全部字段)
  const sourceCategory = items[location.categoryIndex]
  const movingItem: NavigationSubItem =
    location.subCategoryIndex !== undefined
      ? sourceCategory.subCategories![location.subCategoryIndex].items![location.itemIndex]
      : sourceCategory.items![location.itemIndex]

  const targetCategoryIndex = items.findIndex((c) => c.id === target.categoryId)
  if (targetCategoryIndex === -1) return items

  let targetSubCategoryIndex: number | undefined = undefined
  if (target.subCategoryId) {
    const idx = items[targetCategoryIndex].subCategories?.findIndex((s) => s.id === target.subCategoryId)
    if (idx === undefined || idx === -1) return items
    targetSubCategoryIndex = idx
  }

  // 源 = 目标位置 → no-op
  if (location.categoryIndex === targetCategoryIndex && location.subCategoryIndex === targetSubCategoryIndex) {
    return items
  }

  return items.map((category, categoryIndex) => {
    let next: NavigationItem = category

    // 从源位置移除
    if (categoryIndex === location.categoryIndex) {
      if (location.subCategoryIndex !== undefined) {
        next = {
          ...next,
          subCategories: next.subCategories!.map((sub, si) =>
            si === location.subCategoryIndex
              ? { ...sub, items: sub.items!.filter((_, ii) => ii !== location.itemIndex) }
              : sub
          ),
        }
      } else {
        next = { ...next, items: next.items!.filter((_, ii) => ii !== location.itemIndex) }
      }
    }

    // 插入目标位置(在移除后的 next 上继续操作,支持同一分类内移动)
    if (categoryIndex === targetCategoryIndex) {
      if (targetSubCategoryIndex !== undefined) {
        next = {
          ...next,
          subCategories: next.subCategories!.map((sub, si) =>
            si === targetSubCategoryIndex
              ? { ...sub, items: [...(sub.items ?? []), movingItem] }
              : sub
          ),
        }
      } else {
        next = { ...next, items: [...(next.items ?? []), movingItem] }
      }
    }

    return next
  })
}

// 把二级分类从当前父级移动到目标一级分类。不可变:目标=当前父级时原样返回。
export function moveSubCategory(
  items: NavigationItem[],
  subCategoryId: string,
  targetCategoryId: string
): NavigationItem[] {
  // 定位子分类及其当前父级
  let sourceCategoryIndex = -1
  let movingSub: NavigationCategory | undefined
  for (let i = 0; i < items.length; i++) {
    const idx = items[i].subCategories?.findIndex((s) => s.id === subCategoryId)
    if (idx !== undefined && idx !== -1) {
      sourceCategoryIndex = i
      movingSub = items[i].subCategories![idx]
      break
    }
  }
  if (sourceCategoryIndex === -1 || !movingSub) return items

  const targetCategoryIndex = items.findIndex((c) => c.id === targetCategoryId)
  if (targetCategoryIndex === -1) return items
  if (sourceCategoryIndex === targetCategoryIndex) return items // 同父级 → no-op

  return items.map((category, i) => {
    if (i === sourceCategoryIndex) {
      return { ...category, subCategories: category.subCategories!.filter((s) => s.id !== subCategoryId) }
    }
    if (i === targetCategoryIndex) {
      return { ...category, subCategories: [...(category.subCategories ?? []), movingSub!] }
    }
    return category
  })
}
