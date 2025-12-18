
# NavSphere

## Overview
NavSphere is a web application designed for managing navigation items and categories. It provides an intuitive interface for adding, editing, and organizing navigation entries, including site icons and descriptions.

## Features
- **Add/Edit Navigation Items**: Easily add or modify navigation items with titles, links, icons, and descriptions.
- **Icon Management**: Upload or fetch icons for each navigation item.
- **Drag-and-Drop Interface**: Reorder navigation items and categories using drag-and-drop functionality.
- **Responsive Design**: Works seamlessly on various devices and screen sizes.

## Installation

### Prerequisites
- Node.js (version x.x.x)
- npm or yarn

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/tianyaxiang/NavSphere.git

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## 本地开发配置

### 1. GitHub OAuth App 配置

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
   - 点击右上角头像
   - Settings
   - 左侧边栏底部 Developer settings
   - OAuth Apps
   - New OAuth App

2. 填写应用信息：
   ```
   Application name: 你的应用名称
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/api/auth/callback/github
   ```

3. 创建后获取：
   - Client ID: 显示在应用详情页
   - Client Secret: 点击 "Generate a new client secret" 生成

### 2. GitHub 仓库配置

1. 创建用于存储数据的仓库：
   - 访问 [GitHub New Repository](https://github.com/new)
   - 填写仓库名
   - 选择 Public 或 Private
   - 创建仓库

2. 获取仓库信息：
   ```
   GITHUB_OWNER: 你的 GitHub 用户名
   GITHUB_REPO: 仓库名
   ```

3. 创建 GitHub 组织（可选）：
   - 访问 [GitHub New Organization](https://github.com/organizations/new)
   - 选择免费计划
   - 填写组织名称
   - 将需要访问的用户添加到组织

### 3. 环境变量配置

```env
# GitHub OAuth App 配置
GITHUB_CLIENT_ID=从 OAuth App 获取的 Client ID
GITHUB_SECRET=从 OAuth App 获取的 Client Secret

# GitHub 组织和仓库配置
GITHUB_ORG=你的组织名称（如果使用组织）
GITHUB_OWNER=你的 GitHub 用户名
GITHUB_REPO=用于存储数据的仓库名
GITHUB_BRANCH=main

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=使用以下命令生成:
# openssl rand -base64 32
```

### 4. 权限配置

1. OAuth App 权限：
   - 在 OAuth App 设置页面
   - 确保 `read:org` 和 `repo` 权限被勾选

2. 仓库权限：
   - 如果是私有仓库，确保 OAuth App 有访问权限
   - 如果使用组织，确保 OAuth App 已在组织中安装

### 5. 注意事项

1. 本地开发和生产环境使用不同的 OAuth App
2. 生产环境需要更新回调 URL 为实际域名
3. 确保 `.env.local` 不被提交到 Git
4. 生产环境使用 Cloudflare Pages 的环��
5. 定期轮换 Client Secret 以提高安全性

## Cloudflare Pages 部署

1. 在 Cloudflare Pages 中创建新项目
2. 连接 GitHub 仓库
3. 设置构建命令：
   ```bash
   pnpm install && pnpm build
   ```
4. 设置环境变量：
   - GITHUB_CLIENT_ID
   - GITHUB_SECRET
   - GITHUB_OWNER
   - GITHUB_REPO
   - GITHUB_BRANCH
   - NEXTAUTH_URL (设置为你的域名)
   - NEXTAUTH_SECRET
5. 部署项目

## 环境变量

需要配置以下环境变量：

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GITHUB_CLIENT_ID=your-github-id
GITHUB_SECRET=your-github-secret
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
GITHUB_BRANCH=main
```

## 开发

1. 安装依赖

```bash
pnpm install
```

2. 配置环境变量

```bash
cp .env.example .env.local
```

3. 启动开发服务器

```bash
pnpm dev
```

## 数据文件

项目使用 GitHub 仓库存储数据，需要以下数据文件：

1. `app/data/db/navigation.json` - 导航数据
2. `app/data/db/resources.json` - 资源数据

这些文件会在首次提交到仓库时自动创建。

## 数据格式

### navigation.json
```json
[
  {
    "id": "string",
    "title": "string",
    "icon": "string",
    "items": [
      {
        "title": "string",
        "titleEn": "string",
        "description": "string",
        "descriptionEn": "string",
        "icon": "string",
        "href": "string"
      }
    ],
    "subCategories": [
      {
        "id": "string",
        "title": "string",
        "items": []
      }
    ]
  }
]
```

### resources.json
```json
[
  {
    "id": "string",
    "title": "string",
    "items": [
      {
        "title": "string",
        "description": "string",
        "icon": "string",
        "url": "string"
      }
    ]
  }
]
```

## 故障排除

### 导航数据加载失败

1. 检查环境变量配置
   - GITHUB_OWNER 是否正确
   - GITHUB_REPO 是否正确
   - GITHUB_BRANCH 是否正确

2. 检查仓库权限
   - 仓库是否公开
   - OAuth App 是否有正确的权限
   - Token 是否有效

3. 检查数据文件
   - navigation.json 是否存在
   - 文件格式是否正确
   - 文件路径是否正确

4. 查看控制台日志
   - 检查 API 请求是否成功
   - 检查错误信息
   - 检查返回的数据格式
