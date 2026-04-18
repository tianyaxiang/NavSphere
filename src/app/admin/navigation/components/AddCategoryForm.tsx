'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/registry/new-york/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/registry/new-york/ui/form"
import { Input } from "@/registry/new-york/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/new-york/ui/select"
import { navigationIcons } from "@/lib/icons"
import { Switch } from "@/registry/new-york/ui/switch"
import { useToast } from "@/registry/new-york/hooks/use-toast"

const formSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().optional(),
  icon: z.string().min(1, "请选择图标"),
  enabled: z.boolean().default(true)
})

interface AddCategoryFormProps {
  defaultValues?: {
    title: string
    description?: string
    icon: string
    enabled: boolean
  }
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>
  onCancel: () => void
}

export function AddCategoryForm({ defaultValues, onSubmit, onCancel }: AddCategoryFormProps) {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      title: "",
      description: "",
      icon: "",
      enabled: true
    }
  })

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await onSubmit(values);
      toast({
        title: "保存成功",
      });
      setTimeout(onCancel, 0);
    } catch (error) {
      console.error('Failed to submit:', error);
      toast({
        title: "保存失败",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>标题</FormLabel>
              <FormControl>
                <Input placeholder="输入分类标题" {...field} />
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
                <Input placeholder="输入分类描述" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择图标" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(navigationIcons).map(([key, Icon]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center">
                        <Icon className="mr-2 h-4 w-4" />
                        {key}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  启用状态
                </FormLabel>
                <FormDescription>
                  控制该分类是否在导航中显示
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            取消
          </Button>
          <Button 
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>
    </Form>
  )
}