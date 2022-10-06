import * as VS from "vscode";
import { extContext } from "../extension";
import type { BridgeData } from "../../package/preview/src/bridge/bridgeFile";
import * as path from "node:path/posix";

const fsv = VS.workspace.fs;

export type { BridgeData } from "../../package/preview/src/bridge/bridgeFile";
export class Bridge {
    private rootUri?: VS.Uri;
    get root() {
        return this.rootUri?.toString();
    }
    private extUri = VS.Uri.joinPath(extContext.extensionUri, "out/res/preview");
    constructor() {}
    async setRoot(rootUri: VS.Uri) {
        rootUri = VS.Uri.joinPath(rootUri, ".c_preview");
        if (rootUri.toString() !== this.rootUri?.toString()) {
            if (this.rootUri) {
                await fsv.copy(this.rootUri, rootUri, { overwrite: true });
                await fsv.delete(this.rootUri, { recursive: true });
            } else await fsv.copy(this.extUri, rootUri, { overwrite: true });

            this.rootUri = rootUri;
        }
    }
    kill() {
        const promise = this.rootUri && fsv.delete(this.rootUri, { recursive: true });
        this.rootUri = undefined;
        return promise;
    }
    private witeFile(dir: VS.Uri, jsData: Uint8Array, cjsData: Uint8Array) {
        const cjsUri = VS.Uri.joinPath(dir, "bridgeFile.cjs");
        const jsUri = VS.Uri.joinPath(dir, "bridgeFile.js");
        // await Promise.all([fse.ensureFile(jsUri), fse.ensureFile(cjsUri)]);
        return Promise.all([fsv.writeFile(jsUri, jsData), fsv.writeFile(cjsUri, cjsData)]);
    }
    updateBridgeFile(bridgeData: BridgeData) {
        if (!this.rootUri) return;
        let bridgeFolderRelPath = path.join(bridgeData.previewFolderRelPath, "bridge");
        let relModPath = path.relative(bridgeFolderRelPath, bridgeData.mapFileRelPath);

        const bridgeDataText = `${JSON.stringify(bridgeData, null, 4)};`;
        const previewFxText = `async function preview() {
    try {
        var [mod, preset] = await Promise.all([import("${relModPath}"), import("../preset/${bridgeData.presetName}")]);
    } catch (error) {
        console.error("活动模块导入失败:");
        console.error(error);
    }
    preset.render(mod, bridgeData);
}`;
        const jsData = `export const bridgeData = ${bridgeDataText}
export ${previewFxText}`;
        const cjsData = `exports.bridgeData = ${bridgeDataText}
exports.preview = ${previewFxText}`;
        return this.witeFile(VS.Uri.joinPath(this.rootUri, "bridge"), Buffer.from(jsData), Buffer.from(cjsData));
    }
}
