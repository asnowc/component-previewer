import { createElement, Component, version } from "react";
import * as ReactDOM from "react-dom";
import { createPage } from "./comm/comm";
import { bridgeData } from "../bridge/bridgeFile";

/** 简单判断一个变量是否是组件 */
function isCpn(P: any) {
    return typeof P === "function";
}
export async function render(getMod: () => Promise<any>) {
    const [root, App] = await createPage(getMod(), bridgeData, {
        Component,
        createElement,
        isCpn,
    });
    document.body.appendChild(root);
    const flag = parseInt(version.slice(0, version.indexOf(".")));
    if (flag >= 18) {
        (ReactDOM as any).createRoot(root).render(App);
    } else {
        (ReactDOM as any).render(App, root);
    }
}
