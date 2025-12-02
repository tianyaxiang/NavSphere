'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/registry/new-york/ui/input'
import { Command, CommandList, CommandGroup, CommandItem } from '@/registry/new-york/ui/command'
import { Search, X } from 'lucide-react'
import { Button } from '@/registry/new-york/ui/button'
import type { NavigationData, NavigationItem, NavigationSubItem } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'

interface SearchBarProps {
  navigationData: NavigationData
  onSearch: (query: string) => void
  searchResults: Array<{
    category: NavigationItem
    items: (NavigationItem | NavigationSubItem)[]
    subCategories: Array<{
      title: string
      items: (NavigationItem | NavigationSubItem)[]
    }>
  }>
  searchQuery: string
  siteConfig?: SiteConfig
}

export function SearchBar({ onSearch, searchResults, searchQuery, siteConfig }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFocused(false)
        inputRef.current?.blur()
      }
      
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        setIsFocused(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const highlightText = (text: string) => {
    if (!searchQuery) return text
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? 
        <span key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</span> : part
    )
  }

  const handleInputChange = (value: string) => {
    onSearch(value)
    setIsFocused(true)
  }

  const handleItemSelect = (item: NavigationItem | NavigationSubItem) => {
    const itemWithHref = item as NavigationSubItem
    if (itemWithHref.href) {
      const linkTarget = siteConfig?.navigation?.linkTarget || '_blank'
      if (linkTarget === '_self') {
        window.location.href = itemWithHref.href
      } else {
        window.open(itemWithHref.href, linkTarget)
      }
    }
    onSearch('')
    setIsFocused(false)
  }

  const clearSearch = () => {
    onSearch('')
    setIsFocused(false)
    inputRef.current?.focus()
  }

  const showResults = isFocused && searchQuery.trim().length > 0

  return (
    <div ref={searchRef} className="relative w-full max-w-lg mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="搜索导航..."
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="pl-10 pr-20 h-10 rounded-lg border shadow-sm"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <kbd className="hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs text-muted-foreground opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-xl z-50 max-h-[70vh] overflow-hidden">
          <Command className="border-0 shadow-none">
            <CommandList className="max-h-[70vh] overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="text-muted-foreground text-sm">
                    未找到与 &ldquo;<span className="font-medium">{searchQuery}</span>&rdquo; 相关的导航
                  </div>
                  <div className="text-xs text-muted-foreground/70 mt-1">
                    尝试使用不同的关键词搜索
                  </div>
                </div>
              ) : (
                searchResults.map((result) => (
                  <CommandGroup key={result.category.id} heading={result.category.title}>
                    {result.items.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.title}
                        onSelect={() => handleItemSelect(item)}
                        className="flex items-center gap-3 py-3 px-3 cursor-pointer hover:bg-accent/50"
                      >
                        <div className="flex-shrink-0 w-8 h-8">
                          {item.icon && (
                            <img
                              src={item.icon}
                              alt={`${item.title} icon`}
                              className="w-full h-full object-contain rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          )}
                        </div>
                        <div className="flex flex-col flex-1 gap-1">
                          <span className="text-sm font-medium">
                            {highlightText(item.title)}
                          </span>
                          {item.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {highlightText(item.description)}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                    {result.subCategories.map((sub) => (
                      <div key={sub.title}>
                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/30 border-b">
                          {result.category.title} / {sub.title}
                        </div>
                        {sub.items.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.title}
                            onSelect={() => handleItemSelect(item)}
                            className="flex items-center gap-3 py-3 px-3 cursor-pointer hover:bg-accent/50"
                          >
                            <div className="flex-shrink-0 w-8 h-8">
                              {item.icon && (
                                <img
                                  src={item.icon}
                                  alt={`${item.title} icon`}
                                  className="w-full h-full object-contain rounded"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                  }}
                                />
                              )}
                            </div>
                            <div className="flex flex-col flex-1 gap-1">
                              <span className="text-sm font-medium">
                                {highlightText(item.title)}
                              </span>
                              {item.description && (
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                  {highlightText(item.description)}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </div>
                    ))}
                  </CommandGroup>
                ))
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}