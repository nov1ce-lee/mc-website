# 坩埚服 - Azure AD 正版登录配置指南

## 1. 创建 Azure AD 应用

1. 访问 [Azure Portal](https://portal.azure.com)
2. 进入 **Azure Active Directory** > **应用注册** > **新注册**
3. 填写应用信息：
   - **名称**: `坩埚服 Minecraft 登录`
   - **支持的账户类型**: `任何组织目录中的账户和个人 Microsoft 账户`
   - **重定向 URI**: `http://localhost:3000/api/auth/callback/azure-ad` (开发环境)
   - **平台**: `Web`

## 2. 获取客户端密钥

1. 在应用注册页面，进入 **证书和密码**
2. 点击 **新客户端密码**
3. 输入描述: `坩埚服网站密钥`
4. 选择过期时间: `24个月` (推荐)
5. 点击 **添加**，**立即复制** 密钥值（只显示一次！）

## 3. 配置环境变量

将以下信息添加到 `.env` 文件：

```env
# Azure AD 配置
AZURE_AD_CLIENT_ID="你的客户端ID"
AZURE_AD_CLIENT_SECRET="你的客户端密钥"
AZURE_AD_TENANT_ID="consumers"  # 个人账户使用 "consumers"
```

## 4. 配置重定向 URI

1. 在 Azure 门户中，进入你的应用
2. 进入 **身份验证** > **平台配置**
3. 添加以下重定向 URI：
   - 开发环境: `http://localhost:3000/api/auth/callback/azure-ad`
   - 生产环境: `https://你的域名/api/auth/callback/azure-ad`
4. 在 **隐式授权** 中勾选：
   - ✅ 访问令牌
   - ✅ ID 令牌

## 5. 测试登录

1. 重启开发服务器: `npm run dev`
2. 访问网站点击 **正版登录**
3. 使用你的 Microsoft 账户登录
4. 登录成功后，导航栏会显示你的 Minecraft 用户名和头像

## 注意事项

- **客户端密钥** 是敏感信息，不要提交到 Git
- 生产环境需要将 `NEXTAUTH_URL` 设置为你的域名
- 如需支持更多玩家，可能需要申请应用权限
