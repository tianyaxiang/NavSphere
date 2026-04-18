import { 
  Folder,
  FolderOpen,
  Home,
  Settings,
  LayoutGrid,
  LayoutList,
  FileText,
  Files,
  Edit,
  Book,
  BookOpen,
  Brain,
  Network,
  Box,
  Mail,
  Globe,
  Image,
  Video,
  Music,
  User,
  Users,
  Shield,
  Code,
  Database,
  Cloud,
  Building,
  BarChart,
  Star,
  Bell,
  Calendar,
  Map,
  Search,
  Flag,
  Target,
  Briefcase,
  Laptop,
  MessageSquare,
  Link,
  Zap,
  Heart,
  Coffee,
  Palette
} from 'lucide-react'

export const navigationIcons = {
  // 文件夹
  Folder,
  FolderOpen,
  
  // 基础导航
  Home,
  Settings,
  
  // 布局
  LayoutGrid,
  LayoutList,
  
  // 文件
  FileText,
  Files,
  Edit,
  
  // 知识与学习
  Book,
  BookOpen,
  Brain,
  
  // 技术
  Network,
  Box,
  Code,
  Database,
  Cloud,
  Laptop,
  
  // 通信
  Mail,
  MessageSquare,
  Link,
  
  // 全球化
  Globe,
  Map,
  Flag,
  
  // 媒体
  Image,
  Video,
  Music,
  Palette,
  
  // 用户
  User,
  Users,
  Shield,
  
  // 商业
  Building,
  Briefcase,
  BarChart,
  Target,
  
  // 其他
  Star,
  Bell,
  Calendar,
  Search,
  Zap,
  Heart,
  Coffee
}

export type IconType = keyof typeof navigationIcons
