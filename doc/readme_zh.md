[中文](https://github.com/Asnow-c/ComponentPreviewer/doc/readme_zh.md) | [EngLish](https://github.com/Asnow-c/ComponentPreviewer)

## Component Previewer

该插件能够在 vscode 内实时预览组件效果。在编辑器切换到不同组件时，会实时刷新页面。并且能够像写测试用例一样，将提前准备好的数据提供给组件，然后实时预览，并且不会入侵代码，还可以配合浏览器调试测试用例。

-   插件预置了预览 **React** 和 **Vue** 组件的功能
-   你可以设置预览映射（在编辑 `MyPage.tsx` 组件时预览的是 `MyPage.test.tsx`）

监听编辑器的切换(预览版只监听 jsx、tsx、vue)

![image](https://github.com/Asnow-c/ComponentPreviewer/blob/master/doc/img/switchFile.gif)

文件导出多个组件时，可以手动切换(你可以多准备几组数据，用例测试组件)

![image](https://github.com/Asnow-c/ComponentPreviewer/blob/master/doc/img/switchCase.gif)

### 实现原理

实现原理：

-   通过监听 vscode 编辑器，获取当前正在编辑的文件，将它的信息写入到项目的 `.preview/bridge/bridgeData.js`
-   `bridgeData.js` 导出一个对象, 对象包含了当前正在编辑的组件的 URL(相对于本地服务器)
-   `.preview` 是插件自动生成的目录，可以通过访问 `http://localhost:5173/.preview/index.html` (Vite 项目) 在浏览器预览测试用例
-   当 vscode 切换组件时，`bridgeData.js` 更新，有热更新功能的如 Vite、Webpack 会自动更新页面，没有热更新功能的可以在 vscode 内的 webView 预览。

插件设置界面:

![image](https://github.com/Asnow-c/ComponentPreviewer/blob/master/doc/img/setting.png)

> Tips: 你可以利用这个原理，自己实现预览界面

### 使用方法

1. 在指定工作区文件夹中打开一个组件文件
2. 点击编辑器右上角的窗口按钮 `Component Preview`
3. 在预览窗口中点击设置，设置依赖安装目录，点击`install`，输入 URL 保存, 点击 watch 按钮即可监听编辑器切换文件
4. 你还需要设置`.preview/main.js`，导入预设
5. 不同工作区有不同的设置，你可以分别监听不同工作区的文件

### 示例

webpack 项目其实就是在能原本项目能正常预览的情况下，将 entry 修改成`.preview/main.js`的路径就可以了，访问方式与原来一样
而 vite 不需要对原项目进行任何设置，只需要将插件依赖安装到 vite 服务器的 root 下，通过访问`http://localhost:5173/.preview/index.html`就可以了
如果你不再需要预览，只需删除`.preview`文件夹

#### vite 项目

vite.config.js :

```
export default {
    root: "myWeb",  //服务器根目录
};

```

打开`Compnonent Previewer`的设置，将`Server root Directory`设置和 Vite 配置的 `root` 保持一致，点图标安装依赖

React 配置 `.preview/main.js`:

```
import { autoRender } from "./preset/reactVite"; //React预设, 支持 React16 ~ React18
autoRender();
```

Vue 配置 `.preview/main.js`:

```
import { autoRender } from "./preset/vueVite"; //Vue预设, 支持 Vue3，正式版会支持VUe2
autoRender();
```

配置完后启动 vite，点击`watch`即可实时预览

> 该预设在你访问 `MyPage.tsx` 时，会自动预览 `MyPage.test.tsx`，你可以修改`.preview/preset/re/Comm.js`中的 `getActiveFileMap()`函数自定义映射.

或者你可以这样设置:

```
import { renderFromFileURL } from "./preset/reactVite"; //React预设, 支持 React16 ~ React18
import bridge from "./bridge/bridgeFile.js";
renderFromFileURL("/"+bridge.activeFile);
```

> 正式版会提供更捷的设置方法

#### webpack 项目

打开`Compnonent Previewer`的设置，将`Server root Directory`保存为空，点图标安装依赖
Server URL 设置为和 webpack-dev-erver 一致(默认 http://localhost:8080)

webpack.config.js:

```
module.exports = {
    entry: "./.preview/main.js", //这里设置为.preview/main.js
    mode: "development",
    devServer: {
        static: {
            directory: "./public",  //打包的出口文件夹
        },
        compress: false,
    },
    resolve: {
        extensions: [".js", ".ts", ".jsx", ".tsx"],
    },
    module: {
        rules: [{
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "ts-loader",
                    },
                ],
            },
        ],
    }
};

```

要注意，webpack 需要将 `webpack.config.js` 的 `entry` 设置为 `.preview/main.js`

React 配置 `.preview/main.js`:

```
import { renderFromActiveModule } from "./preset/vueWebpack"; //React预设, 支持 React16 ~ React18
renderFromActiveModule();   //webpack不支持预览映射，后续会改进这个问题
```

Vue 配置 `.preview/main.js`:

```
import { renderFromActiveModule } from "./preset/vueWebpack"; //Vue预设, 支持 Vue3，正式版会支持VUe2
renderFromActiveModule();   //webpack不支持预览映射，后续会改进这个问题
```

配置完后启动 webpack-dev-server，点击 `watch` 即可实时预览

### 关于

预览版还存在较多 bug，和一些令人奇怪的状态，目前正式版还在开发中，欢迎提交您的建议

正式版将包含以下功能

-   完善 React、Vue 所有版本的预览预设
-   支持监听自定义扩展名
-   可以直接在插件内快捷设置预览映射 (webpack 将也支持映射预览)
-   插件内的 webview 将支持一建安装指定项目的预设，不需要再修改 main.js (到时候 vite 项目将不再需要进行任何设置，webpack 项目只需要修改 entry)
