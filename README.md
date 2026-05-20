# NavSphere - 内容导航管理平台 

<p align="center">
  <strong>现代化的内容导航管理平台 | 视频导航 + 网址导航</strong>
</p>

<p align="center">
  <strong>简体中文</strong> | <a href="./README-EN.md">English</a>
</p>

<p align="center">
  <a href="https://github.com/tianyaxiang/NavSphere/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/tianyaxiang/NavSphere?style=flat-square"></a>
  <a href="https://github.com/tianyaxiang/NavSphere/network"><img alt="GitHub forks" src="https://img.shields.io/github/forks/tianyaxiang/NavSphere?style=flat-square"></a>
  <a href="https://github.com/tianyaxiang/NavSphere/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/tianyaxiang/NavSphere?style=flat-square"></a>
  <a href="https://github.com/tianyaxiang/NavSphere/blob/main/LICENSE"><img alt="GitHub license" src="https://img.shields.io/github/license/tianyaxiang/NavSphere?style=flat-square"></a>
</p>

## 📖 项目简介

NavSphere 是一个基于 Next.js 15 构建的现代化导航管理平台，集成了**视频导航**和**网址导航**两大核心功能。专为内容收藏、分类和管理而设计，通过 GitHub 作为数据存储后端，提供安全、可靠的导航数据管理体验。

### 双核心功能

#### 🎬 视频导航
专注于视频内容的收藏和组织，支持 Bilibili 和 YouTube 平台的视频管理。

#### 🔖 网址导航
全面的网站书签管理系统，帮助你收藏和整理常用网站、在线工具和资源。

### 核心亮点

- 🎬 **多平台视频支持**：完美支持 Bilibili 和 YouTube 视频播放
- 🔖 **网址导航管理**：收藏和管理你的常用网站和在线工具
- 📊 **分类管理**：灵活的分类和子分类系统，支持无限层级
- 🎨 **现代化界面**：基于 Radix UI 和 Tailwind CSS 的精美界面
- 🔐 **GitHub 认证**：基于 NextAuth.js 的安全登录
- 📱 **响应式设计**：完美适配桌面端和移动端
- 🌓 **主题切换**：支持深色/浅色主题
- 🎯 **智能图标**：自动获取网站 Favicon
- ⚡ **高性能**：支持 Cloudflare Pages 边缘部署

## ✨ 核心特性

### 视频管理功能

- 🎥 **视频分类**：支持多级分类和子分类，灵活组织视频内容
- 🎯 **视频配置**：自动识别 Bilibili 和 YouTube 视频链接，提取视频信息
- 🖼️ **封面管理**：支持自定义上传视频封面图片
- 🎬 **内嵌播放**：支持在站内直接播放 Bilibili 和 YouTube 视频
- 📝 **详细信息**：为每个视频添加标题、描述等详细信息
- 🔄 **拖拽排序**：通过拖拽轻松调整视频和分类的顺序

### 网址导航功能

- 🔖 **网站收藏**：快速收藏和管理你喜欢的网站
- 📂 **分类组织**：创建主分类和子分类，无限层级的目录结构
- 🎨 **智能图标**：自动获取网站 Favicon，也可手动上传
- 📝 **详细描述**：为每个网站添加标题、描述等信息
- 🔍 **快速搜索**：通过关键词快速定位网站
- 🎯 **一键访问**：点击即可跳转到目标网站
- 🏷️ **标签管理**：使用图标和标签更好地组织内容
- 🔄 **拖拽排序**：自由调整网站和分类的显示顺序

### 管理后台功能

- 👨‍💼 **统一管理**：视频和网址统一的后台管理系统
- ➕ **快速添加**：
  - **视频**：粘贴视频链接即可添加 Bilibili 或 YouTube 视频
  - **网址**：输入 URL 自动获取网站信息
- ✏️ **编辑功能**：
  - 修改标题、描述、图标
  - 调整分类归属
  - 上传自定义封面/图标
- 🗂️ **分类管理**：创建、编辑、删除分类和子分类
- 📊 **可视化编辑**：Monaco Editor 支持 JSON 数据直接编辑
- 🔍 **智能搜索**：快速定位内容和分类
- 🎨 **图标选择**：集成 Lucide Icons 图标库

### 技术特性

- 🚀 **现代技术栈**：Next.js 15 + React 18 + TypeScript
- 🎨 **UI 组件库**：Radix UI + shadcn/ui
- 🎭 **图标系统**：Lucide React 图标库
- 📦 **状态管理**：React Query 数据获取和缓存
- 🔧 **表单处理**：React Hook Form + Zod 验证
- 🌐 **数据存储**：GitHub 仓库作为数据后端
- 🔐 **身份认证**：NextAuth.js v5 OAuth 认证

## 🛠️ 技术架构

| 技术栈              | 版本          | 用途                  |
| ------------------- | ------------- | --------------------- |
| **Next.js**         | 15.5.7        | React 全栈框架        |
| **React**           | 18.2.0        | 用户界面库            |
| **TypeScript**      | 5.1.6         | 类型安全的 JavaScript |
| **Tailwind CSS**    | 4.1.12        | 原子化 CSS 框架       |
| **NextAuth.js**     | 5.0.0-beta.25 | 身份认证解决方案      |
| **Radix UI**        | Latest        | 无障碍 UI 组件库      |
| **Lucide React**    | 0.462.0       | 现代图标库            |
| **React Query**     | 5.62.2        | 数据获取和状态管理    |
| **React Hook Form** | 7.53.2        | 表单处理              |
| **Zod**             | 3.25.76       | 数据验证              |
| **Monaco Editor**   | 0.52.2        | 代码编辑器            |

## 🚀 快速开始

### 环境要求

- Node.js 20.0+
- pnpm 8.0+ (推荐) 或 npm/yarn
- GitHub 账户

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/tianyaxiang/NavSphere.git
cd NavSphere
```

2. **安装依赖**
```bash
pnpm install
```

3. **配置环境变量**
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，配置必要的环境变量（详见下方配置指南）

4. **启动开发服务器**
```bash
pnpm dev
```

5. **访问应用**
   
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## ⚙️ 配置指南

### 环境变量设置

创建 `.env.local` 文件并配置以下变量：

```env
# GitHub OAuth App 配置
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# GitHub 仓库配置
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
GITHUB_BRANCH=main

# GitHub Fine-grained PAT (用于匿名投稿创建 Issue)
GITHUB_PAT=your-github-personal-access-token

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=your-random-auth-secret
NEXT_PUBLIC_API_URL=http://localhost:3000

# Google Analytics 配置 (可选)
GA_ID=your-google-analytics-id
```

### GitHub OAuth App 设置

1. **创建 OAuth App**
   - 访问 [GitHub Developer Settings](https://github.com/settings/developers)
   - 点击 "New OAuth App"
   - 填写应用信息：
     ```
     Application name: NavSphere
     Homepage URL: http://localhost:3000
     Authorization callback URL: http://localhost:3000/api/auth/callback/github
     ```

2. **获取凭据**
   - Client ID: 应用详情页显示
   - Client Secret: 点击 "Generate a new client secret" 生成

### GitHub 数据仓库设置

1. **创建数据仓库**
   - 访问 [GitHub New Repository](https://github.com/new)
   - 仓库名建议: `navsphere-data`
   - 可选择 Public 或 Private

2. **初始化数据文件**
   
   项目会自动创建以下数据文件：
   - `videos.json` - 视频数据
   - `navigation.json` - 导航数据
   - `site.json` - 站点配置

## 📊 数据结构

### videos.json - 视频数据格式

视频导航的数据存储格式：

```json
{
  "navigationItems": [
    {
      "id": "category-id",
      "title": "分类名称",
      "icon": "Home",
      "description": "分类描述",
      "enabled": true,
      "items": [
        {
          "id": "video-id",
          "title": "视频标题",
          "href": "视频链接",
          "description": "视频描述",
          "icon": "/assets/cover/cover.jpg",
          "enabled": true,
          "videoConfig": {
            "type": "bilibili",
            "bvid": "BV1xxxxxxxxx",
            "aid": "xxx",
            "cid": "xxx",
            "p": 1
          }
        }
      ],
      "subCategories": [
        {
          "id": "sub-category-id",
          "title": "子分类名称",
          "icon": "PlayCircle",
          "enabled": true,
          "items": []
        }
      ]
    }
  ]
}
```

### navigation.json - 网址导航数据格式

网址导航的数据存储格式：

```json
{
  "navigationItems": [
    {
      "id": "category-id",
      "title": "常用推荐",
      "icon": "Star",
      "description": "常用网站和工具",
      "enabled": true,
      "items": [
        {
          "id": "item-id",
          "title": "网站名称",
          "href": "https://example.com",
          "description": "网站描述",
          "icon": "/assets/images/logos/example.webp",
          "enabled": true
        }
      ],
      "subCategories": [
        {
          "id": "sub-category-id",
          "title": "子分类名称",
          "icon": "BookOpen",
          "description": "子分类描述",
          "enabled": true,
          "items": [
            {
              "id": "sub-item-id",
              "title": "网站名称",
              "href": "https://example.com",
              "description": "网站描述",
              "icon": "/assets/favicon.webp",
              "enabled": true
            }
          ]
        }
      ]
    }
  ]
}
```

## 🚀 部署指南

### Cloudflare Pages 部署（推荐）

1. **创建项目**
   - 登录 [Cloudflare Pages](https://pages.cloudflare.com/)
   - 连接 GitHub 仓库

2. **构建设置**
   ```bash
   # 构建命令
   pnpm install && pnpm run cf:build
   
   # 输出目录
   .next
   
   # Node.js 版本
   20.0.0
   ```

3. **环境变量配置**
   
   在 Cloudflare Pages 环境变量中添加所有必需的环境变量

4. **自定义部署**
   ```bash
   # 本地构建并部署
   pnpm run cf:deploy
   ```

### Vercel 部署

1. **一键部署**
   - 点击 "Deploy with Vercel" 按钮
   - 配置所需的环境变量

2. **手动部署**
   - Fork 项目到你的 GitHub
   - 在 Vercel 中导入项目
   - 配置环境变量
   - 部署项目

### Docker 部署

```bash
# 构建镜像
pnpm run docker:build

# 开发环境
pnpm run docker:dev

# 生产环境
pnpm run docker:prod

# 查看日志
pnpm run docker:logs

# 停止服务
pnpm run docker:stop
```

## 🔧 开发指南

### 可用脚本

```bash
# 开发模式
pnpm dev

# 构建项目
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint

# 清理构建文件
pnpm clean

# Cloudflare Pages 部署
pnpm run cf:build
pnpm run cf:deploy

# Docker 部署
pnpm run docker:build
pnpm run docker:dev
pnpm run docker:prod
```

### 项目结构

```
NavSphere/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   │   ├── videos/        # 视频 API
│   │   │   └── navigation/    # 网址导航 API
│   │   ├── admin/             # 管理后台
│   │   │   ├── videos/        # 视频管理
│   │   │   └── navigation/    # 网址管理
│   │   ├── videos/            # 视频页面
│   │   └── components/        # 页面组件
│   ├── components/            # 共享 UI 组件
│   │   ├── video-card.tsx     # 视频卡片
│   │   ├── video-content.tsx  # 视频内容
│   │   ├── video-player-page.tsx # 视频播放器
│   │   ├── navigation-card.tsx # 网址卡片
│   │   └── navigation-content.tsx # 网址内容
│   ├── lib/                   # 工具函数
│   ├── types/                 # TypeScript 类型定义
│   │   ├── navigation.ts      # 导航类型
│   │   └── video.ts          # 视频类型
│   ├── services/              # 服务层
│   └── navsphere/             # 数据文件
│       └── content/
│           ├── videos.json    # 视频数据
│           ├── navigation.json # 网址导航数据
│           └── site.json      # 站点配置
├── public/                    # 静态资源
│   └── assets/
│       ├── cover/             # 视频封面图片
│       └── images/
│           └── logos/         # 网站图标
├── docker/                    # Docker 配置
└── wrangler.toml             # Cloudflare 配置
```

## 🎯 使用指南

### 视频导航使用

#### 添加视频

1. 登录管理后台 `/admin/videos`
2. 点击"添加视频分类"或在现有分类中"添加视频"
3. 粘贴 Bilibili 或 YouTube 视频链接
4. 系统会自动识别视频平台并提取信息
5. 添加标题、描述、上传封面（可选）
6. 保存视频

#### 视频链接支持

**Bilibili:**
- 标准链接：`https://www.bilibili.com/video/BVxxxxxxxxx`
- 短链接：`https://b23.tv/xxxxxxx`

**YouTube:**
- 标准链接：`https://www.youtube.com/watch?v=xxxxxxxxxxx`
- 短链接：`https://youtu.be/xxxxxxxxxxx`

#### 视频分类管理

1. 在管理后台创建主分类和子分类
2. 使用拖拽功能调整分类顺序
3. 为分类选择合适的图标（Lucide 图标）
4. 启用/禁用分类显示

### 网址导航使用

#### 添加网站

1. 登录管理后台 `/admin/navigation`
2. 点击"添加导航分类"或在现有分类中"添加网站"
3. 输入网站 URL
4. 系统会自动获取：
   - 网站标题
   - 网站描述
   - 网站 Favicon 图标
5. 可以手动修改标题、描述
6. 可以上传自定义图标
7. 保存网站

#### 网址分类管理

1. **创建分类**：
   - 在管理后台点击"添加导航分类"
   - 输入分类名称和描述
   - 从 Lucide Icons 中选择合适的图标
   - 保存分类

2. **创建子分类**：
   - 在主分类下添加子分类
   - 支持无限层级的分类结构
   - 每个子分类都可以有自己的图标和描述

3. **调整顺序**：
   - 使用拖拽功能调整分类和网站的显示顺序
   - 支持跨分类拖拽

4. **批量管理**：
   - 使用 Monaco Editor 直接编辑 JSON 数据
   - 支持批量导入和导出

### 通用功能

#### 图标管理

**Lucide Icons**：
- 项目集成了完整的 Lucide 图标库
- 可用图标：Home, Star, BookOpen, Brain, Code 等
- 访问 [lucide.dev](https://lucide.dev/) 查看所有可用图标

**自定义图标**：
- 支持上传 PNG、SVG、WebP 等格式
- 建议尺寸：256x256 像素
- 自动优化和压缩

#### 搜索功能

1. 在首页使用搜索框
2. 支持搜索：
   - 网站/视频标题
   - 描述内容
   - 分类名称
3. 实时搜索结果展示

## 🐛 故障排除

### 常见问题

**认证失败**
- 检查 `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET` 是否正确
- 确认回调 URL 配置正确：`http://localhost:3000/api/auth/callback/github`

**数据加载失败**
- 验证 GitHub 仓库配置（GITHUB_OWNER、GITHUB_REPO、GITHUB_BRANCH）
- 检查仓库访问权限
- 确认数据文件格式正确

**视频无法播放**
- 检查视频链接是否有效
- 确认 videoConfig 配置正确
- Bilibili 视频需要正确的 bvid、aid、cid
- YouTube 视频需要正确的视频 ID

**构建失败**
- 检查 Node.js 版本（需要 20.0+）
- 清理依赖：`rm -rf node_modules pnpm-lock.yaml && pnpm install`
- 检查环境变量配置

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. Fork 项目
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 创建 Pull Request

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - 强大的 React 框架
- [Tailwind CSS](https://tailwindcss.com/) - 优秀的 CSS 框架
- [Radix UI](https://www.radix-ui.com/) - 无障碍组件库
- [shadcn/ui](https://ui.shadcn.com/) - 精美的 UI 组件
- [Cloudflare Pages](https://pages.cloudflare.com/) - 可靠的部署平台
- 所有为项目做出贡献的开发者

---

<p align="center">
  <strong>⭐ 如果这个项目对你有帮助，请给我们一个 Star！</strong>
</p>

## 友情链接

[![LINUXDO](https://img.shields.io/badge/%E7%A4%BE%E5%8C%BA-LINUXDO-0086c9?style=for-the-badge&labelColor=555555)](https://linux.do)
