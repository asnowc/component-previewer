[中文](https://github.com/Asnow-c/ComponentPreviewer/doc/readme_zh.md) | [EngLish](https://github.com/Asnow-c/ComponentPreviewer)

## 插件启动

1. 插件会在 vscode 打开文件夹后被激活
2. 点击右下角状态栏 "C Prev" 即可启动。

## 特性

该插件针对组件的预览，解决了以下问题：

-   在开发组件时，我们想要预览组件效果，为了提高预览速度，有时我们并不需要将整个项目全部加载，而只需要加载组件依赖的模块。
-   在项目中有些组件需要满足某些条件才会被激活。在这种情况下，对于查看组件效果、组件的调试都比较困难
-   要查看组件不同参数下的效果时，需要修改项目代码

Component Previewer 能够在 vscode 内实时预览组件效果。在编辑器切换到不同组件时，会实时刷新页面，并且能够将提前准备好的数据（测试用例）提供给组件，然后实时预览，还可以配合浏览器调试测试用例。

-   如果项目是非原生 JavaScript 项目，必须配合构建工具一起使用（如 vite 或 webpack）
-   插件预置了预览 **React** 和 **Vue** 组件的功能。如果需要预览其他框架的组件，需要自己编写预设。
-   有些组件必须传入属性，你可以设置 [映射预览](#mapPreview)

### 组件预览

切换自动预览(左边是 Chrome 浏览器，右边是 vscode):

<img src="https://github.com/Asnow-c/ComponentPreviewer/raw/HEAD/doc/img/auto_preview.gif" width="700px"/>
<br/><br/><br/>
设置多个测试用例，可用查看不同参数下的组件效果。配合浏览器，可用对测试用例进行调试。
<br/><br/>
<img src="https://github.com/Asnow-c/ComponentPreviewer/raw/HEAD/doc/img/test_case.gif" height="600px"/>
<br/><br/><br/>
保存自动更新
<br/><br/>
<img src="https://github.com/Asnow-c/ComponentPreviewer/raw/HEAD/doc/img/auto_reload.gif" height="600px"/>

<div id="mapPreview" />

### 映射预览

例如，对于 `A.tsx` , 我们要编写测试用例，则在同一目录下创建 `A.test.tsx`:

```
import A from "./A"
export default function TestCaseA(){
    return <A prop1="test data 1"/>
}
export function TestCaseB(){
    return <A prop1="test data 2"/>
}
```

这将导出两个测试用例，当我们打开`A.tsx`时，预览界面显示的是`A.test.tsx`，我们可用在预览界面顶选择测试用例。
查看插件设置的 [Watch File Path Reg Exp](#WatchFilePathRegExp) 进行更高级的配置

## 原理

vscode 当前正在编辑的文件，我们暂且称之为活动文件。
当活动文件发生变化时（vscode 切换文件），插件会立即将活动文件的信息写入到 [bridgeFile.js](#bridgefile) 中( bridgeFile.js 位于插件自动生成的 [.c_preview](#1) 文件夹中), `bridgeFile.js` 依赖活动文件，并且 `.c_preview/index.html` 依赖 `bridgeFile.js`，所以在浏览器打开 `.c_preview/index.html`，看到的页面就是活动文件的页面。

配合 Vite（Webpack），当`bridgeFile.js`发生改变时，Vite 会自动跟新依赖并自动更新页面，有了这个功能，使得在浏览器中也能实现组件的预览。

> Tips: 你可以利用 `bridgeFile.js`，自己实现预览界面

### Vite 配置

> 对于 Vite 来说，你只要访问到`.c_preview/index.html` 即可实现组件预览

> 注意: `.c_preview` 文件夹 必须在 Vite 的可访问范围内，可查看 `vite.config.js` 的 [root](https://vitejs.dev/config/shared-options.html#root) 配置

#### 配置示例

**`vite.config.js` 配置:**

```
{
    root: "./src/",
}
```

**Component Previewer 的配置：**

Preview Folder: `./src`
Server URL: `http://localhost:5173/.c_preview/index.html` //如果你不想在 vscode 的内置预览窗口预览，这个选项可以忽略

在浏览器中预览地址：`http://localhost:5173/.c_preview/index.html` //Vite 默认端口是 5173

运行 vite 即可自动预览

### Webpack 配置

> 对于 Webpack 来说，只要将 `webpack.config.js` 的 entry 设置 成 `.c_preview/main.js` 即可实现组件预览

#### 配置示例

**`webpack.config.js` 配置**

```
{
    entry: __dirname+"/.c_preview/main.js",
    ...
}
```

**Component Previewer 的配置：**
Preview Folder: `.`
Server URL: `http://localhost:8080` //如果你不想在 vscode 的内置预览窗口预览，这个选项可以忽略

在浏览器中预览地址：`http://localhost:8080` //webpack 默认端口是 8080

运行 `webpack-dev-server` 即可自动预览

<div id=".c_preview">

### .c_preview

.c_preview 文件夹会在开启预览监听时自动生成，可以在设置中更改该文件夹的生成位置。

文件夹包含以下文件：

```
- bridge
    bridgeFile.js
+ preset    //默认预设放在这里
main.js
index.html
```

<div id="bridgeFile">

### bridgeFile

BridgeFile 包含了以下信息：

```
import { render } from "../preset/vue.js";  //导入的预设是根据 presetName 生成的
export const bridgeData = {
    workspaceFolder: "viteReact",
    previewFolderRelPath: "",
    activeFileRelPath: "./B.test.tsx",  //相对于工作区路径
    mapFileRelPath: "./B.test.tsx",     //相对于工作区路径
    presetName: string,                 //根据 watchFilePathRegExp 判断的预设
    workspaceFolderName: string
};
export const preview = () => render(getMod, bridgeData);
const getMod = () => import("../../B.test.tsx");   //这里导入的永远是活动文件
```

## 插件设置

#### Preview Folder

[.c_preview](#.c_preview)文件夹生成的位置。默认生成在工作区文件夹目录下

你可以把.c_preview 设置到 node_modules 下，但需要注意，Vite 和 Webpack 默认不会监听 node_modules 文件夹下的文件，需要对 Vite 和 Webpack 进行额外的配置，以排除`.c_preview`

查看`vite.config.js`的 [server.watch](https://cn.vitejs.dev/config/server-options.html#server-watch)
查看`webpack.config.js`的 [watchOptions.ignored](https://webpack.docschina.org/configuration/watch/#watchoptionsignored)

#### File Path Map Replace

根据配置，如果映射文件存在，就预览问映射文件，如果都不存在，就会预览原文件。
替换字符中"<>"代表的是引用正则表达式的捕获分组，"<1>"代表组 1

这是一个数组类型的值，按顺序匹配替换，格式为`[要匹配的正则表达式, [映射检测列表]]`，默认值为：

```
[
    [ "^(.+)(\\.\\w+)$", [ "<1>.test<2>",  "<1>.spec<2>" ]]
]
```

例如： 活动文件路径：
`/user/work/myProject/src/hello/page.tsx`

映射设置: `"^(.+)(\.\w+))$"`:`"<1>.test<2>"`
正则表达式匹配结果：`["/user/work/myProject/src/hello/src/page.tsx", "/user/work/myProject/src/hello/src/page", ".tsx"]`
最终拼接为:"/user/work/myProject/src/hello/page **.test** .tsx"

映射设置 ： `"^(.+?/)src(/.+)$"`:`"<1>test<2>"`
正则表达式匹配结果：`["/user/work/myProject/src/hello/page.tsx","/user/work/myProject/","/\hello/page.tsx"]`
最终拼接为"/user/work/myProject/ **test** /hello/page.tsx"

<div id="WatchFilePathRegExp"/>
#### Watch File Path Reg Exp

要监听的文件。对于 react 组件预览，也许我们只需监听 `.tsx` 文件即可，而忽略编辑器切换到其他文件时对 `bridgeFile.js` 的更新

这是一个数组类型的值，将按顺序检测，格式为`[预设名，匹配的正则表达式]`，默认值:

```
[
    [ "react", "\\.[tj]sx$" ],
    [ "vue", "\\.vue$" ]
]
```
