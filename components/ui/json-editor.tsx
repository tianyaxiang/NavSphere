'use client'

import { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { useTheme } from 'next-themes'

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  height?: string
  onValidate?: (isValid: boolean, errors: string[]) => void
  isValid?: boolean
  stats?: { categories: number; items: number; size: number }
}

export function JsonEditor({ 
  value, 
  onChange, 
  disabled = false, 
  height = '500px',
  onValidate,
  isValid = true,
  stats
}: JsonEditorProps) {
  const { theme } = useTheme()
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    // 配置JSON语言特性
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: false,
    })

    // 设置编辑器选项
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      formatOnPaste: true,
      formatOnType: true,
      folding: true,
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      suggest: {
        showKeywords: true,
        showSnippets: true,
      },
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true,
      },
    })

    // 监听内容变化
    editor.onDidChangeModelContent(() => {
      const currentValue = editor.getValue()
      onChange(currentValue)
      
      // 验证JSON格式
      if (onValidate) {
        try {
          JSON.parse(currentValue)
          onValidate(true, [])
        } catch (error) {
          onValidate(false, [(error as Error).message])
        }
      }
    })

    // 添加键盘快捷键
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // 触发保存事件
      const event = new CustomEvent('monaco-save')
      window.dispatchEvent(event)
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, () => {
      // 触发刷新事件
      const event = new CustomEvent('monaco-refresh')
      window.dispatchEvent(event)
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
      // 触发下载事件
      const event = new CustomEvent('monaco-download')
      window.dispatchEvent(event)
    })

    // 格式化快捷键
    editor.addCommand(monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument').run()
    })
  }

  // 格式化JSON
  const formatJson = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run()
    }
  }

  // 暴露格式化方法
  useEffect(() => {
    const handleFormat = () => formatJson()
    window.addEventListener('monaco-format', handleFormat)
    return () => window.removeEventListener('monaco-format', handleFormat)
  }, [])

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* 编辑器工具栏 */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">navigation.json</span>
          {value && (
            <span className="text-xs text-muted-foreground">
              {value.split('\n').length} 行 · {value.length} 字符
            </span>
          )}
          {/* JSON状态显示 */}
          <div className="flex items-center gap-1">
            {isValid ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">格式正确</span>
                {stats && (
                  <span className="text-xs text-muted-foreground ml-1">
                    · {stats.categories} 分类 · {stats.items} 站点
                  </span>
                )}
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">格式错误</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Ctrl+S</kbd>
            <span>保存</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Alt+Shift+F</kbd>
            <span>格式化</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Ctrl+F</kbd>
            <span>查找</span>
          </div>
        </div>
      </div>

      {/* Monaco Editor */}
      <Editor
        height={height}
        defaultLanguage="json"
        value={value}
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        onMount={handleEditorDidMount}
        options={{
          readOnly: disabled,
          contextmenu: true,
          selectOnLineNumbers: true,
          roundedSelection: false,
          cursorStyle: 'line',
          automaticLayout: true,
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>加载编辑器...</span>
            </div>
          </div>
        }
      />
    </div>
  )
}