'use client'

import { useState } from 'react'

interface NavigationToggleProps {
  icon?: string
  title: string
  children: React.ReactNode
}

export function NavigationToggle({ icon, title, children }: NavigationToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center w-full"
      >
        <div className="menu-title">
          {icon && <i className={icon}></i>}
          <span>{title}</span>
        </div>
        <i className={`fas fa-angle-${isExpanded ? 'down' : 'right'} menu-arrow`}></i>
      </button>
      {isExpanded && children}
    </div>
  )
} 