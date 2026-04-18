# NavSphere - Video Navigation Platform

<p align="center">
  <strong>Modern Content Navigation Platform | Video Navigation + Website Navigation</strong>
</p>

<p align="center">
  <a href="./README.md">简体中文</a> | <strong>English</strong>
</p>

<p align="center">
  <a href="https://github.com/tianyaxiang/NavSphere/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/tianyaxiang/NavSphere?style=flat-square"></a>
  <a href="https://github.com/tianyaxiang/NavSphere/network"><img alt="GitHub forks" src="https://img.shields.io/github/forks/tianyaxiang/NavSphere?style=flat-square"></a>
  <a href="https://github.com/tianyaxiang/NavSphere/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/tianyaxiang/NavSphere?style=flat-square"></a>
  <a href="https://github.com/tianyaxiang/NavSphere/blob/main/LICENSE"><img alt="GitHub license" src="https://img.shields.io/github/license/tianyaxiang/NavSphere?style=flat-square"></a>
</p>

## 📖 Introduction

NavSphere is a modern navigation management platform built with Next.js 15, integrating **Video Navigation** and **Website Navigation** as core features. Designed for content collection, categorization, and management, it provides a secure and reliable navigation data management experience using GitHub as the data storage backend.

### Dual Core Features

#### 🎬 Video Navigation
Focus on video content collection and organization, supporting video management for Bilibili and YouTube platforms.

#### 🔖 Website Navigation
Comprehensive website bookmark management system to help you collect and organize commonly used websites, online tools, and resources.

### Core Highlights

- 🎬 **Multi-Platform Video Support**: Perfect support for Bilibili and YouTube video playback
- 🔖 **Website Navigation Management**: Collect and manage your favorite websites and online tools
- 📊 **Category Management**: Flexible category and subcategory system with unlimited hierarchy
- 🎨 **Modern Interface**: Beautiful UI based on Radix UI and Tailwind CSS
- 🔐 **GitHub Authentication**: Secure login based on NextAuth.js
- 📱 **Responsive Design**: Perfect adaptation for desktop and mobile
- 🌓 **Theme Switching**: Support for dark/light themes
- 🎯 **Smart Icons**: Automatically fetch website Favicons
- ⚡ **High Performance**: Support for Cloudflare Pages edge deployment

## ✨ Core Features

### Video Management

- 🎥 **Video Categorization**: Support for multi-level categories and subcategories, flexible video content organization
- 🎯 **Video Configuration**: Automatically identify Bilibili and YouTube video links and extract video information
- 🖼️ **Cover Management**: Support for custom upload of video cover images
- 🎬 **Embedded Playback**: Support for direct playback of Bilibili and YouTube videos within the site
- 📝 **Detailed Information**: Add title, description, and other details for each video
- 🔄 **Drag & Drop Sorting**: Easily adjust the order of videos and categories through drag and drop

### Website Navigation

- 🔖 **Website Collection**: Quickly collect and manage your favorite websites
- 📂 **Category Organization**: Create main categories and subcategories with unlimited hierarchy
- 🎨 **Smart Icons**: Automatically fetch website Favicons or manually upload
- 📝 **Detailed Description**: Add title, description, and other information for each website
- 🔍 **Quick Search**: Quickly locate websites through keywords
- 🎯 **One-Click Access**: Click to jump to the target website
- 🏷️ **Tag Management**: Better organize content using icons and tags
- 🔄 **Drag & Drop Sorting**: Freely adjust the display order of websites and categories

### Admin Dashboard

- 👨‍💼 **Unified Management**: Unified admin system for videos and websites
- ➕ **Quick Add**:
  - **Videos**: Paste video link to add Bilibili or YouTube videos
  - **Websites**: Enter URL to automatically fetch website information
- ✏️ **Edit Features**:
  - Modify title, description, and icons
  - Adjust category attribution
  - Upload custom covers/icons
- 🗂️ **Category Management**: Create, edit, and delete categories and subcategories
- 📊 **Visual Editing**: Monaco Editor supports direct JSON data editing
- 🔍 **Smart Search**: Quickly locate content and categories
- 🎨 **Icon Selection**: Integrated Lucide Icons library

### Technical Features

- 🚀 **Modern Tech Stack**: Next.js 15 + React 18 + TypeScript
- 🎨 **UI Component Library**: Radix UI + shadcn/ui
- 🎭 **Icon System**: Lucide React icon library
- 📦 **State Management**: React Query for data fetching and caching
- 🔧 **Form Handling**: React Hook Form + Zod validation
- 🌐 **Data Storage**: GitHub repository as data backend
- 🔐 **Authentication**: NextAuth.js v5 OAuth authentication

## 🛠️ Tech Stack

| Technology          | Version       | Purpose                      |
| ------------------- | ------------- | ---------------------------- |
| **Next.js**         | 15.5.7        | React full-stack framework   |
| **React**           | 18.2.0        | User interface library       |
| **TypeScript**      | 5.1.6         | Type-safe JavaScript         |
| **Tailwind CSS**    | 4.1.12        | Atomic CSS framework         |
| **NextAuth.js**     | 5.0.0-beta.25 | Authentication solution      |
| **Radix UI**        | Latest        | Accessible UI component lib  |
| **Lucide React**    | 0.462.0       | Modern icon library          |
| **React Query**     | 5.62.2        | Data fetching & state mgmt   |
| **React Hook Form** | 7.53.2        | Form handling                |
| **Zod**             | 3.25.76       | Data validation              |
| **Monaco Editor**   | 0.52.2        | Code editor                  |

## 🚀 Quick Start

### Requirements

- Node.js 20.0+
- pnpm 8.0+ (recommended) or npm/yarn
- GitHub account

### Installation

1. **Clone the project**
```bash
git clone https://github.com/tianyaxiang/NavSphere.git
cd NavSphere
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` file and configure the necessary environment variables (see configuration guide below)

4. **Start development server**
```bash
pnpm dev
```

5. **Access the application**
   
   Open your browser and visit [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration Guide

### Environment Variables

Create a `.env.local` file and configure the following variables:

```env
# GitHub OAuth App Configuration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# GitHub Repository Configuration
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
GITHUB_BRANCH=main

# GitHub Fine-grained PAT (for anonymous submission to create Issues)
GITHUB_PAT=your-github-personal-access-token

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=your-random-auth-secret
NEXT_PUBLIC_API_URL=http://localhost:3000

# Google Analytics Configuration (Optional)
GA_ID=your-google-analytics-id
```

### GitHub OAuth App Setup

1. **Create OAuth App**
   - Visit [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Fill in application information:
     ```
     Application name: NavSphere
     Homepage URL: http://localhost:3000
     Authorization callback URL: http://localhost:3000/api/auth/callback/github
     ```

2. **Get Credentials**
   - Client ID: Displayed on the application details page
   - Client Secret: Click "Generate a new client secret" to generate

### GitHub Data Repository Setup

1. **Create Data Repository**
   - Visit [GitHub New Repository](https://github.com/new)
   - Suggested repository name: `navsphere-data`
   - Choose Public or Private

2. **Initialize Data Files**
   
   The project will automatically create the following data files:
   - `videos.json` - Video data
   - `navigation.json` - Navigation data
   - `site.json` - Site configuration

## 📊 Data Structure

### videos.json - Video Data Format

Video navigation data storage format:

```json
{
  "navigationItems": [
    {
      "id": "category-id",
      "title": "Category Name",
      "icon": "Home",
      "description": "Category Description",
      "enabled": true,
      "items": [
        {
          "id": "video-id",
          "title": "Video Title",
          "href": "Video Link",
          "description": "Video Description",
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
          "title": "Subcategory Name",
          "icon": "PlayCircle",
          "enabled": true,
          "items": []
        }
      ]
    }
  ]
}
```

### navigation.json - Website Navigation Data Format

Website navigation data storage format:

```json
{
  "navigationItems": [
    {
      "id": "category-id",
      "title": "Recommended",
      "icon": "Star",
      "description": "Common websites and tools",
      "enabled": true,
      "items": [
        {
          "id": "item-id",
          "title": "Website Name",
          "href": "https://example.com",
          "description": "Website Description",
          "icon": "/assets/images/logos/example.webp",
          "enabled": true
        }
      ],
      "subCategories": [
        {
          "id": "sub-category-id",
          "title": "Subcategory Name",
          "icon": "BookOpen",
          "description": "Subcategory Description",
          "enabled": true,
          "items": [
            {
              "id": "sub-item-id",
              "title": "Website Name",
              "href": "https://example.com",
              "description": "Website Description",
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

## 🚀 Deployment Guide

### Cloudflare Pages Deployment (Recommended)

1. **Create Project**
   - Log in to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Connect your GitHub repository

2. **Build Settings**
   ```bash
   # Build command
   pnpm install && pnpm run cf:build
   
   # Output directory
   .next
   
   # Node.js version
   20.0.0
   ```

3. **Environment Variables Configuration**
   
   Add all required environment variables in Cloudflare Pages

4. **Custom Deployment**
   ```bash
   # Local build and deploy
   pnpm run cf:deploy
   ```

### Vercel Deployment

1. **One-Click Deployment**
   - Click the "Deploy with Vercel" button
   - Configure required environment variables

2. **Manual Deployment**
   - Fork the project to your GitHub
   - Import the project in Vercel
   - Configure environment variables
   - Deploy the project

### Docker Deployment

```bash
# Build image
pnpm run docker:build

# Development environment
pnpm run docker:dev

# Production environment
pnpm run docker:prod

# View logs
pnpm run docker:logs

# Stop service
pnpm run docker:stop
```

## 🔧 Development Guide

### Available Scripts

```bash
# Development mode
pnpm dev

# Build project
pnpm build

# Start production server
pnpm start

# Code linting
pnpm lint

# Clean build files
pnpm clean

# Cloudflare Pages deployment
pnpm run cf:build
pnpm run cf:deploy

# Docker deployment
pnpm run docker:build
pnpm run docker:dev
pnpm run docker:prod
```

### Project Structure

```
NavSphere/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── videos/        # Video API
│   │   │   └── navigation/    # Website navigation API
│   │   ├── admin/             # Admin dashboard
│   │   │   ├── videos/        # Video management
│   │   │   └── navigation/    # Website management
│   │   ├── videos/            # Video pages
│   │   └── components/        # Page components
│   ├── components/            # Shared UI components
│   │   ├── video-card.tsx     # Video card
│   │   ├── video-content.tsx  # Video content
│   │   ├── video-player-page.tsx # Video player
│   │   ├── navigation-card.tsx # Website card
│   │   └── navigation-content.tsx # Website content
│   ├── lib/                   # Utility functions
│   ├── types/                 # TypeScript type definitions
│   │   ├── navigation.ts      # Navigation types
│   │   └── video.ts          # Video types
│   ├── services/              # Service layer
│   └── navsphere/             # Data files
│       └── content/
│           ├── videos.json    # Video data
│           ├── navigation.json # Website navigation data
│           └── site.json      # Site configuration
├── public/                    # Static assets
│   └── assets/
│       ├── cover/             # Video cover images
│       └── images/
│           └── logos/         # Website icons
├── docker/                    # Docker configuration
└── wrangler.toml             # Cloudflare configuration
```

## 🎯 Usage Guide

### Video Navigation

#### Adding Videos

1. Log in to admin dashboard at `/admin/videos`
2. Click "Add Video Category" or "Add Video" in an existing category
3. Paste the Bilibili or YouTube video link
4. The system will automatically identify the platform and extract video information
5. Add title, description, and upload cover (optional)
6. Save the video

#### Supported Video Links

**Bilibili:**
- Standard link: `https://www.bilibili.com/video/BVxxxxxxxxx`
- Short link: `https://b23.tv/xxxxxxx`

**YouTube:**
- Standard link: `https://www.youtube.com/watch?v=xxxxxxxxxxx`
- Short link: `https://youtu.be/xxxxxxxxxxx`

#### Video Category Management

1. Create main categories and subcategories in the admin dashboard
2. Use drag and drop to adjust category order
3. Select appropriate icons for categories (Lucide icons)
4. Enable/disable category display

### Website Navigation

#### Adding Websites

1. Log in to admin dashboard at `/admin/navigation`
2. Click "Add Navigation Category" or "Add Website" in an existing category
3. Enter the website URL
4. The system will automatically fetch:
   - Website title
   - Website description
   - Website Favicon
5. Manually edit title and description
6. Upload custom icon (optional)
7. Save the website

#### Website Category Management

1. **Create Category**:
   - Click "Add Navigation Category" in the admin dashboard
   - Enter category name and description
   - Select an appropriate icon from Lucide Icons
   - Save the category

2. **Create Subcategory**:
   - Add subcategories under main categories
   - Support unlimited hierarchy of categories
   - Each subcategory can have its own icon and description

3. **Adjust Order**:
   - Use drag and drop to adjust the display order of categories and websites
   - Support cross-category dragging

4. **Batch Management**:
   - Use Monaco Editor to directly edit JSON data
   - Support batch import and export

### Common Features

#### Icon Management

**Lucide Icons**:
- Full Lucide icon library integration
- Available icons: Home, Star, BookOpen, Brain, Code, etc.
- Visit [lucide.dev](https://lucide.dev/) to view all available icons

**Custom Icons**:
- Support upload of PNG, SVG, WebP formats
- Recommended size: 256x256 pixels
- Automatic optimization and compression

#### Search Function

1. Use the search box on the homepage
2. Support searching:
   - Website/video titles
   - Description content
   - Category names
3. Real-time search results display

## 🐛 Troubleshooting

### Common Issues

**Authentication Failure**
- Check if `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct
- Confirm the callback URL is configured correctly: `http://localhost:3000/api/auth/callback/github`

**Data Loading Failure**
- Verify GitHub repository configuration (GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH)
- Check repository access permissions
- Confirm data file format is correct

**Video Playback Issues**
- Check if the video link is valid
- Confirm videoConfig is configured correctly
- Bilibili videos require correct bvid, aid, cid
- YouTube videos require correct video ID

**Build Failure**
- Check Node.js version (requires 20.0+)
- Clean dependencies: `rm -rf node_modules pnpm-lock.yaml && pnpm install`
- Check environment variable configuration

## 🤝 Contributing

We welcome all forms of contribution!

1. Fork the project
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push the branch: `git push origin feature/amazing-feature`
5. Create a Pull Request

## 📄 License

This project is open-sourced under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - Powerful React framework
- [Tailwind CSS](https://tailwindcss.com/) - Excellent CSS framework
- [Radix UI](https://www.radix-ui.com/) - Accessible component library
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Cloudflare Pages](https://pages.cloudflare.com/) - Reliable deployment platform
- All developers who contributed to the project

---

<p align="center">
  <strong>⭐ If this project helps you, please give us a Star!</strong>
</p>
