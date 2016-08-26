## demo-todomvc-react-soi

用 kerneljs + soi + brisk 构建 todomvc-react 版本的示例

## 依赖

确保开发机安装以下

Node >= 4.0.0 (可选, 编译代码使用)

PHP >= 5.5.13 (必选)

运行以下代码 安装soi最新版本 (可选, 编译代码使用)
```
$ npm i -g soi
$ soi -v
```

## 代码说明

**src/** 用到的前端js和css代码

**dist/** 前端静态资源打包后的文件

**third_party/** php的资源加载框架brisk, 目前正在开发中, 可运行update_lib进行代码升级

**views/** php的渲染视图类

**index.php** 页面入口文件

**server.sh** 启动内置php server

**update_lib.sh** 同步升级brisk框架为github最新

## 运行

如果想重新构建静态资源, 确保安装soi后进入工程目录执行以下代码, 会更新dist/目录下的
打包文件和资源表

```
$ soi release dev
```

关于编译工具soi, 可以[参考这里](https://github.com/Saber-Team/soi)

只想看demo, clone当前代码库后直接进入工程目录, 执行以下代码

```
$ sudo sh server.sh
```

然后访问页面[http://localhost:80/](http://localhost:80/)