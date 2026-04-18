import Link from "next/link"
import { cn } from "@/lib/utils"
import Image from "next/image"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link href="/admin" className="flex items-center space-x-2">
        <Image
          src="/assets/images/logo@2x.png"
          alt="Logo"
          width={120}
          height={40}
          className="h-8 w-auto"
        />
      </Link>
    </nav>
  )
} 