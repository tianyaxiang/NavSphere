'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/registry/new-york/ui/button"
import { Input } from "@/registry/new-york/ui/input"
import { Textarea } from "@/registry/new-york/ui/textarea"
import { Label } from "@/registry/new-york/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/registry/new-york/ui/select"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/registry/new-york/ui/card"
import { Alert, AlertDescription } from "@/registry/new-york/ui/alert"
import { Loader2, CheckCircle, XCircle, Send, Globe, FileText, Tag } from 'lucide-react'
import type { NavigationData, NavigationItem, NavigationCategory } from '@/types/navigation'
import type { SubmissionData, SubmissionResponse } from '@/types/submission'

interface SubmissionFormProps {
    navigationData: NavigationData
}

export function SubmissionForm({ navigationData }: SubmissionFormProps) {
    const [formData, setFormData] = useState<SubmissionData>({
        title: '',
        url: '',
        description: '',
        category: '',
        subcategory: '',
        submitterNote: ''
    })

    const [subCategories, setSubCategories] = useState<NavigationCategory[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<SubmissionResponse | null>(null)

    // 当主分类变化时，更新子分类列表
    useEffect(() => {
        if (formData.category) {
            const selectedCategory = navigationData.navigationItems.find(
                item => item.id === formData.category
            )
            if (selectedCategory?.subCategories && selectedCategory.subCategories.length > 0) {
                setSubCategories(selectedCategory.subCategories)
            } else {
                setSubCategories([])
                setFormData(prev => ({ ...prev, subcategory: '' }))
            }
        } else {
            setSubCategories([])
        }
    }, [formData.category, navigationData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setResult(null)

        try {
            const response = await fetch('/api/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            const data: SubmissionResponse = await response.json()
            setResult(data)

            if (data.success) {
                // 清空表单
                setFormData({
                    title: '',
                    url: '',
                    description: '',
                    category: '',
                    subcategory: '',
                    submitterNote: ''
                })
            }
        } catch (error) {
            setResult({
                success: false,
                message: '网络错误，请稍后重试'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto border-0 shadow-xl bg-gradient-to-br from-background to-muted/30">
            <CardHeader className="space-y-1 pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10">
                        <Send className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold">投稿网站</CardTitle>
                        <CardDescription className="text-base">
                            分享优质网站，与大家一起发现更多好资源
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {result && (
                    <Alert
                        className={`mb-6 ${result.success
                                ? 'border-green-500/50 bg-green-500/10'
                                : 'border-red-500/50 bg-red-500/10'
                            }`}
                    >
                        {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <AlertDescription className={result.success ? 'text-green-600' : 'text-red-600'}>
                            {result.message}
                            {result.issueUrl && (
                                <a
                                    href={result.issueUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 underline hover:no-underline"
                                >
                                    查看投稿详情 →
                                </a>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 网站名称 */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="flex items-center gap-2 text-sm font-medium">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            网站名称 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            placeholder="例如：GitHub"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="h-11"
                        />
                    </div>

                    {/* 网站地址 */}
                    <div className="space-y-2">
                        <Label htmlFor="url" className="flex items-center gap-2 text-sm font-medium">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            网站地址 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="url"
                            type="url"
                            placeholder="https://example.com"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            required
                            className="h-11"
                        />
                    </div>

                    {/* 网站描述 */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            网站描述 <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="简要描述这个网站的功能和特点..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    {/* 分类选择 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                选择分类 <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: '' })}
                                required
                            >
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="选择一个分类" />
                                </SelectTrigger>
                                <SelectContent>
                                    {navigationData.navigationItems
                                        .filter(item => item.enabled !== false)
                                        .map((item: NavigationItem) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.title}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {subCategories.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    选择子分类
                                </Label>
                                <Select
                                    value={formData.subcategory}
                                    onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="选择子分类（可选）" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subCategories
                                            .filter(sub => sub.enabled !== false)
                                            .map((sub: NavigationCategory) => (
                                                <SelectItem key={sub.id} value={sub.id}>
                                                    {sub.title}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* 投稿者备注 */}
                    <div className="space-y-2">
                        <Label htmlFor="note" className="text-sm font-medium">
                            备注（可选）
                        </Label>
                        <Textarea
                            id="note"
                            placeholder="如有其他说明，请在此留言..."
                            value={formData.submitterNote}
                            onChange={(e) => setFormData({ ...formData, submitterNote: e.target.value })}
                            rows={2}
                            className="resize-none"
                        />
                    </div>

                    {/* 提交按钮 */}
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                提交中...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-5 w-5" />
                                提交投稿
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                        投稿将通过 GitHub Issues 进行管理，审核通过后会添加到导航列表
                    </p>
                </form>
            </CardContent>
        </Card>
    )
}
