'use client'

import { NavigationToggle } from './NavigationToggle'
import { NavigationLink } from './NavigationLink'
import type { NavigationSubItem } from '@/types/navigation'

interface NavigationItemProps {
  id: string
  title: string
  icon?: string
  items?: NavigationSubItem[]
}

export function NavigationItem({ id, title, icon, items = [] }: NavigationItemProps) {
  if (!items?.length) {
    return (
      <li>
        <NavigationLink href={`#${id}`}>
          <i className={icon}></i>
          <span>{title}</span>
        </NavigationLink>
      </li>
    )
  }

  return (
    <li>
      <NavigationToggle icon={icon} title={title}>
        <ul>
          {items.map(subItem => (
            <li key={subItem.href}>
              <NavigationLink href={subItem.href}>
                <span>{subItem.title}</span>
              </NavigationLink>
            </li>
          ))}
        </ul>
      </NavigationToggle>
    </li>
  )
} 