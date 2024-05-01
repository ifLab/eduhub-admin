# 使用Node.js 20.11基于Alpine Linux 3.19的镜像作为基础镜像
FROM node:20.11-alpine3.19 AS base

# 设置工作目录
WORKDIR /app

# 复制package.json文件到工作目录
COPY package.json .

# 安装依赖
RUN yarn install

# 复制其余项目文件到工作目录
COPY . .
# 为构建修正路径
RUN sed -i 's|\.\./\.\./\.\./eduhub/|\.\./config|g' /app/src/apis/server.js

# 构建项目
RUN yarn build

# 安装pm2作为全局包，然后清理yarn缓存以减小镜像大小
RUN yarn global add pm2 \
    && yarn cache clean

# 调整端口环境变量和权限
ENV PORT 3002
RUN chmod +x entrypoint.sh

# 暴露端口3001和3002
EXPOSE 3001 3002

# 设置启动命令
ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]
