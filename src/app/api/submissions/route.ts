import { NextRequest, NextResponse } from 'next/server'
import {
    SubmissionData,
    SubmissionIssue,
    SUBMISSION_LABELS,
    generateIssueBody,
    parseSubmissionFromIssueBody
} from '@/types/submission'

export const runtime = 'edge'


const GITHUB_API = 'https://api.github.com'
const GITHUB_OWNER = process.env.GITHUB_OWNER!
const GITHUB_REPO = process.env.GITHUB_REPO!
const GITHUB_PAT = process.env.GITHUB_PAT!

// 创建投稿 (POST)
export async function POST(request: NextRequest) {
    try {
        const data: SubmissionData = await request.json()

        // 验证必填字段
        if (!data.title || !data.url || !data.description || !data.category) {
            return NextResponse.json(
                { success: false, message: '请填写完整的投稿信息' },
                { status: 400 }
            )
        }

        // 验证 URL 格式
        try {
            new URL(data.url)
        } catch {
            return NextResponse.json(
                { success: false, message: '请输入有效的网站地址' },
                { status: 400 }
            )
        }

        // 创建 GitHub Issue
        const response = await fetch(`${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GITHUB_PAT}`,
                'Accept': 'application/vnd.github+json',
                'Content-Type': 'application/json',
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({
                title: `[投稿] ${data.title}`,
                body: generateIssueBody(data),
                labels: [SUBMISSION_LABELS.SUBMISSION, SUBMISSION_LABELS.PENDING]
            })
        })

        if (!response.ok) {
            const error = await response.json()
            console.error('GitHub API Error:', error)
            return NextResponse.json(
                { success: false, message: '提交失败，请稍后重试' },
                { status: 500 }
            )
        }

        const issue = await response.json()

        return NextResponse.json({
            success: true,
            message: '投稿成功！我们会尽快审核您的投稿',
            issueNumber: issue.number,
            issueUrl: issue.html_url
        })

    } catch (error) {
        console.error('Submission error:', error)
        return NextResponse.json(
            { success: false, message: '服务器错误，请稍后重试' },
            { status: 500 }
        )
    }
}

// 获取投稿列表 (GET) - 仅管理员使用
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || 'pending' // pending, approved, rejected, all

        // 构建标签过滤
        let labels = SUBMISSION_LABELS.SUBMISSION
        if (status === 'pending') {
            labels = `${SUBMISSION_LABELS.SUBMISSION},${SUBMISSION_LABELS.PENDING}`
        } else if (status === 'approved') {
            labels = `${SUBMISSION_LABELS.SUBMISSION},${SUBMISSION_LABELS.APPROVED}`
        } else if (status === 'rejected') {
            labels = `${SUBMISSION_LABELS.SUBMISSION},${SUBMISSION_LABELS.REJECTED}`
        }

        const response = await fetch(
            `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?labels=${labels}&state=all&per_page=100`,
            {
                headers: {
                    'Authorization': `Bearer ${GITHUB_PAT}`,
                    'Accept': 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            }
        )

        if (!response.ok) {
            throw new Error('Failed to fetch issues')
        }

        const issues = await response.json()

        // 解析投稿数据
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const submissions: SubmissionIssue[] = issues.map((issue: any) => ({
            id: issue.id,
            number: issue.number,
            title: issue.title,
            body: issue.body,
            state: issue.state,
            labels: issue.labels,
            created_at: issue.created_at,
            updated_at: issue.updated_at,
            html_url: issue.html_url,
            submissionData: parseSubmissionFromIssueBody(issue.body)
        }))

        return NextResponse.json({ success: true, submissions })

    } catch (error) {
        console.error('Get submissions error:', error)
        return NextResponse.json(
            { success: false, message: '获取投稿列表失败' },
            { status: 500 }
        )
    }
}
