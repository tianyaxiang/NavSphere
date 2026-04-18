// 匿名投稿相关类型定义

export interface SubmissionData {
    title: string
    url: string
    description: string
    category: string  // 分类 ID
    subcategory?: string  // 子分类 ID（可选）
    submitterNote?: string  // 投稿者备注
}

export interface SubmissionIssue {
    id: number
    number: number
    title: string
    body: string
    state: 'open' | 'closed'
    labels: Array<{ name: string; color: string }>
    created_at: string
    updated_at: string
    html_url: string
    // 解析后的投稿数据
    submissionData?: SubmissionData
}

export interface SubmissionResponse {
    success: boolean
    message: string
    issueNumber?: number
    issueUrl?: string
}

// Issue 标签
export const SUBMISSION_LABELS = {
    PENDING: 'submission:pending',     // 待审核
    APPROVED: 'submission:approved',   // 已通过
    REJECTED: 'submission:rejected',   // 已拒绝
    SUBMISSION: 'submission'           // 投稿标记
}

// 从 Issue body 解析投稿数据
export function parseSubmissionFromIssueBody(body: string): SubmissionData | null {
    try {
        const jsonMatch = body.match(/```json\n([\s\S]*?)\n```/)
        if (jsonMatch && jsonMatch[1]) {
            return JSON.parse(jsonMatch[1]) as SubmissionData
        }
        return null
    } catch {
        return null
    }
}

// 生成 Issue body
export function generateIssueBody(data: SubmissionData): string {
    return `## 网站投稿

**网站名称**: ${data.title}
**网站地址**: ${data.url}
**网站描述**: ${data.description}
**目标分类**: ${data.category}${data.subcategory ? ` > ${data.subcategory}` : ''}

${data.submitterNote ? `**投稿者备注**: ${data.submitterNote}` : ''}

---

### 投稿数据 (JSON)

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

---
*此投稿由匿名用户通过 NavSphere 投稿系统提交*
`
}
