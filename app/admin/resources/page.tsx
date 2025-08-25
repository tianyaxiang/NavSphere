'use client'

export const runtime = 'edge'

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent } from "@/registry/new-york/ui/card"
import { Input } from "@/registry/new-york/ui/input"
import { Button } from "@/registry/new-york/ui/button"
import { useToast } from "@/registry/new-york/hooks/use-toast"

import {
  Loader2,
  Plus,
  Upload,
  X,
  AlertCircle,
  Copy,
  Inbox,
  Search,
  Trash2,
  CheckSquare,
  Square
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/new-york/ui/dialog"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/new-york/ui/form"
import { Toaster } from "@/registry/new-york/ui/toaster"

const Icons = {
  loader2: Loader2,
  plus: Plus,
  upload: Upload,
  x: X,
  alertCircle: AlertCircle,
  copy: Copy,
  inbox: Inbox,
  search: Search,
  trash2: Trash2,
  checkSquare: CheckSquare,
  square: Square
}

const formSchema = z.object({
  resource: z.object({
    image: z.string().optional(),
  }),
})

// 假设 ResourceMetadataItem 是 metadata 中每个项的类型
interface ResourceMetadataItem {
  hash: string;
  path: string; // 根据实际结构添加其他属性
}

// Rename the local declaration
interface LocalResourceMetadata {
  id: string;
  title: string;
  items: Array<{
    title: string;
    description: string;
    icon: string;
    url: string;
  }>;
}

// 修改骨架屏组件，进一步调整大小
const ResourceGridSkeleton = () => (
  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((index) => (
      <div key={index} className="bg-white rounded-lg border shadow-sm animate-pulse">
        <div className="aspect-square bg-gray-200 rounded-t-lg" />
        <div className="p-2 space-y-1">
          <div className="h-2 w-3/4 bg-gray-200 rounded" />
          <div className="h-2 w-1/2 bg-gray-200 rounded" />
        </div>
      </div>
    ))}
  </div>
);



// Add style tag to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes shimmer {
      0% {
        transform: translateX(-100%) skewX(-12deg);
      }
      100% {
        transform: translateX(200%) skewX(-12deg);
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default function ResourceManagement() {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resource: {
        image: undefined,
      },
    },
  })

  const [resources, setResources] = useState<LocalResourceMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog visibility
  const [uploadProgress, setUploadProgress] = useState(0); // State to track upload progress
  const [isUploading, setIsUploading] = useState(false); // State to track if an upload is in progress
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // State to hold the selected image for preview
  const [uploadSpeed, setUploadSpeed] = useState<number>(0);

  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // 新增文件状态
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resourceReferences, setResourceReferences] = useState<Record<string, Array<{ type: string; location: string; title?: string }>>>({});

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/resource');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.metadata && Array.isArray(data.metadata)) {
        const transformedResources: LocalResourceMetadata[] = data.metadata.map((item: ResourceMetadataItem, index: number) => ({
          id: item.hash,
          title: `Resource ${index + 1}`,
          items: [{
            title: item.path,
            description: '',
            icon: '',
            url: item.path.startsWith('/') ? item.path : `/${item.path}`
          }]
        }));
        setResources(transformedResources);
      } else {
        throw new Error('Metadata is not available or is not an array');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update useEffect to use the new fetchResources function
  useEffect(() => {
    fetchResources();
  }, []);

  async function onSubmit() {
    try {
      if (!selectedFile) {
        toast({
          title: "错误",
          description: "请先选择图片",
          variant: "destructive",
        });
        return;
      }

      if (selectedImage) {
        await uploadImageWithProgress(selectedImage);
        // Refresh the resources list after successful upload
        await fetchResources();
      }

      toast({
        title: "成功",
        description: "资源已上传",
      });
      setIsDialogOpen(false);
      form.reset();
      setSelectedImage(null);
      setSelectedFile(null);
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "错误",
          description: error.message || "上传资源失败",
          variant: "destructive",
        });
      } else {
        toast({
          title: "错误",
          description: "上传资源失败",
          variant: "destructive",
        });
      }
    }
  }

  const handleImageChange = async (file: File) => {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "错误",
        description: "文件大小不能超过 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "错误",
        description: "请选择有效的图片文件",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file); // 保存文件对象
    const base64Image = await toBase64(file);
    setSelectedImage(base64Image);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const uploadImageWithProgress = (base64Image: string) => {
    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      setAbortController(controller);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/resource", true);
      xhr.setRequestHeader("Content-Type", "application/json");

      let startTime = Date.now();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (Number(event.loaded) / Number(event.total)) * 100;
          setUploadProgress(Math.round(percentComplete));
          setIsUploading(true);

          // Calculate upload speed (bytes per second)
          const currentTime = Date.now();
          const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
          const speed = event.loaded / elapsedTime; // bytes per second
          setUploadSpeed(speed);
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadSpeed(0);
        setAbortController(null);

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.response);
            resolve(response);
          } catch (e) {
            resolve(xhr.response);
          }
        } else {
          reject(new Error(`上传失败: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadSpeed(0);
        setAbortController(null);
        reject(new Error("网络错误，上传失败"));
      };

      xhr.onabort = () => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadSpeed(0);
        setAbortController(null);
        toast({
          title: "已取消",
          description: "上传已取消",
        });
      };

      xhr.send(JSON.stringify({ image: base64Image }));
    });
  };

  // 添加取消上传函数
  const cancelUpload = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  // Helper function to convert file to Base64
  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string); // Return Base64 string
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "成功",
        description: "链接已复制到剪贴板",
      });
    }).catch((error) => {
      toast({
        title: "错误",
        description: "复制链接失败",
        variant: "destructive",
      });
    });
  };

  // 添加搜索过滤函数
  const filteredResources = resources.filter((resource) =>
    resource.items[0].url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 批量选择相关函数
  const toggleResourceSelection = (resourceId: string) => {
    const newSelected = new Set(selectedResources);
    if (newSelected.has(resourceId)) {
      newSelected.delete(resourceId);
    } else {
      newSelected.add(resourceId);
    }
    setSelectedResources(newSelected);
  };

  const selectAllResources = () => {
    if (selectedResources.size === filteredResources.length) {
      setSelectedResources(new Set());
    } else {
      setSelectedResources(new Set(filteredResources.map(r => r.id)));
    }
  };

  // 检查资源引用
  const checkResourceReferences = async (resourcePaths: string[]) => {
    try {
      const response = await fetch('/api/resource/check-references', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resourcePaths }),
      });

      if (!response.ok) {
        throw new Error('Failed to check references');
      }

      const data = await response.json();
      return data.references;
    } catch (error) {
      console.error('Error checking references:', error);
      return {};
    }
  };

  // 批量删除资源
  const handleBatchDelete = async () => {
    if (selectedResources.size === 0) return;

    // 获取选中资源的路径和hash
    const selectedResourcesData = filteredResources.filter(r => selectedResources.has(r.id));
    const resourcePaths = selectedResourcesData.map(r => r.items[0].url);
    const resourceHashes = selectedResourcesData.map(r => r.id);

    // 检查引用
    const references = await checkResourceReferences(resourcePaths);
    setResourceReferences(references);

    setIsDeleteDialogOpen(true);
  };

  // 确认删除
  const confirmDelete = async () => {
    if (selectedResources.size === 0) return;

    try {
      setIsDeleting(true);
      const resourceHashes = Array.from(selectedResources);

      const response = await fetch('/api/resource', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resourceHashes }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete resources');
      }

      const result = await response.json();

      toast({
        title: "成功",
        description: result.message || `成功删除 ${selectedResources.size} 个资源`,
      });

      // 刷新资源列表
      await fetchResources();
      setSelectedResources(new Set());
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "删除资源失败",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* 顶部进度条 - 优化样式 */}
      {isUploading && (
        <div className="fixed top-0 left-0 right-0 z-[100]">
          <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b px-4 py-3">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icons.upload className="h-4 w-4 animate-pulse text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">正在上传...</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">{uploadProgress}%</span>
                    <span className="text-gray-400">•</span>
                    <span>{(uploadSpeed / (1024 * 1024)).toFixed(2)} MB/s</span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={cancelUpload}
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Icons.x className="h-4 w-4 mr-1" />
                    取消
                  </Button>
                </div>
              </div>
              <div className="relative w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                {/* 背景动画效果 */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse opacity-20"
                />
                {/* 主进度条 */}
                <div
                  className="relative h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${uploadProgress}%`,
                    boxShadow: '0 0 10px rgba(37, 99, 235, 0.5)'
                  }}
                >
                  {/* 光晕效果 */}
                  <div
                    className="absolute right-0 top-0 h-full w-4 bg-white opacity-30 transform -skew-x-12 animate-[shimmer_1s_infinite]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索资源..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 max-w-md"
                />
              </div>

              {filteredResources.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllResources}
                    className="flex items-center gap-2"
                  >
                    {selectedResources.size === filteredResources.length ? (
                      <Icons.checkSquare className="h-4 w-4" />
                    ) : (
                      <Icons.square className="h-4 w-4" />
                    )}
                    全选 ({selectedResources.size}/{filteredResources.length})
                  </Button>

                  {selectedResources.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBatchDelete}
                      className="flex items-center gap-2"
                    >
                      <Icons.trash2 className="h-4 w-4" />
                      删除选中 ({selectedResources.size})
                    </Button>
                  )}
                </div>
              )}
            </div>

            <Button onClick={() => setIsDialogOpen(true)}>
              <Icons.plus className="mr-2 h-4 w-4" />
              上传资源
            </Button>
          </div>

          {/* 添加搜索框 */}

        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex items-center">
              <Icons.alertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <ResourceGridSkeleton />
        ) : filteredResources.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
            {filteredResources.map((resource, index) => (
              <div
                key={index}
                className={`group bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 ${selectedResources.has(resource.id) ? 'ring-2 ring-blue-500 border-blue-500' : ''
                  }`}
              >
                <div className="relative aspect-square">
                  {/* 选择框 */}
                  <div className="absolute top-2 left-2 z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleResourceSelection(resource.id)}
                      className="h-6 w-6 p-0 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                    >
                      {selectedResources.has(resource.id) ? (
                        <Icons.checkSquare className="h-3 w-3 text-blue-600" />
                      ) : (
                        <Icons.square className="h-3 w-3 text-gray-600" />
                      )}
                    </Button>
                  </div>

                  <img
                    src={resource.items[0].url}
                    alt={`Resource ${index + 1}`}
                    className="w-full h-full object-cover rounded-t-lg"
                    loading="lazy"
                  />
                  {/* 图片遮罩层和预览按钮 - 进一步缩小 */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <a
                      href={resource.items[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full 
                               hover:bg-white/20 transition-colors duration-200 flex items-center gap-0.5 text-[10px]"
                    >
                      <Icons.upload className="h-2 w-2" />
                      查看
                    </a>
                  </div>
                </div>
                <div className="p-1.5 space-y-1">
                  {/* 文件名和上传时间 */}
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-500 truncate" title={resource.items[0].url}>
                      {resource.items[0].url.split('/').pop()}
                    </p>
                  </div>
                  {/* 复制链接按钮 - 进一步缩小 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(resource.items[0].url)}
                    className="w-full h-5 text-[8px] flex items-center justify-center gap-0.5 hover:bg-gray-50"
                  >
                    <Icons.copy className="h-2 w-2" />
                    复制链接
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-muted/50">
            <Icons.inbox className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-gray-500">
              {searchQuery ? '未找到匹配的资源' : '暂无资源'}
            </p>
            {!searchQuery && (
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
                className="mt-4"
              >
                上传第一个资源
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Dialog for adding resources */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          // 关闭对话框时重置状态
          setSelectedImage(null);
          setSelectedFile(null);
          form.reset();
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>上传资源</DialogTitle>
            <DialogDescription>
              请选择或拖拽图片文件到此处上传。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="resource.image"
                render={() => (
                  <FormItem>
                    <FormLabel>选择图片</FormLabel>
                    <FormControl>
                      <Card
                        className={`border-2 border-dashed ${selectedImage ? 'border-blue-400' : 'border-gray-200'
                          } hover:border-blue-400 transition-colors duration-200`}
                      >
                        <CardContent
                          className="flex flex-col items-center justify-center p-6 cursor-pointer"
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const files = (e.target as HTMLInputElement).files;
                              if (files && files[0]) {
                                handleImageChange(files[0]);
                              }
                            };
                            input.click();
                          }}
                        >
                          {selectedImage ? (
                            <div className="relative w-full">
                              <img
                                src={selectedImage}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedImage(null);
                                }}
                              >
                                <Icons.x className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Icons.upload className="h-12 w-12 text-gray-400 mb-4" />
                              <div className="space-y-2 text-center">
                                <p className="text-sm text-gray-600">
                                  点击或拖拽图片到此处
                                </p>
                                <p className="text-xs text-gray-400">
                                  支持 JPG、PNG 格式，最大 5MB
                                </p>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </FormControl>
                    <FormDescription>
                      选择图片后，点击下方按钮开始上传
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
                      上传中...
                    </>
                  ) : (
                    '开始上传'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 批量删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Icons.alertCircle className="h-5 w-5 text-red-500" />
              确认删除资源
            </DialogTitle>
            <DialogDescription>
              您即将删除 {selectedResources.size} 个资源，此操作不可撤销。
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* 显示有引用的资源警告 */}
            {Object.entries(resourceReferences).some(([_, refs]) => refs.length > 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex-shrink-0">
                <div className="flex items-start gap-2">
                  <Icons.alertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 min-w-0">
                    <p className="text-sm font-medium text-yellow-800">
                      以下资源正在被使用中：
                    </p>
                    <div className="max-h-24 overflow-y-auto space-y-2">
                      {Object.entries(resourceReferences).map(([resourcePath, refs]) =>
                        refs.length > 0 && (
                          <div key={resourcePath} className="text-sm text-yellow-700">
                            <p className="font-medium truncate" title={resourcePath}>
                              {resourcePath.split('/').pop()}
                            </p>
                            <ul className="ml-4 space-y-1">
                              {refs.slice(0, 3).map((ref, index) => (
                                <li key={index} className="text-xs truncate">
                                  • {ref.location}
                                </li>
                              ))}
                              {refs.length > 3 && (
                                <li className="text-xs text-yellow-600">
                                  • 还有 {refs.length - 3} 个引用...
                                </li>
                              )}
                            </ul>
                          </div>
                        )
                      )}
                    </div>
                    <p className="text-xs text-yellow-600">
                      删除这些资源可能会导致相关功能异常，请确认是否继续。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 显示将要删除的资源列表 */}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">
                  将要删除的资源 ({selectedResources.size} 个)：
                </p>
                {selectedResources.size > 12 && (
                  <p className="text-xs text-gray-500">
                    显示前 12 个，共 {selectedResources.size} 个
                  </p>
                )}
              </div>

              <div className="overflow-y-auto max-h-48">
                {selectedResources.size <= 12 ? (
                  // 少量资源时显示网格
                  <div className="grid grid-cols-4 gap-2">
                    {filteredResources
                      .filter(r => selectedResources.has(r.id))
                      .map((resource, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={resource.items[0].url}
                            alt="Resource"
                            className="w-full aspect-square object-cover rounded border"
                          />
                          <div className="absolute inset-0 bg-red-500/20 rounded"></div>
                          <div className="absolute bottom-1 left-1 right-1">
                            <div className="bg-black/60 text-white text-xs px-1 py-0.5 rounded truncate">
                              {resource.items[0].url.split('/').pop()}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  // 大量资源时显示列表
                  <div className="space-y-2">
                    {filteredResources
                      .filter(r => selectedResources.has(r.id))
                      .slice(0, 12)
                      .map((resource, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <img
                            src={resource.items[0].url}
                            alt="Resource"
                            className="w-12 h-12 object-cover rounded border flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {resource.items[0].url.split('/').pop()}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {resource.items[0].url}
                            </p>
                          </div>
                          <div className="w-4 h-4 bg-red-500/20 rounded border border-red-300 flex-shrink-0"></div>
                        </div>
                      ))}

                    {selectedResources.size > 12 && (
                      <div className="text-center py-3 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                          还有 {selectedResources.size - 12} 个资源将被删除
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-shrink-0 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
                  删除中...
                </>
              ) : (
                <>
                  <Icons.trash2 className="mr-2 h-4 w-4" />
                  确认删除 ({selectedResources.size})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </>
  )
} 