'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/registry/new-york/ui/button"
import { Input } from "@/registry/new-york/ui/input"
import { Textarea } from "@/registry/new-york/ui/textarea"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/registry/new-york/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/registry/new-york/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/registry/new-york/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/registry/new-york/ui/table"
import { Badge } from "@/registry/new-york/ui/badge"
import {
    Loader2,
    CheckCircle,
    XCircle,
    ExternalLink,
    Clock,
    RefreshCw,
    Eye,
    ThumbsUp,
    ThumbsDown,
    Inbox
} from 'lucide-react'
import type { SubmissionIssue } from '@/types/submission'

export default function SubmissionsPage() {
    const [submissions, setSubmissions] = useState<SubmissionIssue[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('pending')
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionIssue | null>(null)
    const [showDetailDialog, setShowDetailDialog] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [actionLoading, setActionLoading] = useState(false)

    const fetchSubmissions = async (status: string) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/submissions?status=${status}`)
            const data = await response.json()
            if (data.success) {
                setSubmissions(data.submissions)
            }
        } catch (error) {
            console.error('Failed to fetch submissions:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSubmissions(activeTab)
    }, [activeTab])

    const handleApprove = async (submission: SubmissionIssue) => {
        setActionLoading(true)
        try {
            const response = await fetch(`/api/submissions/${submission.number}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve' })
            })
            const data = await response.json()
            if (data.success) {
                fetchSubmissions(activeTab)
                setShowDetailDialog(false)
            } else {
                alert(data.message)
            }
        } catch (error) {
            alert('操作失败，请重试')
        } finally {
            setActionLoading(false)
        }
    }

    const handleReject = async () => {
        if (!selectedSubmission) return
        setActionLoading(true)
        try {
            const response = await fetch(`/api/submissions/${selectedSubmission.number}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject', reason: rejectReason })
            })
            const data = await response.json()
            if (data.success) {
                fetchSubmissions(activeTab)
                setShowRejectDialog(false)
                setShowDetailDialog(false)
                setRejectReason('')
            } else {
                alert(data.message)
            }
        } catch (error) {
            alert('操作失败，请重试')
        } finally {
            setActionLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadge = (submission: SubmissionIssue) => {
        const hasApproved = submission.labels.some(l => l.name === 'submission:approved')
        const hasRejected = submission.labels.some(l => l.name === 'submission:rejected')

        if (hasApproved) {
            return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">已通过</Badge>
        }
        if (hasRejected) {
            return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">已拒绝</Badge>
        }
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">待审核</Badge>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">投稿审核</h1>
                    <p className="text-muted-foreground">
                        审核用户提交的网站投稿
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchSubmissions(activeTab)}
                    disabled={loading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    刷新
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="pending" className="gap-2">
                        <Clock className="h-4 w-4" />
                        待审核
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="gap-2">
                        <CheckCircle className="h-4 w-4" />
                        已通过
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="gap-2">
                        <XCircle className="h-4 w-4" />
                        已拒绝
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {activeTab === 'pending' && '待审核投稿'}
                                {activeTab === 'approved' && '已通过投稿'}
                                {activeTab === 'rejected' && '已拒绝投稿'}
                            </CardTitle>
                            <CardDescription>
                                共 {submissions.length} 条投稿
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : submissions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Inbox className="h-12 w-12 mb-4" />
                                    <p>暂无投稿</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">#</TableHead>
                                            <TableHead>网站名称</TableHead>
                                            <TableHead>网站地址</TableHead>
                                            <TableHead>分类</TableHead>
                                            <TableHead>状态</TableHead>
                                            <TableHead>提交时间</TableHead>
                                            <TableHead className="text-right">操作</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {submissions.map((submission) => (
                                            <TableRow key={submission.id}>
                                                <TableCell className="font-medium">
                                                    {submission.number}
                                                </TableCell>
                                                <TableCell>
                                                    {submission.submissionData?.title || submission.title.replace('[投稿] ', '')}
                                                </TableCell>
                                                <TableCell>
                                                    {submission.submissionData?.url ? (
                                                        <a
                                                            href={submission.submissionData.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:underline flex items-center gap-1 max-w-[200px] truncate"
                                                        >
                                                            {submission.submissionData.url}
                                                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                        </a>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {submission.submissionData?.category || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(submission)}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {formatDate(submission.created_at)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedSubmission(submission)
                                                                setShowDetailDialog(true)
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <a
                                                            href={submission.html_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Button variant="ghost" size="sm">
                                                                <ExternalLink className="h-4 w-4" />
                                                            </Button>
                                                        </a>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* 详情对话框 */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            #{selectedSubmission?.number} {selectedSubmission?.submissionData?.title}
                        </DialogTitle>
                        <DialogDescription>
                            投稿详情
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSubmission?.submissionData && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">网站名称</label>
                                    <p className="mt-1">{selectedSubmission.submissionData.title}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">网站地址</label>
                                    <p className="mt-1">
                                        <a
                                            href={selectedSubmission.submissionData.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline flex items-center gap-1"
                                        >
                                            {selectedSubmission.submissionData.url}
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">网站描述</label>
                                <p className="mt-1 p-3 bg-muted rounded-lg">
                                    {selectedSubmission.submissionData.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">目标分类</label>
                                    <p className="mt-1">{selectedSubmission.submissionData.category}</p>
                                </div>
                                {selectedSubmission.submissionData.subcategory && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">子分类</label>
                                        <p className="mt-1">{selectedSubmission.submissionData.subcategory}</p>
                                    </div>
                                )}
                            </div>

                            {selectedSubmission.submissionData.submitterNote && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">投稿者备注</label>
                                    <p className="mt-1 p-3 bg-muted rounded-lg">
                                        {selectedSubmission.submissionData.submitterNote}
                                    </p>
                                </div>
                            )}

                            <div className="text-sm text-muted-foreground">
                                提交时间：{formatDate(selectedSubmission.created_at)}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        {activeTab === 'pending' && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowRejectDialog(true)
                                    }}
                                    disabled={actionLoading}
                                >
                                    <ThumbsDown className="h-4 w-4 mr-2" />
                                    拒绝
                                </Button>
                                <Button
                                    onClick={() => selectedSubmission && handleApprove(selectedSubmission)}
                                    disabled={actionLoading}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {actionLoading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <ThumbsUp className="h-4 w-4 mr-2" />
                                    )}
                                    通过并添加
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 拒绝理由对话框 */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>拒绝投稿</DialogTitle>
                        <DialogDescription>
                            请填写拒绝理由（可选）
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Textarea
                            placeholder="请输入拒绝理由..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowRejectDialog(false)}
                            disabled={actionLoading}
                        >
                            取消
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={actionLoading}
                        >
                            {actionLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <XCircle className="h-4 w-4 mr-2" />
                            )}
                            确认拒绝
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
