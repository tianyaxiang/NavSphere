export default {
  async fetch(request, env) {
    // 设置环境变量
    process.env.GITHUB_ID = env.GITHUB_ID
    process.env.GITHUB_SECRET = env.GITHUB_SECRET
    process.env.GITHUB_OWNER = env.GITHUB_OWNER
    process.env.GITHUB_REPO = env.GITHUB_REPO
    process.env.GITHUB_BRANCH = env.GITHUB_BRANCH
    process.env.NEXTAUTH_URL = env.NEXTAUTH_URL
    process.env.NEXTAUTH_SECRET = env.GITHUB_SECRET

    if (request.url.includes('/api/auth')) {
      return env.ASSETS.fetch(request)
    }

    // 处理其他路由
    try {
      return await env.ASSETS.fetch(request)
    } catch (e) {
      // 如果是 404，重定向到首页
      if (e.status === 404) {
        return Response.redirect(new URL('/', request.url))
      }
      throw e
    }
  }
} 