'use client'

export const runtime = 'edge'

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/registry/new-york/ui/card"
import { Input } from "@/registry/new-york/ui/input"
import { Button } from "@/registry/new-york/ui/button"
import { useToast } from "@/registry/new-york/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/new-york/ui/tabs"
import { Icons } from "@/components/icons"
import { Textarea } from "@/registry/new-york/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/new-york/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/new-york/ui/form"
import { SiteConfigService} from "@/services/siteConfigService"
import type { SiteConfig } from "@/types/site"
import { Toaster } from "@/registry/new-york/ui/toaster"

const formSchema = z.object({
  basic: z.object({
    title: z.string().min(2, {
      message: "标题至少需要2个字符.",
    }),
    description: z.string().min(10, {
      message: "描述至少需要10个字符.",
    }),
    keywords: z.string(),
  }),
  appearance: z.object({
    logo: z.string().regex(/^(https?:\/\/|\/)\S+$/i, {
      message: "请输入有效的URL地址或相对路径",
    }),
    favicon: z.string().regex(/^(https?:\/\/|\/)\S+$/i, {
      message: "请输入有效的URL地址或相对路径",
    }),
    theme: z.enum(['light', 'dark', 'system']),
  }),
  navigation: z.object({
    linkTarget: z.enum(['_blank', '_self']),
  }),
})

export default function SiteSettings() {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      basic: {
        title: "",
        description: "",
        keywords: "",
      },
      appearance: {
        logo: "",
        favicon: "",
        theme: "system",
      },
      navigation: {
        linkTarget: "_blank",
      },
    },
  })

  useEffect(() => {
    const loadConfig = async () => {
      const siteConfigService = new SiteConfigService();
      const config = await siteConfigService.getSiteConfig();
      if (config) {
        form.reset(config);
      }
    }
    loadConfig()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const siteConfigService = new SiteConfigService();
      await siteConfigService.updateSiteConfig(values);
      toast({
        title: "成功",
        description: "站点信息已保存",
      });
    } catch (error) {
      toast({
        title: "错误",
        description: "保存失败",
        variant: "destructive",
      });
    }
  }

  return (
    <>
      <div className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="appearance">外观设置</TabsTrigger>
            <TabsTrigger value="navigation">导航设置</TabsTrigger>
          </TabsList>
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="basic.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>网站标题</FormLabel>
                          <FormControl>
                            <Input placeholder="输入网站标题" {...field} />
                          </FormControl>
                          <FormDescription>
                            这将显示在浏览器标签页和搜索结果中
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="basic.description"
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
                          <FormDescription>
                            这将显示在搜索结果中
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="basic.keywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>关键词</FormLabel>
                          <FormControl>
                            <Input placeholder="输入关键词，用英文逗号分隔" {...field} />
                          </FormControl>
                          <FormDescription>
                            用于搜索引擎优化，多个关键词请用英文逗号分隔
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-start">
                      <Button 
                        type="submit"
                        className="w-[120px]"
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? (
                          <>
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            保存中
                          </>
                        ) : (
                          <>
                            <Icons.save className="mr-2 h-4 w-4" />
                            保存更改
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>外观设置</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="appearance.logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input placeholder="输入Logo图片URL" {...field} />
                          </FormControl>
                          <FormDescription>
                            建议尺寸: 160x64px
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="appearance.favicon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Favicon URL</FormLabel>
                          <FormControl>
                            <Input placeholder="输入网站图标URL" {...field} />
                          </FormControl>
                          <FormDescription>
                            建议尺寸: 32x32px
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-start">
                      <Button 
                        type="submit"
                        className="w-[120px]"
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? (
                          <>
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            保存中
                          </>
                        ) : (
                          <>
                            <Icons.save className="mr-2 h-4 w-4" />
                            保存更改
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="navigation">
            <Card>
              <CardHeader>
                <CardTitle>导航设置</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="navigation.linkTarget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>链接打开方式</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择链接打开方式" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="_blank">新窗口打开 (_blank)</SelectItem>
                              <SelectItem value="_self">当前窗口打开 (_self)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            设置首页中点击网站链接时的打开方式，默认为新窗口打开
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-start">
                      <Button 
                        type="submit"
                        className="w-[120px]"
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? (
                          <>
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            保存中
                          </>
                        ) : (
                          <>
                            <Icons.save className="mr-2 h-4 w-4" />
                            保存更改
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </>
  )
} 