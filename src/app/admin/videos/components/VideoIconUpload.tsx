'use client';

import { useRef, useState } from 'react';
import { Button } from "@/registry/new-york/ui/button";
import { Input } from "@/registry/new-york/ui/input";
import { Icons } from "@/components/icons";
import { useToast } from "@/registry/new-york/hooks/use-toast";

interface VideoIconUploadProps {
    value: string;
    onChange: (value: string) => void;
}

export function VideoIconUpload({ value, onChange }: VideoIconUploadProps) {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const response = await fetch('/api/resource', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: base64,
                    folder: 'assets/cover',
                    prefix: 'cover'
                }),
            });

            if (!response.ok) throw new Error('上传失败');
            const data = await response.json();
            if (data.imageUrl) {
                onChange(data.imageUrl);
                toast({ title: "上传成功", description: "封面已更新" });
            }
        } catch (error) {
            console.error('上传失败:', error);
            toast({ title: "上传失败", variant: "destructive" });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
                <Input
                    placeholder="图标URL（可自动获取，本地上传将保存到assets/cover）"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                {value && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <img
                            src={value}
                            alt="图标预览"
                            className="w-4 h-4 object-contain"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                    </div>
                )}
            </div>
            <Button
                type="button"
                variant="outline"
                className="relative"
                disabled={isUploading}
                onClick={handleUploadClick}
            >
                {isUploading ? (
                    <>
                        <Icons.loader2 className="mr-2 h-4 w-4 animate-spin" />
                        上传中...
                    </>
                ) : (
                    <>
                        <Icons.upload className="mr-2 h-4 w-4" />
                        上传封面
                    </>
                )}
            </Button>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}
