import * as React from "react";
import { createElement as h } from "react";
import * as common from "./re/Comm";
export const comm = common.default(h, React.Component); //React和Vue的共有组件

type obj = { [key: string | number | symbol]: any };
export async function render(mod: any, url?: string) {
    const root = document.createElement("div");
    document.body.appendChild(root);
    root.style.height = "100%";
    //判断一个变量是否是组件
    function isCPN(P: any) {
        if (typeof P === "string") {
            return true;
        }
        if (typeof P === "function") {
            return true;
        }
        return false;
    }
    var previewList = common.getVDOMList(mod, h, isCPN, url);
    let Temp = comm.HOME as any;
    const App = <Temp instanceList={previewList}></Temp>;

    let version = parseInt(React.version.slice(0, React.version.indexOf(".")));
    var reactDOM: any = await (version >= 18 ? import("react-dom/client") : import("react-dom"));
    if (version >= 18) reactDOM.createRoot(root).render(App);
    else reactDOM.render(App, root);
}

/** 直接导入bridge/activeModule (预览的是当前活动文件) */
export async function renderFromActiveModule() {
    var mod = await import("../bridge/activeModule");
    var info = await import("../bridge/bridgeFile");
    render(mod.default, info.default.activeFile);
}
