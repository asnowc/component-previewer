import type { BridgeData } from "../bridge/bridgeFile";

export async function render(getMod: () => Promise<Object>, bridgeData: BridgeData) {
    document.body.innerText = "Preset: other";
}
