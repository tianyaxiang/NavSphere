import assert from 'node:assert'
import { findItemLocation, moveItem, moveSubCategory } from '../src/lib/navigation-tree'
import type { NavigationItem } from '../src/types/navigation'

function makeTree(): NavigationItem[] {
  return [
    {
      id: 'c1',
      title: 'Cat 1',
      items: [
        { id: 's1', title: 'Site 1', href: 'https://a.com', enabled: true, useDefaultIcon: true },
      ],
      subCategories: [
        {
          id: 'sub1',
          title: 'Sub 1',
          items: [{ id: 's2', title: 'Site 2', href: 'https://b.com', enabled: true }],
        },
      ],
    },
    {
      id: 'c2',
      title: 'Cat 2',
      items: [],
      subCategories: [{ id: 'sub2', title: 'Sub 2', items: [] }],
    },
  ]
}

// findItemLocation
assert.deepStrictEqual(findItemLocation(makeTree(), 's1'), { categoryIndex: 0, itemIndex: 0 })
assert.deepStrictEqual(findItemLocation(makeTree(), 's2'), {
  categoryIndex: 0,
  subCategoryIndex: 0,
  itemIndex: 0,
})
assert.strictEqual(findItemLocation(makeTree(), 'nope'), null)

// moveItem → 目标为一级分类
{
  const tree = makeTree()
  const out = moveItem(tree, 's1', { categoryId: 'c2' })
  assert.strictEqual(out[0].items!.length, 0)
  assert.strictEqual(out[1].items!.length, 1)
  assert.strictEqual(out[1].items![0].id, 's1')
  // 保留全部字段
  assert.strictEqual(out[1].items![0].useDefaultIcon, true)
  // 原数组不可变
  assert.strictEqual(tree[0].items!.length, 1)
}

// moveItem → 目标为二级分类
{
  const out = moveItem(makeTree(), 's1', { categoryId: 'c2', subCategoryId: 'sub2' })
  assert.strictEqual(out[0].items!.length, 0)
  assert.strictEqual(out[1].subCategories![0].items!.length, 1)
  assert.strictEqual(out[1].subCategories![0].items![0].id, 's1')
}

// moveItem → 从二级分类移到一级分类
{
  const out = moveItem(makeTree(), 's2', { categoryId: 'c2' })
  assert.strictEqual(out[0].subCategories![0].items!.length, 0)
  assert.strictEqual(out[1].items!.length, 1)
  assert.strictEqual(out[1].items![0].id, 's2')
}

// moveItem → 同位置 no-op(返回同一引用)
{
  const tree = makeTree()
  const out = moveItem(tree, 's1', { categoryId: 'c1' })
  assert.strictEqual(out, tree)
}

// moveItem → 目标分类不存在,原样返回
{
  const tree = makeTree()
  const out = moveItem(tree, 's1', { categoryId: 'nope' })
  assert.strictEqual(out, tree)
}

// moveSubCategory → 跨父级
{
  const out = moveSubCategory(makeTree(), 'sub1', 'c2')
  assert.strictEqual(out[0].subCategories!.length, 0)
  assert.strictEqual(out[1].subCategories!.length, 2)
  const moved = out[1].subCategories!.find((s) => s.id === 'sub1')
  assert.ok(moved)
  // 子分类下的项保留
  assert.strictEqual(moved!.items!.length, 1)
}

// moveSubCategory → 同父级 no-op
{
  const tree = makeTree()
  const out = moveSubCategory(tree, 'sub1', 'c1')
  assert.strictEqual(out, tree)
}

console.log('All navigation-tree tests passed.')
