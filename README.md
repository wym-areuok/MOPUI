## 环境说明

本项目仅包含 **开发环境（dev）** 和 **生产环境（prod）** 两套环境。

## 前端运行

### 环境要求

- Node.js >= 18
- Yarn（推荐）或 npm

### 安装与启动

```bash
# 进入项目目录
cd MOPUI

# 安装依赖（也可双击 bin/package.bat）
yarn --registry=https://registry.npmmirror.com

# 启动开发服务器（也可双击 bin/run-web.bat）
yarn dev

# 构建生产环境（也可双击 bin/build.bat）
yarn build:prod

# 前端访问地址 http://localhost:80
```

### bin/ 脚本说明

| 脚本 | 用途 | 等价命令 |
|------|------|----------|
| `bin/package.bat` | 安装依赖（生成 node_modules） | `yarn --registry=https://registry.npmmirror.com` |
| `bin/run-web.bat` | 启动开发服务器 | `yarn dev` |
| `bin/build.bat` | 构建生产环境（生成 dist 目录） | `yarn build:prod` |

### npm scripts 速查

| 命令 | 说明 |
|------|------|
| `yarn dev` | 启动开发服务器（加载 .env.development） |
| `yarn build:prod` | 构建生产环境（加载 .env.production） |
| `yarn preview` | 预览生产构建结果 |