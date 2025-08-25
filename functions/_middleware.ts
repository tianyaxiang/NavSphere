// Cloudflare Pages Functions middleware for handling static assets

export async function onRequest(context: any) {
  const { request, next } = context
  const url = new URL(request.url)
  
  // Handle SVG files specifically
  if (url.pathname.endsWith('.svg')) {
    const response = await next()
    
    // Clone the response to modify headers
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000',
      },
    })
    
    return newResponse
  }
  
  // Handle other static assets
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|css|js)$/)) {
    const response = await next()
    
    const contentTypeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.css': 'text/css',
      '.js': 'application/javascript',
    }
    
    const ext = url.pathname.match(/\.[^.]+$/)?.[0] || ''
    const contentType = contentTypeMap[ext]
    
    if (contentType) {
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...response.headers,
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000',
        },
      })
      
      return newResponse
    }
  }
  
  return next()
}