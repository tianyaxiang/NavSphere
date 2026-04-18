"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

export const icons = [
  { value: "linecons-star", label: "星标", category: "常用" },
  { value: "linecons-desktop", label: "桌面", category: "常用" },
  { value: "linecons-params", label: "工具", category: "常用" },
  { value: "linecons-note", label: "笔记", category: "常用" },
  { value: "linecons-mail", label: "邮件", category: "常用" },
  { value: "linecons-data", label: "数据", category: "常用" },
  { value: "linecons-cloud", label: "云端", category: "常用" },
  { value: "linecons-lab", label: "实验", category: "常用" },
  { value: "linecons-fire", label: "火热", category: "常用" },
  { value: "linecons-clip", label: "剪贴", category: "常用" },
  // 开发工具
  { value: "linecons-code", label: "代码", category: "开发" },
  { value: "linecons-git", label: "Git", category: "开发" },
  { value: "linecons-terminal", label: "终端", category: "开发" },
  { value: "linecons-database", label: "数据库", category: "开发" },
  { value: "linecons-api", label: "API", category: "开发" },
  // 设计
  { value: "linecons-palette", label: "调色板", category: "设计" },
  { value: "linecons-image", label: "图片", category: "设计" },
  { value: "linecons-vector", label: "矢量", category: "设计" },
  { value: "linecons-brush", label: "画笔", category: "设计" },
  // 媒体
  { value: "linecons-video", label: "视频", category: "媒体" },
  { value: "linecons-music", label: "音乐", category: "媒体" },
  { value: "linecons-camera", label: "相机", category: "媒体" },
  // 其他
  { value: "linecons-book", label: "书籍", category: "其他" },
  { value: "linecons-link", label: "链接", category: "其他" },
  { value: "linecons-heart", label: "喜欢", category: "其他" },
  { value: "linecons-tag", label: "标签", category: "其他" },
]

interface IconItem {
  value: string
  label: string
  category: string
}

interface IconPickerProps {
  value: string
  onChange: (value: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value)
  const [searchValue, setSearchValue] = React.useState("")

  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  // 按分类分组图标
  const groupedIcons = React.useMemo(() => {
    const filtered = icons.filter((icon) => {
      const search = searchValue.toLowerCase()
      return (
        icon.label.toLowerCase().includes(search) ||
        icon.value.toLowerCase().includes(search) ||
        icon.category.toLowerCase().includes(search)
      )
    })

    return filtered.reduce<Record<string, IconItem[]>>((groups, icon) => {
      const category = icon.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(icon)
      return groups
    }, {})
  }, [searchValue])

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            <div className="flex items-center gap-2">
              <i className={value} />
              <span className="truncate">
                {icons.find((icon) => icon.value === value)?.label ?? value}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="搜索图标..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandEmpty>未找到图标</CommandEmpty>
            <div className="max-h-[300px] overflow-auto">
              {Object.entries(groupedIcons).map(([category, items]) => (
                <CommandGroup key={category} heading={category}>
                  {items.map((icon) => (
                    <CommandItem
                      key={icon.value}
                      value={icon.value}
                      onSelect={(currentValue) => {
                        onChange(currentValue)
                        setOpen(false)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Check
                          className={cn(
                            "h-4 w-4",
                            value === icon.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <i className={icon.value} />
                        <span>{icon.label}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </div>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
          onChange(e.target.value)
        }}
        placeholder="自定义图标类名"
        className="w-[200px]"
      />
    </div>
  )
} 