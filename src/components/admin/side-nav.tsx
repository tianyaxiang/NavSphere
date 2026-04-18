import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Settings,
  Menu as MenuIcon,
  Database
} from "lucide-react"

const sidebarNavItems = [
  {
    title: "控制台",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "站点设置",
    href: "/admin/site",
    icon: Settings,
  },
  {
    title: "导航管理",
    href: "/admin/navigation",
    icon: MenuIcon,
  },
  {
    title: "资源管理",
    href: "/admin/resources",
    icon: Database,
  },
]

type SideNavProps = React.HTMLAttributes<HTMLDivElement>

export function SideNav({ className, ...props }: SideNavProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 border-r h-screen", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <h2 className="mb-2 px-4 text-xl font-semibold tracking-tight">
              管理菜单
            </h2>
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="space-y-1">
                {sidebarNavItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Link>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
} 