# 坩埚服 - Minecraft 服务器官方网站

一个集玩家社区、建筑存档、实时服务器状态展示于一体的 Minecraft 服务器网站。

## 功能特性

- **服务器状态** - 实时显示 Minecraft 服务器在线状态、在线人数、版本信息
- **建筑与机器档案** - 记录服务器里的建筑和机器，支持坐标、维度、分类、标签
- **群友唠嗑区** - 论坛式社区交流，支持发帖、回复、分类
- **正版认证** - 注册时绑定 Minecraft 正版账号，自动获取皮肤头像
- **权限系统** - 三级权限：服主(OWNER) / 管理员(ADMIN) / 成员(USER)
- **管理后台** - 管理用户、档案、评论

## 权限说明

| 角色 | 说明 | 权限 |
| :--- | :--- | :--- |
| **OWNER** (服主) | 第一个注册的用户自动成为服主 | 管理所有内容、修改用户角色 |
| **ADMIN** (管理员) | 由服主手动提升 | 管理所有内容（帖子、档案、评论），不可修改用户角色 |
| **USER** (成员) | 普通注册用户 | 发布/编辑/删除自己的内容 |

> 第一个注册的用户自动成为服主(OWNER)，后续注册的用户均为普通成员(USER)。只有服主可以提升/取消管理员。

## 快速开始

### 环境要求

- Node.js 18+
- npm / yarn / pnpm

### 1. 克隆项目

```bash
git clone https://github.com/nov1ce-lee/mc-website.git
cd mc-website
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env` 文件并根据需要修改：

```env
# 数据库 (开发环境使用 SQLite，无需额外配置)
DATABASE_URL="file:./dev.db"

# NextAuth 配置
NEXTAUTH_URL="http://localhost:3000"          # 部署后改为实际域名
NEXTAUTH_SECRET="your-nextauth-secret-replace-me"  # 生成一个随机字符串

# Minecraft 服务器地址 (用于状态页显示)
MC_SERVER_IP="your-server-ip:port"
```

> **NEXTAUTH_SECRET** 生成方法：在终端运行 `openssl rand -base64 32` 或使用任意随机字符串。

### 4. 初始化数据库

```bash
npx prisma generate
npx prisma db push
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可看到网站。

### 6. 注册第一个用户

打开 `/register` 页面注册账号，**第一个注册的用户将自动成为服主(OWNER)**。

## 部署到服务器

### 方式一：直接部署 (推荐)

```bash
# 构建
npm run build

# 启动生产服务器
npm start
```

建议使用 PM2 管理进程：

```bash
npm install -g pm2
pm2 start npm --name "mc-website" -- start
pm2 save
pm2 startup
```

### 方式二：Docker 部署 (生产环境使用 PostgreSQL)

项目提供了 Docker Compose 配置，生产环境使用 PostgreSQL 数据库。

#### 1. 配置环境变量

创建 `.env` 文件：

```env
# PostgreSQL 数据库 (Docker 会自动创建)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-strong-password
POSTGRES_DB=mc_website

# NextAuth
NEXTAUTH_URL=http://your-domain.com:3000
NEXTAUTH_SECRET=your-random-secret-string

# Minecraft 服务器
MC_SERVER_IP=your-server-ip:port
```

#### 2. 修改 Prisma 数据库配置

将 `prisma/schema.prisma` 中的 `provider` 从 `sqlite` 改为 `postgresql`：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 3. 构建并启动

```bash
docker-compose up -d
```

#### 4. 初始化数据库

```bash
docker-compose exec app npx prisma db push
```

访问 `http://your-domain.com:3000` 即可。

### 方式三：反向代理 + HTTPS (推荐生产环境)

使用 Nginx 反向代理并配置 SSL：

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

同时修改 `.env` 中的 `NEXTAUTH_URL` 为 `https://your-domain.com`。

## 环境变量说明

| 变量 | 必填 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | 是 | 数据库连接地址 | `file:./dev.db` (SQLite) / `postgresql://user:pass@host:5432/db` (PostgreSQL) |
| `NEXTAUTH_URL` | 是 | 网站访问地址 | `http://localhost:3000` / `https://your-domain.com` |
| `NEXTAUTH_SECRET` | 是 | JWT 加密密钥 | 随机字符串，如 `z8H3kP9mQ2rX5vB7nJ1wL4sY6cA0dF2g` |
| `MC_SERVER_IP` | 是 | Minecraft 服务器地址 | `114.67.238.112:34196` |

## 技术栈

| 模块 | 技术 |
| :--- | :--- |
| 框架 | Next.js 16 (App Router) |
| 认证 | NextAuth.js (Credentials Provider) |
| 数据库 | SQLite (开发) / PostgreSQL (生产) |
| ORM | Prisma |
| 样式 | Tailwind CSS 4 |
| 图标 | Lucide React |
| 部署 | Docker + Docker Compose |

## 项目结构

```
mc-website/
├── prisma/                  # 数据库 Schema 和迁移
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── admin/           # 管理后台
│   │   ├── archives/        # 建筑与机器档案
│   │   ├── forum/           # 唠嗑区 (论坛)
│   │   ├── login/           # 登录页
│   │   ├── register/        # 注册页 (绑定正版账号)
│   │   ├── profile/         # 个人中心
│   │   ├── status/          # 服务器状态
│   │   └── api/             # API 路由
│   ├── components/          # 通用组件
│   ├── lib/                 # 工具库 (auth, prisma, avatar)
│   └── types/               # TypeScript 类型定义
├── Dockerfile
├── docker-compose.yml
└── .env
```
