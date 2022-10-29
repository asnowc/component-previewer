import { createElement, createRoot, Component } from "./comm/VueComponent";
import { createPage } from "./comm/comm";
import { bridgeData } from "../bridge/bridgeFile";

/** 简单判断一个变量是否是组件 */
function isCpn(P: any) {
    let type = typeof P;
    return type === "function" || (type === "object" && type !== null);
}

export async function render(getMod: () => Promise<any>) {
    const [root, App] = await createPage(getMod(), bridgeData, {
        Component,
        createElement,
        isCpn,
    });
    document.body.appendChild(root);
    createRoot(root).render(App);
}
