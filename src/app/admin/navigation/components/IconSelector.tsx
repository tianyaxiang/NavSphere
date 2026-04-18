'use client'

import * as React from 'react'
import { Button } from "@/registry/new-york/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/registry/new-york/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/new-york/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { navigationIcons, type IconType } from '@/lib/icons'

interface IconSelectorProps {
  value?: string
  onChange: (value: string) => void
}

export function IconSelector({ value, onChange }: IconSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // 获取当前选中的图标组件
  const SelectedIcon = value && navigationIcons[value as IconType] 
    ? navigationIcons[value as IconType] 
    : null

  // 过滤图标
  const filteredIcons = Object.entries(navigationIcons)
    .filter(([name]) => 
      name.toLowerCase().includes(searchQuery.toLowerCase())
    )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
            <span>{value || "选择图标"}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="搜索图标..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty>没有找到图标</CommandEmpty>
          <div className="max-h-[200px] overflow-y-scroll">
            <CommandGroup>
              {filteredIcons.map(([name]) => (
                <CommandItem
                  key={name}
                  value={name}
                  onSelect={(currentValue) => {
                    onChange(currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {React.createElement(navigationIcons[name as IconType], { className: "mr-2 h-4 w-4" })}
                  {name}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
