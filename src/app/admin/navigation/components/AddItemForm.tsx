'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/registry/new-york/ui/button"
import { Input } from "@/registry/new-york/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/registry/new-york/ui/form"
import { NavigationSubItem } from "@/types/navigation"
import { Icons } from "@/components/icons"
import { Textarea } from "@/registry/new-york/ui/textarea"
import { Switch } from "@/registry/new-york/ui/switch"
import { useState, useEffect } from "react"
import { useToast } from "@/registry/new-york/hooks/use-toast"

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, { message: "网站标题至少需要2个字符" }),
  href: z.string().url({ message: "请输入有效的网站链接" }),
  icon: z.string().optional(),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
})

interface AddItemFormProps {
  onSubmit: (values: NavigationSubItem) => Promise<void>
  onCancel: () => void
  defaultValues?: NavigationSubItem
}

export function AddItemForm({ onSubmit, onCancel, defaultValues }: AddItemFormProps) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      id: String(Date.now()),
      title: "",
      href: "",
      icon: "",
      description: "",
      enabled: true,
    }
  })

  const isSubmitting = form.formState.isSubmitting
  const [isUploading, setIsUploading] = useState(false)
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false)

  // 监听 href 字段变化，自动获取网站信息
  const hrefValue = form.watch("href")

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (hrefValue && isValidUrl(hrefValue) && !defaultValues) {
        fetchWebsiteMetadata(hrefValue)
      }
    }, 1000) // 延迟1秒执行，避免频繁请求

    return () => clearTimeout(timeoutId)
  }, [hrefValue, defaultValues])

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const fetchWebsiteMetadata = async (url: string) => {
    if (isFetchingMetadata) return

    setIsFetchingMetadata(true)
    try {
      const response = await fetch('/api/website-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error('获取网站信息失败')
      }

      const metadata = await response.json()

      // 只在字段为空时自动填充
      if (!form.getValues('title')) {
        form.setValue('title', metadata.title)
      }
      if (!form.getValues('description')) {
        form.setValue('description', metadata.description)
      }
      if (!form.getValues('icon') && metadata.icon) {
        form.setValue('icon', metadata.icon)
      }

      toast({
        title: "成功",
        description: "已自动获取网站信息"
      })
    } catch (error) {
      console.error('Failed to fetch website metadata:', error)
      toast({
        title: "提示",
        description: "自动获取网站信息失败，请手动填写",
        variant: "destructive"
      })
    } finally {
      setIsFetchingMetadata(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(async (data) => {
        try {
          const values: NavigationSubItem = {
            id: data.id || crypto.randomUUID(),
            title: data.title,
            href: data.href,
            description: data.description,
            icon: data.icon,
            enabled: data.enabled
          }
          await onSubmit(values)
        } catch (error) {
          console.error('保存失败:', error)
        }
      })} className="space-y-4">
        <FormField
          control={form.control}
          name="href"
          render={({ field }) => (
            <FormItem>
              <FormLabel>网站链接</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Input placeholder="输入网站链接，将自动获取网站信息" {...field} />
                    {isFetchingMetadata && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Icons.loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!field.value || !isValidUrl(field.value) || isFetchingMetadata}
                    onClick={() => fetchWebsiteMetadata(field.value)}
                  >
                    {isFetchingMetadata ? (
                      <Icons.loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icons.refresh className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                输入完整的网站链接后，系统将自动获取网站标题、描述和图标
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>网站标题</FormLabel>
              <FormControl>
                <Input placeholder="网站标题（可自动获取）" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>图标</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="图标URL（可自动获取）"
                      {...field}
                    />
                    {field.value && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <img
                          src={field.value}
                          alt="图标预览"
                          className="w-4 h-4 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="relative"
                    disabled={isUploading}
                    onClick={() => {
                      const fileInput = document.getElementById('icon-upload');
                      fileInput?.click();
                    }}
                  >
                    {isUploading ? (
                      <>
                        <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
                        上传中...
                      </>
                    ) : (
                      <>
                        <Icons.upload className="mr-2 h-4 w-4" />
                        上传图片
                      </>
                    )}
                    <input
                      id="icon-upload"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            setIsUploading(true);

                            // 将文件转换为 base64
                            const base64 = await new Promise<string>((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = () => resolve(reader.result as string);
                              reader.onerror = reject;
                              reader.readAsDataURL(file);
                            });

                            const response = await fetch('/api/resource', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                image: base64 // 直接发送 base64 字符串
                              }),
                            });

                            if (!response.ok) {
                              throw new Error(`上传失败: ${response.status} ${response.statusText}`);
                            }

                            const data = await response.json();

                            if (data.imageUrl) {
                              field.onChange(`${data.imageUrl}`); // 使用返回的图片URL
                            } else {
                              throw new Error('未获取到上传后的图片URL');
                            }

                          } catch (error) {
                            console.error('上传失败:', error);
                            alert(error instanceof Error ? error.message : '上传失败，请重试');
                          } finally {
                            setIsUploading(false);
                            // 清空文件输入
                            const fileInput = document.getElementById('icon-upload') as HTMLInputElement;
                            if (fileInput) {
                              fileInput.value = '';
                            }
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                系统会自动获取网站图标，也可手动输入URL或上传本地图片
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>网站描述</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="输入网站描述"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  启用状态
                </FormLabel>
                <FormDescription>
                  设置该导航项是否启用
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            取消
          </Button>
        </div>
      </form>
    </Form>
  )
}