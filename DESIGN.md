# 坩埚服 官方网站 - 开发设计文档 (DESIGN.md)

## 1. 项目愿景
为 坩埚服 Minecraft 生存服务器构建一个集玩家社区、建筑存档、实时信息展示于一体的全栈 Web 平台。通过正版验证确保用户真实性，同时提供现代化的 UI 交互。

## 2. 核心功能模块

### 2.1 认证系统 (Authentication)
*   **正版登录**：集成 Microsoft/Mojang OAuth，验证玩家是否拥有正版 Minecraft。
*   **权限分级**：
    *   **普通用户**：发布、编辑、删除自己的内容。
    *   **管理员**：拥有全局管理权限，可审核、编辑或删除任何内容。

### 2.2 建筑与生电档案 (Archive/Wiki)
*   **发布记录**：支持上传多图、坐标 (X, Y, Z)、所属维度、分类标签。
*   **互动功能**：点赞、收藏、评论。
*   **实时数据关联**：如果可能，展示建筑周边的实时在线人数 or 状态。

### 2.3 实时数据集成 (Minecraft Integration)
*   **服务器状态**：显示在线人数、TPS（需要插件支持）、服务器运行时间。
*   **玩家动态**：展示实时在线名单、玩家皮肤/头像。

### 2.4 社区交流 (Forum/Community)
*   **公告栏**：管理员发布的服务器动态。
*   **讨论区**：简单的帖子发布与回复机制。

## 3. 技术栈选择 (Tech Stack)

| 模块 | 技术选择 | 理由 |
| :--- | :--- | :--- |
| **全栈框架** | **Next.js (App Router)** | 性能优异，SEO 友好，集成 API Routes，开发效率高。 |
| **认证库** | **NextAuth.js** | 官方支持多种 OAuth 模式，安全性高。 |
| **数据库** | **PostgreSQL** | 关系型数据库，适合存储复杂的坐标、用户关联数据。 |
| **ORM** | **Prisma** | 类型安全，极大简化数据库操作。 |
| **样式方案** | **Tailwind CSS + Shadcn UI** | 现代简约风格的基础，灵活定制 MC 特色（如像素边框、特定色块）。 |
| **文件存储** | **S3 / Cloudinary** | 托管玩家上传的图片，减轻服务器带宽压力。 |
| **部署方案** | **Docker + Docker Compose** | 确保 Windows 开发与 Linux 部署环境的一致性，实现快捷部署。 |

## 4. UI/UX 设计方案 (Modern Minimalist + MC Style)
*   **色彩系统**：以极简的白色/浅灰为基底，使用 MC 经典颜色作为点缀：
    *   `#2D932D` (Grass Green) - 成功/发布。
    *   `#00AAAA` (Diamond Blue) - 链接/高亮。
    *   `#7A7A7A` (Stone Grey) - 次要文本。
*   **元素细节**：
    *   使用像素风格的图标或进度条。
    *   卡片容器带有细微的像素边框效果。
    *   玩家头像直接调用 `crafatar.com` 或 `minotar.net` 的 API。

## 5. 实时数据获取方案 (初步建议)
*   **方案 A (推荐)**：使用 `Minecraft-Server-Status` API (查询端口 25565)。
*   **方案 B (进阶)**：在服务器端安装 `NuVotifier` 或 `WebAPI` 插件，通过 Webhook/RESTful API 实时推送数据。

## 6. 部署流程 (Deployment)
1.  **本地开发**：使用 `npm run dev`。
2.  **构建镜像**：`docker build -t mc-website .`
3.  **容器部署**：`docker-compose up -d` (包含数据库与应用)。
