import * as ReactDOM from "react-dom/client";
import * as React from "react";
import * as ILang from "./lang/lang";
import * as MS from "../message";

import { Head } from "./pages/home";

import type { LangMap } from "./lang/lang";
declare global {
    var lang: LangMap;
    var acquireVsCodeApi: (() => any) | undefined;
    var vscode: { postMessage(data: MS.ext.onMsData): void };
    var env: MS.Env;
}

if (window.acquireVsCodeApi) {
    window.vscode = acquireVsCodeApi!();
    console.log = function () {};
} else {
    window.env = {
        language: "zh-cn",
        mode: "dev",
    };
    //浏览器环境, 用来调试
    window.vscode = {
        postMessage(data: MS.ext.onMsData) {
            console.log(data.command + ": " + JSON.stringify(data.context));
        },
    };

    setTimeout(() => {
        const e = new MessageEvent("message", {
            data: {
                command: "setWebViewBaseData",
                context: [
                    {
                        serverURL: "http://localhost:8080",
                        previewFolderRelPath: "node_modules",
                        watch: false,
                        workspaceFolderDir: "d:/xx",
                        workspaceFolderName: "Unknown",
                        autoReload: false,

                        watchFilePathRegExp: { react: "xxx" },
                        filePathMapReplace: {
                            "\\.(?=\\w+$)": ["<0>test.", "<0>spec."],
                        },
                    } as MS.baseData,
                ],
            },
        });
        window.dispatchEvent(e);
    }, 1000);
}
window.lang = ILang.getLang(env.language ?? "en");

var div = document.createElement("div");
div.style.height = "100%";
div.style.backgroundColor = "#FFF";
div.style.color = "#000";
document.body.appendChild(div);

ReactDOM.createRoot(div).render(React.createElement(Head));
