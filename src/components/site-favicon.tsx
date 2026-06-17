'use client'

import { useState, useEffect } from 'react'
import { LetterAvatar } from './letter-avatar'

interface SiteFaviconProps {
  title: string
  icon?: string
  useDefaultIcon?: boolean
  className?: string
}

// useDefaultIcon === true、无 icon、或图片加载失败 → 显示首字母色块;否则显示 <img>。
export function SiteFavicon({ title, icon, useDefaultIcon, className }: SiteFaviconProps) {
  const [errored, setErrored] = useState(false)

  // icon 变化时重置错误态(同一组件实例复用于不同 item 时)
  useEffect(() => {
    setErrored(false)
  }, [icon])

  if (useDefaultIcon || !icon || errored) {
    return <LetterAvatar title={title} className={className} />
  }

  return (
    <img
      src={icon}
      alt={`${title} icon`}
      className={className}
      onError={() => setErrored(true)}
    />
  )
}
