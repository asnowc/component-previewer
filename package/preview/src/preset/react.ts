import * as React from "react";
import { prepare } from "./comm/Comm";
import type { BridgeData } from "../bridge/bridgeFile";

/** 简单判断一个变量是否是组件 */
function isCPN(P: any) {
    if (typeof P === "string") return true;
    if (typeof P === "function") return true;
    return false;
}
export async function render(getMod: () => Promise<Object>, bridgeData: BridgeData) {
    const mod = await getMod();
    const [root, App] = prepare(mod, bridgeData.activeFileRelPath, React, isCPN);
    const version = parseInt(React.version.slice(0, React.version.indexOf(".")));
    if (version >= 18) {
        const reactDOM: any = await import("react-dom/client");
        reactDOM.createRoot(root).render(App);
    } else {
        const reactDOM: any = await import("react-dom");
        reactDOM.render(App, root);
    }
}
