# Ytora Vue3

🍉Ytora Vue3 是一个面向中后台场景的前端端脚手架平台，基于 `Vue3`、`navieUI` 构建，目标是把后台系统里高频、重复、通用的能力前置沉淀下来，让业务开发可以更专注于领域本身，而不是反复搭基础设施。

🍌当前仓库正在持续迭代中，目前涵盖认证鉴权、RBAC、字典、文件、日志、调度、SSE、监控等能力。

本项目使用pnpm作为包管理工具

安装pnpm

```bash
#全局安装
npm install -g pnpm
#检查一下版本，确认安装成功
pnpm -v
```

启动项目

```bash
pnpm install
pnpm run dev
```

---

## 1. 技术栈

- `Vue 3.5.x`
- `naive-ui 2.x`
- `unocss`
- `pinia` 作为 ORM / SQL 访问框架
- `vue-router`
- `echarts`
- `axios`

---

## 2. 模块结构

```text
ytora-vue3/
├── config/     相关配置信息
├── public/     打包时被放在根目录下的文件
├── src/   		核心代码
	└── api			公共api接口
	├── app			项目入口
	├── components	公共组件
	├── config		项目配置
	├── features	业务代码
	├── router		路由
	├── stores		存储
	├── types		公共类型
	├── utils		工具类
├── .editorconfig	代码编辑器的行为配置
├── .package.json	主配置文件
├── .editorconfig	代码编辑器的行为配置
├── tsconfig.json	ts编译器配置
└── pnpm-lock.yaml	pnpm依赖版本锁定
```

`features`是组织业务代码的模块，按照层级组织架构，不同的业务模块应该是features下面的一个子文件夹，该子文件里应该包含该业务独有的api、type、composable

一个标准的features业务文件夹结构应该如下

```bash
features/
	└── 用户模块/
        ├── api/     	该业务模块用到的接口
        ├── composable/ 该业务模块的逻辑函数
        ├── type/   	该业务模块用到的类型
        └── index.vue	该业务模块的主页面
```
