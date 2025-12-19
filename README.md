## 安装

本项目使用pnpm作为包管理工具

安装了node和npm后

1. 使用下面命令更换npm的源

   ```bash
   npm config set registry https://registry.npmmirror.com
   #验证是否修改成功
   npm config get registry
   #输出应该是
   https://registry.npmmirror.com/
   ```



2. 安装 pnpm

   用 npm 来安装 pnpm

   ```bash
   #全局安装
   npm install -g pnpm
   #检查一下版本，确认安装成功
   pnpm -v
   ```

   

3. 设置 pnpm源

   pnpm 默认也会用 npm 的 registry，手动设置一下

   ```bash
   pnpm config set registry https://registry.npmmirror.com
   pnpm config get registry
   ```

   

4. 初始化Vue3项目

   使用 Vite + Vue3 创建项目

   ```bash
   npm create vue@latest
   ```

   会进行一系列项目信息的选择，选完后Vue3项目就初始化完毕了



4. 启动项目

   进入项目根路径后，使用下面命令启动

   ```bash
   pnpm install
   pnpm run dev
   ```

   

执行上面命令后，项目根目录下会生成一系列初识文件