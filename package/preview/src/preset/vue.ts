import * as React from "./comm/VueComponent";
import { prepare } from "./comm/Comm";
import type { BridgeData } from "../bridge/bridgeFile";

/** 简单判断一个变量是否是组件 */
function isCPN(P: any) {
    if (typeof P === "string") return true;
    if (typeof P === "function") return true;
    else if (P && typeof P === "object") return true;
    return false;
}

export async function render(getMod: () => Promise<Object>, bridgeData: BridgeData) {
    const mod = await getMod();
    const [root, App] = prepare(mod, bridgeData.mapFileRelPath, React, isCPN);
    const ReactDOM = React;
    ReactDOM.createRoot(root).render(App);
}
