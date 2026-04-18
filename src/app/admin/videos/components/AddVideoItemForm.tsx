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
import { NavigationSubItem, VideoConfig } from "@/types/navigation"
import { Icons } from "@/components/icons"
import { Textarea } from "@/registry/new-york/ui/textarea"
import { Switch } from "@/registry/new-york/ui/switch"
import { useState, useEffect } from "react"
import { useToast } from "@/registry/new-york/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/new-york/ui/select"
import { VideoIconUpload } from "./VideoIconUpload"

const videoConfigSchema = z.object({
    type: z.enum(['bilibili', 'youtube']),
    videoId: z.string().optional(),
    bvid: z.string().optional(),
    aid: z.string().optional(),
    cid: z.string().optional(),
    p: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
})

const formSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(2, { message: "标题至少需要2个字符" }),
    href: z.string().url({ message: "请输入有效的网站链接" }),
    icon: z.string().optional(),
    description: z.string().optional(),
    enabled: z.boolean().default(true),
    videoConfig: videoConfigSchema.optional(),
    useVideoConfig: z.boolean().default(false),
})

interface AddVideoItemFormProps {
    onSubmit: (values: NavigationSubItem) => Promise<void>
    onCancel: () => void
    defaultValues?: NavigationSubItem
}

export function AddVideoItemForm({ onSubmit, onCancel, defaultValues }: AddVideoItemFormProps) {
    const { toast } = useToast()

    const hasVideoConfig = !!defaultValues?.videoConfig

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: defaultValues?.id || String(Date.now()),
            title: defaultValues?.title || "",
            href: defaultValues?.href || "",
            icon: defaultValues?.icon || "",
            description: defaultValues?.description || "",
            enabled: defaultValues?.enabled ?? true,
            videoConfig: defaultValues?.videoConfig || { type: 'bilibili' },
            useVideoConfig: hasVideoConfig
        }
    })

    const isSubmitting = form.formState.isSubmitting
    const [isUploading, setIsUploading] = useState(false)

    const useVideoConfig = form.watch("useVideoConfig")
    const videoType = form.watch("videoConfig.type")

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

    const fetchWebsiteMetadata = async (url: string, force: boolean = false) => {
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

            // 标题和描述：如果是强制刷新或当前为空，则更新
            if (force || !form.getValues('title')) {
                if (metadata.title) form.setValue('title', metadata.title)
            }
            if (force || !form.getValues('description')) {
                if (metadata.description) form.setValue('description', metadata.description)
            }

            // 图标/封面：
            // 1. 优先使用 og:image
            // 2. 更新条件：强制刷新 OR 当前为空 OR (当前是远程链接且新的是本地链接)
            const iconUrl = metadata.image || metadata.icon
            const currentIcon = form.getValues('icon')

            if (iconUrl) {
                if (force || !currentIcon || (currentIcon.startsWith('http') && iconUrl.startsWith('/'))) {
                    form.setValue('icon', iconUrl)
                }
            }

            // 自动填充嵌入播放配置
            if (metadata.videoConfig) {
                const config = metadata.videoConfig
                // 启用嵌入播放
                form.setValue('useVideoConfig', true)
                form.setValue('videoConfig.type', config.type)

                if (config.type === 'bilibili') {
                    if (config.bvid) form.setValue('videoConfig.bvid', config.bvid)
                    if (config.aid) form.setValue('videoConfig.aid', config.aid)
                    if (config.cid) form.setValue('videoConfig.cid', config.cid)
                    if (config.p) form.setValue('videoConfig.p', config.p)
                } else if (config.type === 'youtube') {
                    if (config.videoId) form.setValue('videoConfig.videoId', config.videoId)
                }
            }

            toast({
                title: "成功",
                description: "已自动获取视频信息"
            })
        } catch (error) {
            console.error('Failed to fetch website metadata:', error)
            toast({
                title: "提示",
                description: "自动获取视频信息失败，请手动填写",
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
                        enabled: data.enabled,
                        videoConfig: data.useVideoConfig ? data.videoConfig : undefined
                    }
                    await onSubmit(values)
                } catch (error) {
                    console.error('保存失败:', error)
                    toast({
                        title: "保存失败",
                        description: "请重试",
                        variant: "destructive"
                    })
                }
            })} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">

                <FormField
                    control={form.control}
                    name="href"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>视频链接</FormLabel>
                            <FormControl>
                                <div className="flex items-center space-x-2">
                                    <div className="relative flex-1">
                                        <Input placeholder="输入视频链接" {...field} />
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
                                        onClick={() => fetchWebsiteMetadata(field.value, true)}
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
                                输入视频链接，系统将自动获取标题、描述和封面（封面会自动下载并上传）
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
                            <FormLabel>视频标题</FormLabel>
                            <FormControl>
                                <Input placeholder="视频标题" {...field} />
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
                                <VideoIconUpload value={field.value || ''} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>描述</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="视频描述"
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
                    name="useVideoConfig"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    嵌入播放配置
                                </FormLabel>
                                <FormDescription>
                                    启用后支持在当前页面直接播放视频
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

                {useVideoConfig && (
                    <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
                        <FormField
                            control={form.control}
                            name="videoConfig.type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>视频平台</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="选择平台" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="bilibili">Bilibili</SelectItem>
                                            <SelectItem value="youtube">YouTube</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {videoType === 'bilibili' && (
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="videoConfig.bvid"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>BV号 (bvid)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="BV..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="videoConfig.aid"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>AV号 (aid)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="aid" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="videoConfig.cid"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>CID</FormLabel>
                                            <FormControl>
                                                <Input placeholder="cid" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="videoConfig.p"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>分P (page)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {videoType === 'youtube' && (
                            <FormField
                                control={form.control}
                                name="videoConfig.videoId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Video ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="YouTube Video ID" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="enabled"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    启用状态
                                </FormLabel>
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

                <div className="flex justify-end space-x-2 pt-4">
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
