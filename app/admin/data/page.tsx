'use client'
export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { JsonEditor } from "@/components/ui/json-editor"
import { useToast } from "@/components/ui/use-toast"
import {
  Download,
  RefreshCw,
  Save,
  AlertTriangle,
  Database,
  FileText,
  CheckCircle,
  XCircle,
  Info,
  Upload
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export default function DataManagementPage() {
  const [navigationData, setNavigationData] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false)
  const [isJsonValid, setIsJsonValid] = useState(true)
  const [jsonError, setJsonError] = useState('')
  const [dataStats, setDataStats] = useState({ categories: 0, items: 0, size: 0 })

  const [editorErrors, setEditorErrors] = useState<string[]>([])
  const [defaultFileStatus, setDefaultFileStatus] = useState({ exists: false, valid: false, itemCount: 0, checked: false })
  const { toast } = useToast()

  // 检查默认文件状态
  const checkDefaultFile = async () => {
    try {
      const response = await fetch('/api/navigation/check-default')
      if (response.ok) {
        const status = await response.json()
        setDefaultFileStatus({ ...status, checked: true })
      } else {
        setDefaultFileStatus({ exists: false, valid: false, itemCount: 0, checked: true })
      }
    } catch (error) {
      console.error('Failed to check default file:', error)
      setDefaultFileStatus({ exists: false, valid: false, itemCount: 0, checked: true })
    }
  }

  // 验证JSON格式并更新统计信息
  const validateJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString)
      setIsJsonValid(true)
      setJsonError('')

      // 计算统计信息
      if (parsed.navigationItems) {
        const categories = parsed.navigationItems.length
        let items = 0
        parsed.navigationItems.forEach((category: any) => {
          if (category.items) items += category.items.length
          if (category.subCategories) {
            category.subCategories.forEach((sub: any) => {
              if (sub.items) items += sub.items.length
            })
          }
        })
        const size = new Blob([jsonString]).size
        setDataStats({ categories, items, size })
      }
      return true
    } catch (error) {
      setIsJsonValid(false)
      setJsonError((error as Error).message)
      return false
    }
  }

  // 加载当前导航数据
  const loadNavigationData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/navigation')
      if (response.ok) {
        const data = await response.json()
        const jsonString = JSON.stringify(data, null, 2)
        setNavigationData(jsonString)
        validateJson(jsonString)
      } else {
        throw new Error('加载数据失败')
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "加载导航数据失败",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 恢复初始化数据
  const restoreDefaultData = async () => {
    // 检查默认文件是否存在
    if (!defaultFileStatus.exists) {
      toast({
        title: "错误",
        description: "navigation-default.json 文件不存在，无法恢复默认数据",
        variant: "destructive",
      })
      return
    }

    if (!defaultFileStatus.valid) {
      toast({
        title: "错误",
        description: "navigation-default.json 文件格式无效，无法恢复默认数据",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/navigation/restore', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        const jsonString = JSON.stringify(data, null, 2)
        setNavigationData(jsonString)
        validateJson(jsonString)
        setIsRestoreDialogOpen(false)
        toast({
          title: "成功",
          description: `已恢复为初始化数据（${defaultFileStatus.itemCount} 个分类）`,
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.details || '恢复数据失败')
      }
    } catch (error) {
      toast({
        title: "错误",
        description: (error as Error).message || "恢复初始化数据失败",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 保存数据
  const saveData = async () => {
    if (!validateJson(navigationData)) {
      toast({
        title: "错误",
        description: "JSON格式不正确，请检查语法",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/navigation', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: navigationData,
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "数据保存成功",
        })
      } else {
        throw new Error('保存失败')
      }
    } catch (error) {
      toast({
        title: "错误",
        description: "保存数据失败",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }





  // 下载数据到本地
  const downloadData = () => {
    if (!validateJson(navigationData)) {
      toast({
        title: "错误",
        description: "JSON格式不正确，无法下载",
        variant: "destructive",
      })
      return
    }

    try {
      const parsedData = JSON.parse(navigationData)
      const blob = new Blob([JSON.stringify(parsedData, null, 2)], {
        type: 'application/json',
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `navigation-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "成功",
        description: "数据已下载到本地",
      })
    } catch (error) {
      toast({
        title: "错误",
        description: "下载失败",
        variant: "destructive",
      })
    }
  }

  // 上传JSON文件
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      toast({
        title: "错误",
        description: "请选择JSON文件",
        variant: "destructive",
      })
      return
    }

    // 检查文件大小 (限制为5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "错误",
        description: "文件大小不能超过5MB",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        // 验证JSON格式
        JSON.parse(content)

        // 格式化JSON并设置到编辑器
        const formatted = JSON.stringify(JSON.parse(content), null, 2)
        setNavigationData(formatted)
        validateJson(formatted)

        toast({
          title: "成功",
          description: `已上传文件: ${file.name}`,
        })
      } catch (error) {
        toast({
          title: "错误",
          description: "文件内容不是有效的JSON格式",
          variant: "destructive",
        })
      }
    }

    reader.onerror = () => {
      toast({
        title: "错误",
        description: "文件读取失败",
        variant: "destructive",
      })
    }

    reader.readAsText(file)

    // 清空input值，允许重复上传同一文件
    event.target.value = ''
  }

  // 触发文件选择
  const triggerFileUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    input.onchange = (e) => handleFileUpload(e as any)
    input.click()
  }

  // 处理编辑器变化
  const handleEditorChange = (value: string) => {
    setNavigationData(value)
    validateJson(value)
  }

  // 处理编辑器验证
  const handleEditorValidate = (isValid: boolean, errors: string[]) => {
    setIsJsonValid(isValid)
    setEditorErrors(errors)
    if (!isValid && errors.length > 0) {
      setJsonError(errors[0])
    } else {
      setJsonError('')
    }
  }



  useEffect(() => {
    loadNavigationData()
    checkDefaultFile()
  }, [])

  // Monaco Editor 事件监听
  useEffect(() => {
    const handleMonacoSave = () => {
      if (!isSaving && !isLoading && isJsonValid) {
        saveData()
      }
    }

    const handleMonacoRefresh = () => {
      if (!isLoading) {
        loadNavigationData()
      }
    }

    const handleMonacoDownload = () => {
      if (!isLoading && isJsonValid) {
        downloadData()
      }
    }

    window.addEventListener('monaco-save', handleMonacoSave)
    window.addEventListener('monaco-refresh', handleMonacoRefresh)
    window.addEventListener('monaco-download', handleMonacoDownload)

    return () => {
      window.removeEventListener('monaco-save', handleMonacoSave)
      window.removeEventListener('monaco-refresh', handleMonacoRefresh)
      window.removeEventListener('monaco-download', handleMonacoDownload)
    }
  }, [isSaving, isLoading, isJsonValid, navigationData])

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">数据管理</h1>
          </div>
          <p className="text-muted-foreground">
            管理导航数据，支持恢复初始化、在线编辑和数据下载
          </p>
        </div>
        <div className="flex items-center gap-2">
        </div>
      </div>



      {/* 操作面板 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Button
              onClick={loadNavigationData}
              disabled={isLoading}
              variant="outline"
              className="h-12"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              刷新数据
            </Button>

            <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isLoading || !defaultFileStatus.exists || !defaultFileStatus.valid}
                  className="h-12 relative"
                >
                  <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                  恢复初始化
                  {defaultFileStatus.checked && !defaultFileStatus.exists && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                      !
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    确认恢复初始化数据？
                  </DialogTitle>
                  <DialogDescription className="space-y-3">
                    <div>
                      此操作将使用 <code className="bg-muted px-1 py-0.5 rounded">navigation-default.json</code> 的数据覆盖当前的 <code className="bg-muted px-1 py-0.5 rounded">navigation.json</code> 文件。
                    </div>

                    {/* 默认文件状态 */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-sm font-medium mb-2">默认文件状态：</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span>文件存在：</span>
                          <Badge variant={defaultFileStatus.exists ? "default" : "destructive"}>
                            {defaultFileStatus.exists ? "是" : "否"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>格式有效：</span>
                          <Badge variant={defaultFileStatus.valid ? "default" : "destructive"}>
                            {defaultFileStatus.valid ? "是" : "否"}
                          </Badge>
                        </div>
                        {defaultFileStatus.exists && defaultFileStatus.valid && (
                          <div className="flex items-center justify-between">
                            <span>分类数量：</span>
                            <Badge variant="outline">{defaultFileStatus.itemCount}</Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-destructive font-medium">
                      ⚠️ 这个操作不可撤销，请确认是否继续。
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRestoreDialogOpen(false)}>
                    取消
                  </Button>
                  <Button
                    onClick={restoreDefaultData}
                    disabled={isLoading || !defaultFileStatus.exists || !defaultFileStatus.valid}
                    variant="destructive"
                  >
                    {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                    确认恢复
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              onClick={saveData}
              disabled={isSaving || isLoading || !isJsonValid}
              className="h-12"
            >
              <Save className={`mr-2 h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
              保存数据
            </Button>

            <Button
              onClick={downloadData}
              disabled={isLoading || !isJsonValid}
              variant="outline"
              className="h-12"
            >
              <Download className="mr-2 h-4 w-4" />
              下载
            </Button>

            <Button
              onClick={triggerFileUpload}
              disabled={isLoading}
              variant="outline"
              className="h-12"
            >
              <Upload className="mr-2 h-4 w-4" />
              上传文件
            </Button>
          </div>


        </CardContent>
      </Card>

      {/* JSON 编辑器 */}
      <Card>
        <CardContent className="p-0">
          {/* 错误提示 */}
          {!isJsonValid && jsonError && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-destructive mb-1">JSON 语法错误</div>
                  <p className="text-sm text-destructive/80 mb-2">{jsonError}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        try {
                          const lines = navigationData.split('\n')
                          const errorMatch = jsonError.match(/position (\d+)/)
                          if (errorMatch) {
                            const position = parseInt(errorMatch[1])
                            let currentPos = 0
                            let lineNum = 0
                            for (let i = 0; i < lines.length; i++) {
                              if (currentPos + lines[i].length >= position) {
                                lineNum = i + 1
                                break
                              }
                              currentPos += lines[i].length + 1
                            }
                            toast({
                              title: "错误位置",
                              description: `错误可能在第 ${lineNum} 行附近`,
                            })
                          }
                        } catch {
                          toast({
                            title: "无法定位错误",
                            description: "请手动检查JSON语法",
                            variant: "destructive",
                          })
                        }
                      }}
                      className="h-7 text-xs"
                    >
                      定位错误
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // 尝试自动修复常见错误
                        let fixed = navigationData
                        // 修复常见的JSON错误
                        fixed = fixed.replace(/,(\s*[}\]])/g, '$1') // 移除多余的逗号
                        fixed = fixed.replace(/([{,]\s*)(\w+):/g, '$1"$2":') // 给属性名加引号
                        setNavigationData(fixed)
                        validateJson(fixed)
                      }}
                      className="h-7 text-xs"
                    >
                      尝试修复
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}



          <div className="relative">
            <JsonEditor
              value={navigationData}
              onChange={handleEditorChange}
              onValidate={handleEditorValidate}
              disabled={isLoading}
              height="500px"
              isValid={isJsonValid}
              stats={dataStats}
            />

            {/* 加载遮罩 */}
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex items-center gap-3 bg-background border rounded-lg px-4 py-3 shadow-lg">
                  <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm font-medium">加载数据中...</span>
                </div>
              </div>
            )}


          </div>

          {/* 数据预览和统计 */}
          <div className="mt-4 space-y-4">
            {/* 快速统计 */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>字符数: {navigationData.length.toLocaleString()}</span>
                <span>行数: {navigationData.split('\n').length}</span>
                <span>大小: {(new Blob([navigationData]).size / 1024).toFixed(2)} KB</span>
              </div>
              <div className="flex items-center gap-2">
                {isJsonValid ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>格式正确</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-destructive">
                    <XCircle className="h-3 w-3" />
                    <span>格式错误</span>
                  </div>
                )}
              </div>
            </div>

            {/* 数据结构预览 */}
            {isJsonValid && navigationData && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">数据结构</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      {(() => {
                        try {
                          const data = JSON.parse(navigationData)
                          return (
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">根分类:</span>
                                <span className="font-mono">{data.navigationItems?.length || 0}</span>
                              </div>
                              {data.navigationItems?.map((item: any, index: number) => (
                                <div key={index} className="ml-4 text-xs text-muted-foreground">
                                  <div className="flex justify-between">
                                    <span>• {item.title}</span>
                                    <span>
                                      {(item.items?.length || 0) + (item.subCategories?.reduce((acc: number, sub: any) => acc + (sub.items?.length || 0), 0) || 0)} 项
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        } catch {
                          return <span className="text-muted-foreground">无法解析数据结构</span>
                        }
                      })()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">最近修改</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">最后保存:</span>
                        <span className="font-mono text-xs">未保存</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">数据版本:</span>
                        <span className="font-mono text-xs">当前</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">备份状态:</span>
                        <Badge variant="outline" className="text-xs">
                          可恢复
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}