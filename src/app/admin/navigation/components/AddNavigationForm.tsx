'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/registry/new-york/ui/button"
import { Input } from "@/registry/new-york/ui/input"
import { Switch } from "@/registry/new-york/ui/switch"
import { Textarea } from "@/registry/new-york/ui/textarea"

import { IconSelector } from './IconSelector'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/registry/new-york/ui/form"
import { useToast } from "@/registry/new-york/hooks/use-toast"

const formSchema = z.object({
  title: z.string().min(2, { message: "标题至少需要2个字符" }),
  icon: z.string().min(1, { message: "请选择图标" }),
  description: z.string().optional(),
  enabled: z.boolean().default(true)
})

interface AddNavigationFormProps {
  onSubmit: (values: { 
    title: string; 
    icon: string; 
    description?: string;
    enabled: boolean;
  }) => void
  defaultValues?: {
    title: string
    icon: string
    description?: string
    enabled: boolean
  }
  onCancel?: () => void
}

export function AddNavigationForm({ 
  onSubmit, 
  defaultValues, 
  onCancel 
}: AddNavigationFormProps) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      title: "",
      icon: "FolderKanban",
      description: "",
      enabled: true
    }
  })

  const { isSubmitting } = form.formState

  const onSubmitHandler = async (values: z.infer<typeof formSchema>) => {
    try {
      await onSubmit({
        title: values.title,
        icon: values.icon,
        description: values.description,
        enabled: values.enabled
      })
      
      toast({
        title: defaultValues ? "更新成功" : "添加成功",
        description: `导航项 "${values.title}" 已${defaultValues ? "更新" : "添加"}`,
      })
    } catch (error) {
      toast({
        title: "操作失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>标题</FormLabel>
              <FormControl>
                <Input placeholder="输入导航标题" {...field} />
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
                <IconSelector value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormDescription>
                从 Lucide 图标库中选择一个图标
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
              <FormLabel>描述</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="输入分类描述（可选）" 
                  className="resize-none"
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                简短描述该分类项的用途
              </FormDescription>
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
                <FormLabel className="text-base">启用状态</FormLabel>
                <FormDescription>
                  设置该项是否启用
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
        <div className="flex gap-4">
          <Button 
            type="submit" 
            className="flex-1" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "提交中..." : defaultValues ? "更新" : "添加"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1"
            onClick={onCancel}
          >
            取消
          </Button>
        </div>
      </form>
    </Form>
  )
}