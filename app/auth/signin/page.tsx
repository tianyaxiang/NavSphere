'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { useState, Suspense } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function SignInContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/admin'
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      await signIn('github', {
        callbackUrl,
        redirect: true,
        scope: 'repo'
      })
    } catch (error) {
      setIsLoading(false)
      console.error('登录失败:', error)
    }
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 overflow-hidden rounded-md">
              <img 
                src="/assets/images/alogo.png" 
                alt="Logo"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold leading-none tracking-tight text-white">
                NavSphere
              </span>
            </div>
          </div>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;这是一个专为程序员设计的导航网站，集成了常用的开发工具、学习资源和技术社区。&rdquo;
            </p>
            <footer className="text-sm">NavSphere Team</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex h-full w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                登录管理后台
              </CardTitle>
              <CardDescription className="text-center">
                使用 GitHub 账号登录以访问管理功能
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button
                onClick={handleSignIn}
                className="w-full bg-[#24292F] hover:bg-[#24292F]/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    登录中...
                  </>
                ) : (
                  <>
                    <Icons.github className="mr-2 h-4 w-4" />
                    GitHub 账号登录
                  </>
                )}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-center gap-2">
              <div className="text-sm text-muted-foreground">
                通过登录，即表示您同意我们的{" "}
                <a
                  href="/terms"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  服务条款
                </a>{" "}
                和{" "}
                <a
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  隐私政策
                </a>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
} 