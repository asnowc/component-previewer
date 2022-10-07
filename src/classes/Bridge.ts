import * as VS from "vscode";
import { extContext } from "../extension";
import type { BridgeData } from "../../package/preview/src/bridge/bridgeFile";
import * as path from "node:path/posix";

const fsv = VS.workspace.fs;

abstract class PreviewFile {
    constructor(protected name: string) {}
    test(distUri: VS.Uri) {
        return fsv.stat(VS.Uri.joinPath(distUri, this.name)).then(undefined, (e: VS.FileSystemError) => {
            e.code === "FileNotFound" && this.install(distUri);
        });
    }
    getDistUri(distFolderUri: VS.Uri) {
        return VS.Uri.joinPath(distFolderUri, this.name);
    }
    abstract install(distUri: VS.Uri): Thenable<any>;
}
class SrcFile extends PreviewFile {
    srcFolderUri;
    constructor(srcFolderUri: VS.Uri, name: string) {
        super(name);
        this.srcFolderUri = this.getDistUri(srcFolderUri);
    }

    install(distFolderUri: VS.Uri) {
        return fsv.copy(this.srcFolderUri, this.getDistUri(distFolderUri));
    }
}
class DataFile extends PreviewFile {
    data: Buffer;
    constructor(data: string, name: string) {
        super(name);
        this.data = Buffer.from(data);
    }
    install(distFolderUri: VS.Uri): Thenable<any> {
        return fsv.writeFile(this.getDistUri(distFolderUri), this.data);
    }
}

export class Bridge {
    private static extUri = VS.Uri.joinPath(extContext.extensionUri, "out/res/preview");
    static files: PreviewFile[] = [
        new SrcFile(this.extUri, "preset"),
        new DataFile(
            `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
            html,
            body {
                margin: 0;
                padding: 0;
                background-color: #fff;
                height: 100%;
            }
        </style>
    </head>
    <body></body>
    <script></script>
    <script src="./main.js" type="module"></script>
</html>`,
            "index.html"
        ),
        new DataFile(
            `import { preview } from "./bridge/bridgeFile";
await preview();

//do some thing...`,
            "main.js"
        ),
    ];
    private get folderUri() {
        return VS.Uri.joinPath(this.rootDirUri, ".c_preview");
    }
    constructor(public rootDirUri: VS.Uri) {}
    async move(rootUri: VS.Uri) {
        if (this.rootDirUri.toString() === rootUri.toString()) return;
        await this.revoke();

        this.rootDirUri = rootUri;
        return this.install();
    }
    /** 重新安装preview文件夹 */
    install() {
        let thenable: Thenable<void>[] = [];
        for (const file of Bridge.files) {
            thenable.push(file.test(this.folderUri));
        }
        return Promise.all(thenable);
    }
    async revoke() {
        try {
            return await fsv.delete(this.folderUri, { recursive: true });
        } catch (error) {
            let e = error as VS.FileSystemError;
            if (e.code === "FileNotFound") return;
            throw error;
        }
    }
    private witeFile(dir: VS.Uri, jsData: Uint8Array, cjsData: Uint8Array) {
        const cjsUri = VS.Uri.joinPath(dir, "bridgeFile.cjs");
        const jsUri = VS.Uri.joinPath(dir, "bridgeFile.js");
        // await Promise.all([fse.ensureFile(jsUri), fse.ensureFile(cjsUri)]);
        return Promise.all([fsv.writeFile(jsUri, jsData), fsv.writeFile(cjsUri, cjsData)]);
    }
    updateBridgeFile(bridgeData: BridgeData) {
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
        return this.witeFile(VS.Uri.joinPath(this.folderUri, "bridge"), Buffer.from(jsData), Buffer.from(cjsData));
    }
}

export type { BridgeData } from "../../package/preview/src/bridge/bridgeFile";
