'use client'

import Link from 'next/link'

interface NavigationLinkProps {
  href: string
  children: React.ReactNode
}

export function NavigationLink({ href, children }: NavigationLinkProps) {
  return (
    <Link href={href} className="flex items-center w-full">
      {children}
    </Link>
  )
} 