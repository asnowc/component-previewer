import type { BridgeData } from "../bridge/bridgeFile";

export async function render(getMod: () => Promise<Object>, bridgeData: BridgeData) {
    let iframe = document.createElement("iframe");
    iframe.src = "/" + bridgeData.mapFileRelPath;
    iframe.frameBorder = "0";
    Object.assign(iframe.style, { width: "100%", height: `100%` });
    document.body.append(iframe);
}
