# Water-moon-admin
Water Moon Admin 是一个基于 React 和 Ant Design 构建的在线选片后台管理系统，支持产品管理、订单配置与用户选片流程控制

## ✨ 特性 (Features)
- 📁 **订单管理**：创建、编辑客户订单，绑定照片集、指定可制作产品
- 🖼️ **照片集管理**：上传原片、预览、分类、标记制作用途（如大框、相册等）
- 🛠️ **产品配置**：支持配置影楼常用产品类型（摆台、相册、大框等）及每类限制张数
- 🎁 **套餐管理**：支持创建套餐并关联多个产品，方便统一管理影楼常用组合服务
- 📊 **选片统计**：按订单维度查看用户选片结果、备注、导出
- 🔐 **权限控制（RBAC）**：支持管理员、选片师、普通用户多角色访问控制
- 🔗 **短链生成**：每个订单生成专属选片链接与动态密码，供客户访问选片页面

## ⚙️ 技术栈 Technology Stack

- 🌐 前端：React 18, TypeScript, Vite, Zustand, Ant Design
- 🖥️ 后端：NestJS + TypeORM + MySQL
- ☁️ 存储：MinIO，客户端直传 OSS
- 🔐 权限控制：JWT + RBAC 模型
- 🧰 构建与部署：Docker + PM2

## 📦 安装与运行 Installation

本项目包含两个子项目：后台管理前端和后端服务，需分别启动。

---

### 🖥️ 后台前端（[water-moon-admin](https://github.com/NightFire0307/water-moon-admin)）

```bash
# 克隆项目
git clone https://github.com/NightFire0307/water-moon-admin.git
cd water-moon-admin

# 安装依赖
npm install

# 启动开发环境
npm run dev
```

---
### 🛠️ 后端服务 ([water-moon-server](https://github.com/NightFire0307/water-moon-server))

```bash
# 克隆项目
git clone https://github.com/NightFire0307/water-moon-server.git
cd water-moon-server

# 安装依赖
npm install

# 配置环境变量
# 修改 .env 内容，设置数据库、OSS 等配置

# 启动开发服务
npm run start:dev
```

## 🤝 参与贡献（Contributing）

我们欢迎任何形式的贡献！无论是提交 bug、提建议、添加功能，还是改进文档，都是对项目的重要支持。
