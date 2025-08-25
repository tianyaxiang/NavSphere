// 测试 Google favicon 服务
async function testGoogleFavicon() {
    const domains = ['github.com', 'google.com', 'stackoverflow.com', 'baidu.com'];
    
    console.log('测试 Google favicon 服务...\n');
    
    for (const domain of domains) {
        const faviconUrl = `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
        console.log(`域名: ${domain}`);
        console.log(`Favicon URL: ${faviconUrl}`);
        
        try {
            const response = await fetch(faviconUrl);
            console.log(`状态: ${response.status} ${response.statusText}`);
            console.log(`内容类型: ${response.headers.get('content-type')}`);
            console.log(`内容大小: ${response.headers.get('content-length')} bytes`);
        } catch (error) {
            console.log(`错误: ${error.message}`);
        }
        console.log('---');
    }
}

testGoogleFavicon();