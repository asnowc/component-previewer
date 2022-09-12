import * as React from "./re/VueCommponent";
import * as ReactDOM from "./re/VueCommponent";
const h = React.createElement;
import * as common from "./re/Comm";
export const comm = common.default(h, React.Component); //React和Vue的共有组件

/** 直接导入bridge/activeModule (预览的是当前活动文件) */
export async function renderFromActiveModule() {
    try {
        var mod: any = await import("../bridge/activeModule");
    } catch (error) {
        mod = { default: { default: comm.ErrorTemplate("无法加载activeModule") } };
    }
    render(mod.default);
}
export async function render(mod: any, url: string = "unknow") {
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
        } else if (P && typeof P === "object") {
            return true;
        }
        return false;
    }
    const App = <comm.HOME mod={mod} url={url} isCommponent={isCPN}></comm.HOME>;
    ReactDOM.createRoot(root).render(App);
}
