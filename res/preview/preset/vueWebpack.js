import * as React from "./re/VueCommponent";
import * as ReactDOM from "./re/VueCommponent";
const h = React.createElement;
import * as common from "./re/Comm";
export const comm = common.default(h, React.Component); //React和Vue的共有组件
/** 直接导入bridge/activeModule (预览的是当前活动文件) */
export async function renderFromActiveModule() {
    var mod = await import("../bridge/activeModule");
    render(mod.default);
}
/** 自动导入 (最终预览的是文件映射) */
export function autoRender() {
    return renderFromFileURL(common.getActiveFileMap());
}
/**
 * @param activeFile 你要显示的组件相对路径
 */
export async function renderFromFileURL(activeFile) {
    try {
        if (activeFile instanceof Promise)
            activeFile = await activeFile;
        try {
            var mod = await import(activeFile);
        }
        catch (error) {
            let e = error.toString();
            mod = { default: comm.ErrorTemplate(e) };
            console.error(error);
        }
    }
    catch (error) {
        let e = error.toString();
        mod = { default: comm.ErrorTemplate(e) };
        console.error(error);
    }
    render(mod);
}
export async function render(mod, url) {
    const root = document.createElement("div");
    document.body.appendChild(root);
    root.style.height = "100%";
    //判断一个变量是否是组件
    function isCPN(P) {
        if (typeof P === "string") {
            return true;
        }
        if (typeof P === "function") {
            return true;
        }
        else if (P && typeof P === "object") {
            return true;
        }
        return false;
    }
    var previewList = common.getVDOMList(mod, h, isCPN, url);
    let Temp = comm.HOME;
    const App = h(Temp, { instanceList: previewList });
    ReactDOM.createRoot(root).render(App);
}
