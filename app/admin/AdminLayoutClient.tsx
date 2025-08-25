'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Button } from "@/registry/new-york/ui/button"
import { Separator } from "@/registry/new-york/ui/separator"
import {
  LayoutDashboard,
  ListTodo,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Home,
  Moon,
  Sun,
  Monitor,
  Database,
} from "lucide-react"
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/registry/new-york/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/registry/new-york/ui/avatar"
import { useTheme } from "next-themes"

interface AdminLayoutClientProps {
  children: React.ReactNode
  user: any
}

const menuItems = [
  {
    title: "仪表盘",
    href: "/admin",
    icon: LayoutDashboard
  },
  {
    title: "导航管理",
    href: "/admin/navigation",
    icon: ListTodo,
    subItems: [
      {
        title: "分类管理",
        href: "/admin/navigation"
      },
      {
        title: "站点管理",
        href: "/admin/sitelist"
      }
    ]
  },
  {
    title: "资源管理",
    href: "/admin/resources",
    icon: Settings,
    subItems: [
      {
        title: "资源管理",
        href: "/admin/resources"
      },{
        title: "网站图标下载",
        href: "/admin/resources/download"
      }
    ]
  },
  {
    title: "数据管理",
    href: "/admin/data",
    icon: Database
  },
  {
    title: "站点设置",
    href: "/admin/site",
    icon: Settings,
    onClick: undefined
  }
]

export function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const { setTheme } = useTheme()

  const toggleMenuItem = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  return (
    <div className="hidden md:block h-screen">
      <div className="h-full border-t">
        <div className="h-full bg-background">
          <div className={cn(
            "h-full grid transition-all duration-300",
            isSidebarCollapsed ? "lg:grid-cols-[80px_minmax(0,1fr)]" : "lg:grid-cols-[240px_minmax(0,1fr)]"
          )}>
            <div className="relative hidden lg:block">
              <div className={cn(
                "fixed top-0 bottom-0 z-20 flex flex-col bg-background border-r shadow-sm",
                isSidebarCollapsed ? "w-[80px]" : "w-[240px]"
              )}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -right-3 top-[60px] z-50 border shadow-sm bg-background rounded-full hover:bg-muted w-6 h-6"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                >
                  {isSidebarCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronLeft className="h-3.5 w-3.5" />
                  )}
                </Button>

                <div className="flex flex-col flex-1">
                  <div className="px-3 py-4">
                    <div className="mb-4">
                      <Link
                        href="/admin"
                        className={cn(
                          "flex items-center",
                          isSidebarCollapsed ? "justify-center" : "px-2"
                        )}
                      >
                        <div className={cn(
                          "flex items-center gap-2",
                          isSidebarCollapsed && "flex-col"
                        )}>
                          <div className="relative w-8 h-8 overflow-hidden rounded-md">
                            <img
                              src="/assets/images/alogo.png"
                              alt="Logo"
                              className="object-cover"
                            />
                          </div>
                          {!isSidebarCollapsed && (
                            <div className="flex flex-col">
                              <span className="text-lg font-semibold leading-none tracking-tight">
                                NavSphere
                              </span>
                              <span className="text-xs text-muted-foreground mt-1">
                                管理控制台
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>

                    <Separator className="mb-4" />

                    <div className="px-3 flex-1">
                      {!isSidebarCollapsed && (
                        <h2 className="mb-3 px-2 text-lg font-semibold tracking-tight">
                          管理菜单
                        </h2>
                      )}
                      <nav className="grid gap-[2px]">
                        {menuItems.map((item) => (
                          <div key={item.href}>
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start",
                                pathname === item.href && "bg-muted"
                              )}
                              onClick={() => item.subItems && toggleMenuItem(item.href)}
                              asChild={!item.subItems}
                            >
                              {!item.subItems ? (
                                <Link href={item.href}>
                                  <item.icon className="mr-2 h-4 w-4" />
                                  {!isSidebarCollapsed && <span>{item.title}</span>}
                                </Link>
                              ) : (
                                <>
                                  <item.icon className="mr-2 h-4 w-4" />
                                  {!isSidebarCollapsed && (
                                    <>
                                      <span>{item.title}</span>
                                      <ChevronDown
                                        className={cn(
                                          "ml-auto h-4 w-4 transition-transform",
                                          expandedItems.includes(item.href) && "rotate-180"
                                        )}
                                      />
                                    </>
                                  )}
                                </>
                              )}
                            </Button>
                            {item.subItems && expandedItems.includes(item.href) && !isSidebarCollapsed && (
                              <div className="ml-4 mt-1 space-y-1">
                                {item.subItems.map((subItem) => (
                                  <Button
                                    key={subItem.href}
                                    variant="ghost"
                                    className={cn(
                                      "w-full justify-start pl-6",
                                      pathname === subItem.href && "bg-muted"
                                    )}
                                    asChild
                                  >
                                    <Link href={subItem.href}>
                                      {subItem.title}
                                    </Link>
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </nav>
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full h-auto p-2",
                          "hover:bg-muted transition-colors",
                          isSidebarCollapsed ? "justify-center" : "justify-start"
                        )}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.image || ''}
                              alt={user.name || ''}
                            />
                            <AvatarFallback>
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          {!isSidebarCollapsed && (
                            <div className="flex items-center flex-1 min-w-0">
                              <span className="text-sm font-medium leading-none truncate">
                                {user.name}
                              </span>
                              <div className="flex flex-col gap-[3px] ml-auto pl-4">
                                <div className="h-[3px] w-[2px] rounded-full bg-muted-foreground/40" />
                                <div className="h-[3px] w-[2px] rounded-full bg-muted-foreground/40" />
                                <div className="h-[3px] w-[2px] rounded-full bg-muted-foreground/40" />
                              </div>
                            </div>
                          )}
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align={isSidebarCollapsed ? "center" : "start"}
                      side="top"
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/"
                          className="cursor-pointer"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Home className="mr-2 h-4 w-4" />
                          前台首页
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                          <Moon className="absolute h-4 w-4 mr-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                          <span className="ml-2">主题</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => setTheme("light")}>
                            <Sun className="h-4 w-4 mr-2" />
                            浅色
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme("dark")}>
                            <Moon className="h-4 w-4 mr-2" />
                            深色
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme("system")}>
                            <Monitor className="h-4 w-4 mr-2" />
                            跟随系统
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer flex items-center text-red-600 focus:text-red-600 focus:bg-red-100"
                        onClick={() => signOut({ callbackUrl: '/' })}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        退出登录
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            <main className="relative lg:pl-[80px] xl:pl-0 h-full">
              <div className="h-full overflow-auto">
                <div className="p-6">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
} 