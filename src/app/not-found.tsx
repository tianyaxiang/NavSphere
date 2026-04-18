'use client'

import Link from 'next/link'
import { Button } from "@/registry/new-york/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <h2 className="text-4xl font-bold text-primary mb-4">404</h2>
      <p className="text-xl text-muted-foreground mb-6">Page Not Found</p>
      <Button asChild variant="default">
        <Link href="/">
          Return Home
        </Link>
      </Button>
    </div>
  )
}
