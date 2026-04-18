'use client'

import { Button } from "@/registry/new-york/ui/button"
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-6">{error.message}</p>
      <Button
        onClick={() => reset()}
        variant="default"
      >
        Try again
      </Button>
    </div>
  )
}
