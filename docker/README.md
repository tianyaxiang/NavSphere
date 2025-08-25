# Docker 部署文件

这个目录包含了NavSphere项目的Docker部署相关文件。

## 文件说明

### Dockerfile
多阶段构建的Docker镜像配置文件，包含：
- **deps阶段**: 安装项目依赖
- **builder阶段**: 构建Next.js应用
- **runner阶段**: 运行时环境，优化镜像大小

### docker-compose.yml
开发环境的Docker Compose配置：
- 端口映射: 3000:3000
- 环境变量通过 `.env.local` 文件加载
- 包含健康检查配置

### docker-compose.prod.yml
生产环境的Docker Compose配置：
- 端口映射: 80:3000 (生产环境通常使用80端口)
- 资源限制: 内存限制512M，预留256M
- 日志轮转配置
- 自动重启策略

### .dockerignore
Docker构建时忽略的文件和目录：
- node_modules
- .git
- 开发环境文件
- 构建产物等

## 使用方法

### 快速部署
```bash
# 在项目根目录执行
./scripts/docker-deploy.sh
```

### 手动部署

1. **构建镜像**
```bash
docker build -f docker/Dockerfile -t navsphere:latest .
```

2. **开发环境**
```bash
docker-compose -f docker/docker-compose.yml up -d
```

3. **生产环境**
```bash
docker-compose -f docker/docker-compose.prod.yml up -d
```

### 管理命令

```bash
# 查看容器状态
docker-compose -f docker/docker-compose.yml ps

# 查看日志
docker-compose -f docker/docker-compose.yml logs -f

# 停止服务
docker-compose -f docker/docker-compose.yml down

# 重启服务
docker-compose -f docker/docker-compose.yml restart
```

## 环境要求

- Docker 20.0+
- Docker Compose 2.0+
- 至少512MB可用内存

## 注意事项

1. **环境变量**: 确保项目根目录存在 `.env.local` 文件
2. **端口冲突**: 确保3000端口(开发)或80端口(生产)未被占用
3. **健康检查**: 服务启动后会自动进行健康检查，确保服务正常运行
4. **数据持久化**: 当前配置不包含数据卷，重启容器不会丢失数据(因为数据存储在GitHub)

## 故障排除

### 常见问题

1. **构建失败**
   - 检查Docker版本
   - 确保网络连接正常
   - 查看构建日志: `docker build -f docker/Dockerfile -t navsphere:latest . --no-cache`

2. **容器启动失败**
   - 检查环境变量配置
   - 查看容器日志: `docker-compose -f docker/docker-compose.yml logs`
   - 检查端口是否被占用

3. **健康检查失败**
   - 等待更长时间让服务完全启动
   - 检查 `/api/health` 端点是否正常
   - 查看应用日志排查问题