'use client'

import { useState } from 'react'
import Link from 'next/link'

interface NavigationButtonProps {
  id: string
  title: string
  icon: string
  items?: Array<{
    title: string
    href: string
  }>
}

export function NavigationButton({ id, title, icon, items }: NavigationButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!items?.length) {
    return (
      <Link href={`#${id}`} className="flex items-center w-full">
        <i className={icon}></i>
        <span>{title}</span>
      </Link>
    )
  }

  return (
    <div>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center w-full"
      >
        <div className="menu-title">
          <i className={icon}></i>
          <span>{title}</span>
        </div>
        <i className={`fas fa-angle-${isExpanded ? 'down' : 'right'} menu-arrow`}></i>
      </button>
      {isExpanded && (
        <ul>
          {items.map(subItem => (
            <li key={subItem.href}>
              <Link href={subItem.href}>
                <span>{subItem.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
} 