[EngLish](https://github.com/Asnow-c/ComponentPreviewer) | [中文](https://github.com/Asnow-c/ComponentPreviewer/doc/readme_zh.md)

## Component Previewer

This plugin allows you to preview components in real time in VSCode. The page is refreshed in real time as the editor switches to a different component. It is also able to provide pre-prepared data to components and preview them in real time, just like writing test cases, without compromising code, and debugging test cases with the browser.

-   The plugin previews the **React** and **Vue** components
-   You can set the preview mapping (When you edit the 'MyPage.tsx' component, you preview 'MyPage.test.tsx'）

Listen for editor switches (preview only listens for jsx, tsx, vue)
![image](https://github.com/Asnow-c/ComponentPreviewer/doc/img/switchFile.gif)

You can manually switch files when exporting multiple components (you can prepare additional sets of data and test components with use cases)
![image](https://github.com/Asnow-c/ComponentPreviewer/doc/img/switchCase.gif)

### Principle

-   Through monitoring vscode editor, access to current the file you are editing, will its information written to the project of `. Preview/bridge/bridgeData js `
-   `bridgeFile.js` exports an object containing the URL of the component currently being edited (relative to the local server)
-   `. Preview ` are automatically generated plug-in directory, you can access `http://localhost:5173/.preview/index.html` (Vite project) in a browser preview test cases
-   When VScode switches components, `bridgeFile.js` will be updated. Those with hot update function such as Vite and Webpack will automatically update the page. Those without hot update function can be previewed in the webView in VScode.

Plug-in Settings page
![image](https://github.com/Asnow-c/ComponentPreviewer/doc/img/switchsetting.png)

> Tips: You can use this principle to implement your own preview page

### How to use

1. Opens a component file in the specified workspace folder
2. Click the `Component Preview` window button in the upper-right corner of the editor
3. In the preview window, click Settings, set the dependent installation directory, click `install`, enter the URL to save, and click the Watch button to listen for the editor to switch files
4. You will also need to set `.preview/main.js` to import presets
5. Different workspaces have different Settings, so you can listen to files in different workspaces

### Example

The Webpack project is actually in the original project can preview the normal situation, change the entry to `. Preview /main.js` path can be accessed as before
And vite don't need any set of the original project, only need to install the plug-in dependencies to vite under the root of the server, by visiting `http://localhost:5173/.preview/index.html` is ok
If you no longer need to preview, simply delete the `. Preview` folder

#### vite project

vite.config.js :

```
export default {
    root: "myWeb",  //Server root Directory
};

```

Open the `Compnonent Previewer` Settings, set the `Server root Directory` Settings and Vite configuration of `root` consistent, click the icon to install dependencies

React configuration `.preview/main.js`:

```
import { autoRender } from "./preset/reactVite"; //React preset, support React16 ~ React18
autoRender();
```

Vue configuration `.preview/main.js`:

```
import { autoRender } from "./preset/vueVite"; //Vue preset, support Vue3，The official version will support Vue2
autoRender();
```

After configuration, start Vite, click `Watch` to preview in real time

> The default in your visit `MyPage. TSX`, automatically preview `MyPage. Test. The TSX`, you can modify `. Preview/preset/re/Comm. ` of js `getActiveFileMap()` custom mapping function.

Or you can set it like this:

```
import { renderFromFileURL } from "./preset/reactVite"; //React预设, 支持 React16 ~ React18
import bridge from "./bridge/bridgeFile.js";
renderFromFileURL("/"+bridge.activeFile);
```

> The official release will provide a faster setup method

#### webpack project

Open the `Compnonent Previewer` Settings, save `Server root Directory` as empty, and click the icon to install dependencies
Set the Server URL to the same as webpack-dev-erver (default http://localhost:8080)

webpack.config.js:

```
module.exports = {
    entry: "./.preview/main.js", //Here it is set to .preview/main.js
    mode: "development",
    devServer: {
        static: {
            directory: "./public",
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

Note that Webpack needs to set `entry` of `webpack.config.js` to`.preview/main.js`

React configuration `.preview/main.js`:

```
import { renderFromActiveModule } from "./preset/vueWebpack"; //React preset, support React16 to React18
renderFromActiveModule();   //Webpack does not support preview mapping, this will be improved in the future
```

Vue configuration `.preview/main.js`:

```
import { renderFromActiveModule } from "./preset/vueWebpack"; //Vue preset, support for Vue3, official version will support VUe2
renderFromActiveModule();   //Webpack does not support preview mapping, this will be improved in the future
```

After configuration, start Webpack-dev-server and click `Watch` for real-time preview

### About

The preview version still has a lot of bugs and some strange state, the official version is still in development, welcome to submit your suggestions

The official release will include the following features

-   Improve previews of all versions of React and Vue
-   Supports listening for custom extensions
-   You can quickly set the preview map directly within the plugin (Webpack will also support the map preview)
-   The Webview in the plugin will support the installation of the specified project preset, no need to modify main.js (Vite project will no longer need to do any Settings, Webpack project only need to modify entry)
