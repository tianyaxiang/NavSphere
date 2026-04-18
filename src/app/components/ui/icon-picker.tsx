'use client'

import { useState } from 'react'
import { Button } from "@/registry/new-york/ui/button"
import { Input } from "@/registry/new-york/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york/ui/popover"
import { cn } from "@/lib/utils"

const ICONS = [
  { name: 'linecons-star', label: '星星' },
  { name: 'linecons-desktop', label: '桌面' },
  { name: 'linecons-database', label: '数据库' },
  { name: 'linecons-inbox', label: '收件箱' },
  { name: 'linecons-globe', label: '地球' },
  { name: 'linecons-cloud', label: '云' },
  { name: 'linecons-paper-plane', label: '纸飞机' },
  { name: 'linecons-search', label: '搜索' },
  // 添加更多图标...
]

interface IconPickerProps {
  value: string
  onChange: (value: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? (
            <>
              <i className={cn("mr-2 h-4 w-4", value)} />
              {ICONS.find(icon => icon.name === value)?.label || value}
            </>
          ) : (
            "选择图标..."
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <div className="grid grid-cols-3 gap-2 p-4">
          {ICONS.map(icon => (
            <Button
              key={icon.name}
              variant="ghost"
              size="sm"
              className={cn(
                "justify-start",
                value === icon.name && "bg-muted"
              )}
              onClick={() => {
                onChange(icon.name)
                setOpen(false)
              }}
            >
              <i className={cn("mr-2 h-4 w-4", icon.name)} />
              <span className="text-xs">{icon.label}</span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
} 