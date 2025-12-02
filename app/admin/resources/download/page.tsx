'use client'

import React, { useState } from 'react';
export const runtime = 'edge'

const FaviconDownloader: React.FC = () => {
    const [url, setUrl] = useState('');
    const [faviconUrl, setFaviconUrl] = useState('');
    const [showError, setShowError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFetch = async (method: 'direct' | 'html') => {
        setIsLoading(true);
        setShowError('');
        const apiUrl = method === 'direct'
            ? `/api/favicon?domain=${url}`
            : `/api/favicon-im?domain=${url}`;

        try {
            console.log(`Fetching favicon ${method === 'direct' ? 'directly' : 'from HTML'}: ${apiUrl}`);
            const response = await fetch(apiUrl);
            console.log(`Response status: ${response.status}`);

            if (!response.ok) {
                throw new Error('无法访问该网站或未找到 Favicon');
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            setFaviconUrl(blobUrl);
        } catch (error: unknown) {
            console.error(`Error fetching favicon ${method}:`, error);
            setShowError(error instanceof Error ? error.message : '发生错误，请重试。');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadFavicon = () => {
        if (!faviconUrl) {
            setShowError('请先获取 Favicon。');
            return;
        }
        const link = document.createElement('a');
        link.href = faviconUrl;
        link.download = 'favicon.ico';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="max-w-2xl mx-auto py-12 px-4">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                        Favicon 下载器
                    </h1>

                    <div className="space-y-6">
                        <div className="relative">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="请输入网站地址 (例如: https://example.com)"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => handleFetch('direct')}
                                disabled={isLoading || !url}
                                className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? '获取中...' : '通过 Google Favicon 获取'}
                            </button>
                            <button
                                onClick={() => handleFetch('html')}
                                disabled={isLoading || !url}
                                className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? '获取中...' : '通过favicon im获取'}
                            </button>
                        </div>

                        {faviconUrl && (
                            <div className="text-center p-6 bg-gray-50 rounded-lg">
                                <img
                                    src={faviconUrl}
                                    alt="Favicon"
                                    className="w-16 h-16 mx-auto mb-4 shadow-md rounded"
                                />
                                <p className="text-gray-600 mb-4">Favicon 已获取成功！</p>
                                <button
                                    onClick={downloadFavicon}
                                    className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition"
                                >
                                    下载 Favicon
                                </button>
                            </div>
                        )}

                        {showError && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-center">{showError}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaviconDownloader;
