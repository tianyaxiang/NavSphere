# 设计:默认图标(#44)与移动功能(#65)

> 日期:2026-06-18
> 关联 issue:#44(默认 favicon 样式)、#65(分类与站点新增移动功能)
> 状态:已通过设计评审,待写实现计划

## 背景

- 数据模型:`NavigationItem`(一级分类)含 `items?`(直接站点)与 `subCategories?`(二级分类);`NavigationCategory`(二级分类)含 `items?`。站点项类型为 `NavigationSubItem`。
- 持久化:导航数据是单一 JSON(`src/navsphere/content/navigation.json`),经 `octokit` 提交回 GitHub。`POST /api/navigation` 与 `PUT /api/navigation` 接收**完整** `{ navigationItems }` 并整体校验、提交。`sitelist` 页已采用「改完整树 → POST」的模式。
- 现状痛点:
  - #44:`navigation-card.tsx` 直接 `<img src={item.icon}>`,无兜底;图标为空或加载失败会显示破图。
  - #65:`sitelist` 已有多选 + 批量删除 + 筛选;单个站点移动已可经「编辑」实现,但**无批量移动**;二级分类**无法跨一级分类移动**。

---

## 功能一:默认图标(#44)

形式:**首字母色块头像**(Notion/Gmail 风格)。触发:**手动勾选 + 自动兜底**。

### 数据模型
- `src/types/navigation.ts`:`NavigationSubItemRaw` 与 `NavigationSubItem` 各增加可选字段 `useDefaultIcon?: boolean`。
- `src/lib/data-loader.ts`:`processNavigationSubItem` 逐字段重建对象,**必须**显式加入 `useDefaultIcon: item.useDefaultIcon`,否则该字段在处理后丢失。`filterNavigationData` 对 item 做整体保留,无需改。

### 新增组件
- `src/components/letter-avatar.tsx` —— `LetterAvatar`(可为 server 组件,纯展示):
  - 首字符:`Array.from((title || '').trim())[0]?.toUpperCase() ?? '#'`(`Array.from` 防 emoji/代理对截断)。
  - 背景色:对 `title` 做确定性字符串哈希 → `hue = hash % 360`,固定 `hsl(hue, 65%, 45%)`,白色文字。**同名永远同色**(不使用 `Math.random`)。
  - props:`{ title: string; className?: string }`;`className` 控制尺寸/圆角,与卡片图标区一致。
- `src/components/site-favicon.tsx` —— `SiteFavicon`(`'use client'`,因需 `onError`):
  - props:`{ title: string; icon?: string; useDefaultIcon?: boolean; className?: string }`。
  - 内部 `errored` state;`useEffect`/`key` 在 `icon` 变化时重置 `errored`。
  - 渲染决策:`useDefaultIcon === true` 或 `!icon` 或 `errored` → `<LetterAvatar title className />`;否则 `<img src={icon} onError={()=>setErrored(true)} className />`。

### 前端渲染
- `src/components/navigation-card.tsx`:图标区由 `{item.icon && (<div><img/></div>)}` 改为**始终**渲染一个固定尺寸容器内的 `<SiteFavicon title={item.title} icon={item.icon} useDefaultIcon={item.useDefaultIcon} className="w-full h-full object-contain" />`。保持现有 `w-8 h-8 sm:w-11 sm:h-11` 尺寸。

### 后台表单(加「使用默认图标」开关)
- `src/app/admin/navigation/components/AddItemForm.tsx`:`formSchema` 增加 `useDefaultIcon: z.boolean().default(false)`;表单默认值补该字段;在「图标」字段附近加一个 `Switch`(复用「启用状态」同款 FormField 结构);提交时 `values.useDefaultIcon = data.useDefaultIcon`。
- `src/app/admin/sitelist/page.tsx`:`newSite` / `editSite` state 各加 `useDefaultIcon: boolean`;add / edit 两个 Dialog 内加一个开关;`handleAddSite` / `handleEditSite` 构造 `NavigationSubItem` 时带上该字段;`openEditDialog` 读取站点现有 `useDefaultIcon`。

### 边界
- 勾选默认图标后,`icon` 字段是否保留不强制清空(用户可保留 URL,仅渲染走默认),由 `useDefaultIcon` 优先。
- `title` 为空时首字符回退为 `#`。

---

## 功能二:移动功能(#65)

范围:**批量移动站点** + **二级分类跨一级分类移动**。

### 持久化(两部分通用)
沿用现有模式:前端拿到完整 `navigationData`,在内存中变换后 `POST /api/navigation` 整体保存。**不新增 API 路由。** 批量移动为单次提交(比逐个编辑触发更少 CF 部署)。

### 纯函数(便于测试)
新增 `src/lib/navigation-tree.ts`,导出纯函数(输入输出不可变,不改原数组):
- `findItemLocation(items, itemId)` → `{ categoryIndex, subCategoryIndex?, itemIndex } | null`
- `moveItem(items, itemId, target: { categoryId, subCategoryId? })` → 新 `items`;定位**原始 item 对象**(保留全部字段),从原位移除并插入目标位;源=目标位置时原样返回。
- `moveSubCategory(items, subCategoryId, targetCategoryId)` → 新 `items`;从当前父级 `subCategories[]` 移出该子分类对象,push 到目标父级;目标=当前父级时原样返回。
页面 handler 调用这些纯函数,保持 UI 与逻辑分离。

### A. 批量移动站点(`src/app/admin/sitelist/page.tsx`)
- 选中态工具栏(已存在 `selectedSites`)在「删除选中」旁加「批量移动」按钮。
- 弹窗(Dialog):目标【一级分类】Select +(可选)【二级分类】Select,联动逻辑复用 add/edit 现有写法(切换一级分类时清空二级分类)。
- `handleBatchMove`:对每个选中 id 调 `moveItem` 累积到新树 → `POST /api/navigation` → 成功后 `fetchSites()` + 清空 `selectedSites` + 关闭弹窗;失败 toast。
- 用 `isBatchMoving` 状态防重复提交(对齐 `isBatchDeleting`)。

### B. 二级分类移动(`src/app/admin/navigation/[id]/categories/page.tsx`)
- 实现前先读该页,对齐其表格/操作风格。
- 每个二级分类行加「移动到其他导航」操作(下拉项或按钮 → Dialog 选目标一级分类,排除当前父级)。
- handler:`GET /api/navigation` 取完整树 → `moveSubCategory(items, subId, targetCategoryId)` → `POST /api/navigation` → 刷新。
- 目标列表用 `navigationData` 的一级分类,排除当前 `[id]`。

### 边界
- 空选择时「批量移动」按钮不出现(随选中态工具栏一起显示)。
- 移动站点保留原 `id` 与全部字段(用对象搬移,不重建)。
- 同位置移动为 no-op,给出「未发生移动」或直接成功提示。

---

## 测试策略
- 仓库无测试框架。核心移动/定位逻辑抽到 `src/lib/navigation-tree.ts` 纯函数,用一次性 Node/tsx 脚本对若干树形样例断言(移动到一级、移动到二级、同位置 no-op、子分类跨父级、保留字段),验证后删除脚本或留在 `scripts/`。
- UI 改动:`npx tsc --noEmit` 通过 + 本地 `next dev` 实际操作验证(添加带/不带默认图标的站点、破图兜底、批量移动、子分类移动)。
- 若需长期单元测试框架(vitest),作为单独事项再议,不在本次范围。

## 不在本次范围
- 一级分类之间的排序/移动(用户已选「站点 + 子分类移动」,不含一级排序)。
- #44 的其它默认图标形式(通用占位图、站点 Logo)。
- 后台「数据管理」JSON 编辑器、视频模块的图标兜底(仅改前端站点卡片)。

## 涉及文件清单
新增:`src/components/letter-avatar.tsx`、`src/components/site-favicon.tsx`、`src/lib/navigation-tree.ts`
修改:`src/types/navigation.ts`、`src/lib/data-loader.ts`、`src/components/navigation-card.tsx`、`src/app/admin/navigation/components/AddItemForm.tsx`、`src/app/admin/sitelist/page.tsx`、`src/app/admin/navigation/[id]/categories/page.tsx`
