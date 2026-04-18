import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { resolveIconPath } from "@/types/navigation"

interface ResourceCardProps {
  title: string
  description?: string
  icon?: string
  url: string
  className?: string
}

export default function ResourceCard({
  title,
  description,
  icon,
  url,
  className
}: ResourceCardProps) {
  // 使用 resolveIconPath 解析图标路径
  const resolvedIcon = resolveIconPath(icon)

  return (
    <Link href={url} target="_blank" className={cn("block", className)}>
      <div className="group relative rounded-lg border p-6 hover:border-foreground">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {resolvedIcon && (
              <div className="relative h-8 w-8">
                <Image
                  src={resolvedIcon}
                  alt={title}
                  className="object-contain"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={(e) => {
                    console.warn(`Failed to load icon for ${title}:`, resolvedIcon)
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
            <h3 className="font-semibold">{title}</h3>
          </div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
        )}
      </div>
    </Link>
  )
}