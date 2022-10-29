import * as VS from "vscode";
import { extContext } from "../extension";
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
            `import { preview } from "./bridge/bridgeFile.js";
preview();  //return a promise

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

        let oldUri = this.folderUri;
        this.rootDirUri = rootUri;
        try {
            let info = await fsv.stat(oldUri);
            if (info.type === VS.FileType.Directory) {
                await fsv.copy(oldUri, this.folderUri, { overwrite: true });
                await fsv.delete(oldUri, { recursive: true });
            }
        } catch (error) {}
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
    updateBridgeFile(bridgeData: BridgeData) {
        let bridgeFolderRelPath = path.join(bridgeData.previewFolderRelPath, "bridge");
        let relModPath = path.relative(bridgeFolderRelPath, bridgeData.mapFileRelPath);

        const data = `import { render } from "../preset/${bridgeData.presetName}.js";
export const bridgeData = ${JSON.stringify(bridgeData, null, 4)};
export const preview = () => render(getMod);
const getMod = () => import("${relModPath}");`;
        return fsv.writeFile(VS.Uri.joinPath(this.folderUri, "bridge/bridgeFile.js"), Buffer.from(data));
    }
}

export type BridgeData = {
    /** 工作区根目录(绝对) */
    workspaceFolder: string;
    /** 工作区文件夹名字 */
    workspaceFolderName: string;
    /** 预览文件夹根目录, 相对于 workspaceFolder */
    previewFolderRelPath: string;
    /** 活动文件相对路径(相对于 workspaceFolder) */
    activeFileRelPath: string;
    /** 映射文件相对路径(相对于 workspaceFolder) */
    mapFileRelPath: string;
    /** 预设名称 */
    presetName: string;
};
