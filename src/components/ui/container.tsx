interface ContainerProps {
  children: React.ReactNode
}

export function Container({ children }: ContainerProps) {
  return (
    <div className="mx-auto w-full max-w-screen-2xl px-2.5 md:px-20">
      {children}
    </div>
  )
} 