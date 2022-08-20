import * as fs from "fs/promises";
import * as fse from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import type { WorkspaceFolder, ExtensionContext, Webview } from "vscode";

var env = "pd";
const dev = {
    errorMessage(msg: string) {
        if (env === "dev") vscode.window.showErrorMessage("Component Previewer: " + msg);
    },
    waringMessage(msg: string) {
        if (env === "dev") vscode.window.showWarningMessage("Component Previewer: " + msg);
    },
    infoMessage(msg: string) {
        if (env === "dev") vscode.window.showInformationMessage("Component Previewer: " + msg);
    },
};

/**
 *  @description 获取活动的工作区文件夹. 如果没有则为undefined
 */
function getActiveFolder() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return undefined;
    const activeFileName = vscode.window.activeTextEditor?.document.fileName;
    if (!activeFileName) return undefined;

    if (workspaceFolders.length === 1) return workspaceFolders[0];
    for (let i = workspaceFolders.length - 1; i >= 0; i--) {
        let folder = workspaceFolders[i];
        if (activeFileName.startsWith(folder.uri.fsPath)) return folder;
    }
    return undefined;
}
function errorMessage(msg: string) {
    vscode.window.showErrorMessage("Component Previewer: " + msg);
}
function waringMessage(msg: string) {
    vscode.window.showWarningMessage("Component Previewer: " + msg);
}
function infoMessage(msg: string) {
    vscode.window.showInformationMessage("Component Previewer: " + msg);
}
/** @description 获取扩展设置信息 */
function getExtensionConfig(workSpaceFolder?: vscode.WorkspaceFolder) {
    return vscode.workspace.getConfiguration("ComponentPreviewer", workSpaceFolder);
}

class ComponentPreview {
    baseData: {
        serverURL?: string;
        watch: boolean;
        serverRootDir: string;
        workspaceFolderName: string;
        workspaceFolderDir: string;
        autoReload: boolean;
    };
    activeFile?: string;
    workspaceFolder: vscode.WorkspaceFolder;
    wsFolderExtensionConfig: vscode.WorkspaceConfiguration;
    private constructor(workspaceFolder: vscode.WorkspaceFolder) {
        var config = vscode.workspace.getConfiguration("ComponentPreviewer", workspaceFolder);
        this.wsFolderExtensionConfig = config;

        var serverRootDir = <string | null>config.get("serverRootDir");
        this.workspaceFolder = workspaceFolder;
        var workspaceFolderDir = workspaceFolder.uri.fsPath;
        this.baseData = {
            serverURL: config.get("serverURL"),
            /** 相对于workspaceFolderDir */
            serverRootDir: serverRootDir ? serverRootDir : "",
            watch: false,
            workspaceFolderName: workspaceFolder.name,
            workspaceFolderDir,
            autoReload: false,
        };
    }
    /** webView收到通知会触发的函数 */
    message(command: string, context: any) {
        var data = this.baseData;
        switch (command) {
            case "watch":
                if (context === data.watch) return;
                data.watch = context;
                if (!context) this.activeFile = "";
                ComponentPreview.onActiveTextEditorChange();
                break;
            case "updateURL":
                if (context === data.serverURL) return;
                data.serverURL = context;
                if (typeof context === "string") this.wsFolderExtensionConfig.update("serverURL", context);
                break;
            case "updateServerRootDir":
                if (context === data.serverRootDir) return;
                data.serverRootDir = context;
                this.wsFolderExtensionConfig.update("serverRootDir", context);
                break;
            case "install":
                this.installNodeModule();
                break;
            case "autoReload":
                this.baseData.autoReload = context;

            case "fin":
                ComponentPreview.webview?.postMessage({ command: "vsUpdate", arg: this.baseData });
                break;
            default:
                break;
        }
    }
    async updateBridgeFile(activeFile: string) {
        this.activeFile = activeFile;
        var { serverRootDir, workspaceFolderDir } = this.baseData;
        var absServerRootDir = path.join(workspaceFolderDir, serverRootDir);
        activeFile = path.relative(absServerRootDir, activeFile);
        if (path.sep === "\\") {
            activeFile = activeFile.replaceAll("\\", "/");
            workspaceFolderDir = workspaceFolderDir.replaceAll("\\", "/");
            absServerRootDir = absServerRootDir.replaceAll("\\", "/");
        }
        const previewRoot = absServerRootDir + "/.preview";

        async function witeFile(jsData: string, cjsData: string, pathNoEixts: string) {
            const cjsPath = pathNoEixts + ".cjs";
            const jsPath = pathNoEixts + ".js";

            await Promise.all([fse.ensureFile(jsPath), fse.ensureFile(cjsPath)]).catch(function () {
                errorMessage("Unable to update the bridge file: " + pathNoEixts + "\nMay not have access");
            });

            return Promise.all([fs.writeFile(jsPath, jsData, "utf-8"), fs.writeFile(cjsPath, cjsData, "utf-8")]).catch(
                function () {
                    errorMessage("Unable to update the bridge file: " + pathNoEixts + "\nMay not have access");
                }
            );
        }

        {
            // /** 工作区根目录(绝对) */
            // workSpaceFolder: string;
            // /** 工作区文件夹名字 */
            // workspaceFolderName: string;
            // /** 工作文件路径, 相对于serverRoot */
            // activeFile: string;
            // /** 服务器根目录(绝对) */
            // absServerRoot: string;
            // /** 预览文件夹根目录 (绝对)(serverRoot/.preview)*/
            // previewRoot: string;
            let bridgeFileData = `{
    workSpaceFolder: "${workspaceFolderDir}",
    workspaceFolderName:"${this.workspaceFolder.name}",
    activeFile:"${activeFile}",
    absServerRootDir: "${absServerRootDir}",
    previewRoot: "${previewRoot}",
};`;
            let exportName = "bridgeFile";
            let BridgePath = path.join(previewRoot, "bridge", exportName);
            let jsData = `export const ${exportName} = ${bridgeFileData} 
export default ${exportName};`;
            let cjsData = `exports.${exportName}= ${bridgeFileData}
exports.${exportName}= exports.${exportName};`;
            var bridgeFileWitePromise = witeFile(jsData, cjsData, BridgePath);
        }
        {
            let actModPathNoEx = path.join(previewRoot, "bridge", "activeModule");
            let relActFile = path.relative(path.join(previewRoot, "bridge"), this.activeFile).replaceAll("\\", "/");
            let activeModuleData_js = 'import * as all from "' + relActFile + '";\nexport default all;';
            let activeModuleData_cjs = 'exports.default= require("' + relActFile + '").default;';
            var activeModuleWitePromise = witeFile(activeModuleData_js, activeModuleData_cjs, actModPathNoEx);
        }
        ComponentPreview.webview?.postMessage("onActiveFileChange")
        dev.infoMessage("更新文件" + activeFile);
        return Promise.all([bridgeFileWitePromise, activeModuleWitePromise]);
    }
    onActiveFileUpdate() {
        const active = ComponentPreview.acitve;
        var activeFile = active.TextEditor?.document.uri.fsPath;
        if (this.baseData.watch && active.folder && activeFile && activeFile !== this.activeFile)
            this.updateBridgeFile(activeFile);
    }
    /** 向工作区安装依赖文件 */
    async installNodeModule() {
        var ExtensionPath = ComponentPreview.ExtensionPath;

        var { workspaceFolderDir, serverRootDir } = this.baseData;
        var res = path.join(ExtensionPath, "res", "preview");
        var dist = path.join(workspaceFolderDir, serverRootDir, ".preview");
        await fse.ensureDir(dist);
        function copyFailed(path: string, err: Error) {
            errorMessage(`Failed to install ${path} \n May not have access`);
        }
        var ps: Promise<void>[] = [];
        {
            //复制index.html和main.js
            let filelist = await fs.readdir(dist);
            let hasIndexHTML = false,
                hasMainScript = false;
            for (const it of filelist) {
                if (it.search(/^index\.html$/) === 0) hasIndexHTML = true;
                else if (it.search(/main\.[mc]?[jt]s/) === 0) hasMainScript = true;
            }
            if (!hasIndexHTML) {
                let dd = path.join(dist, "index.html");
                ps[2] = fse.copyFile(path.join(res, "index.html"), dd).catch(copyFailed.bind(undefined, dd));
            }
            if (!hasMainScript) {
                let dd = path.join(dist, "main.js");
                ps[3] = fse.copyFile(path.join(res, "main.js"), dd).catch(copyFailed.bind(undefined, dd));
            }
        }
        {
            //复制preset和复制bridge
            let dd1 = "preset",
                dd2 = "bridge";
            let presetDist = path.join(dist, dd1);
            let bridgeDist = path.join(dist, dd2);
            ps[0] = fse.copy(path.join(res, dd1), presetDist).catch(copyFailed.bind(undefined, presetDist));
            ps[1] = fse.copy(path.join(res, dd2), bridgeDist).catch(copyFailed.bind(undefined, bridgeDist));
        }
        await ps;
        infoMessage("Succeeded in installing " + dist);
        if (this.activeFile) this.updateBridgeFile(this.activeFile);
    }
    private static created = new Map<string, ComponentPreview>();
    private static webview: Webview | null;
    /** 当前扩展的绝对路径 */
    private static ExtensionPath: string;
    static acitve = {
        folder: <WorkspaceFolder | undefined>undefined,
        TextEditor: <vscode.TextEditor | undefined>undefined,
        /** 活动的工作区文件夹对应的ComponentPreview实例 */
        ComponentPreview: <ComponentPreview | undefined>undefined,
    };

    private static listen = new Set<string>([".TSX", ".JSX", ".VUE"]);
    /** 文本编辑器切换钩子函数 */
    private static onActiveTextEditorChange() {
        var acitve = this.acitve;
        acitve.TextEditor = vscode.window.activeTextEditor;
        if (!acitve.TextEditor) return; //不存在活动文本编辑器

        const activateFolder = getActiveFolder();
        acitve.folder = activateFolder;
        if (!activateFolder) return; //不存在活动工作区文件夹

        let actCPV = acitve.ComponentPreview;
        var NextCPV = this.created.get(activateFolder.uri.fsPath);
        if (!NextCPV) {
            //进入新的工作区
            NextCPV = this.getInstane(activateFolder);
            this.show(NextCPV, true);
        } else if (NextCPV !== actCPV) this.show(NextCPV, true); //进入不同工作区

        {
            let activeFile = acitve.TextEditor.document.fileName;
            let ext: string = <any>path.basename(activeFile).match(/\.[^\.]+$/);
            if (!ext) return;
            else ext = ext[0].toLocaleUpperCase();
            if (this.listen.has(ext)) NextCPV.onActiveFileUpdate();
        }
    }
    /**
     * todo
     * @description 更新活动文件
     * @param activeFile 活动文件的绝对路径
     */
    private static onDidSaveTextDocument() {
        let activeFile = this.acitve.TextEditor?.document.fileName;
        if (!activeFile) return;
        let ext: string = <any>path.basename(activeFile).match(/\.[^\.]+$/);
        if (!ext) return;
        else ext = ext[0].toLocaleUpperCase();
        if (this.listen.has(ext)) {
            this.webview?.postMessage({ command: "onActiveFileChange" });
            dev.infoMessage("更新文件");
        }
    }
    private static onWebViewClosed() {
        this.webview = null;
        this.created.clear();
        this.acitve = <any>{};
    }
    private static onReceiveMessage(data: any) {
        var acitve = this.acitve;
        if (!data || typeof data !== "object") {
            errorMessage("Error message:" + data);
        } else if (acitve.ComponentPreview) {
            acitve.ComponentPreview.message(data.command, data.context);
        } else {
            errorMessage("An error was encountered.");
        }
    }
    private static createWebView() {
        let panel = vscode.window.createWebviewPanel("catCoding", "Preview", vscode.ViewColumn.Beside, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(this.ExtensionPath, "res", "webview"))],
        });
        const webview = panel.webview;

        let jsURI = vscode.Uri.file(path.join(this.ExtensionPath, "res", "webview", "index.js"));

        let jsWebViewURI = webview.asWebviewUri(jsURI);
        webview.html = `<!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <title>Component Preview</title>
                <style>
                    html,
                    body {
                        margin: 0;
                        padding: 0;
                        height: 100%;
                    }
                </style>
            </head>
            <body></body>
            <script src=${jsWebViewURI}  type="module"></script>
        </html>`;
        webview.onDidReceiveMessage(this.onReceiveMessage, this);
        panel.onDidDispose(this.onWebViewClosed, this);
        return panel;
    }

    /**
     * 监听编辑器切换
     * 监听文件保存
     * @param path 插件路径
     */
    static async init(path: string) {
        if (this.webview) return;
        this.ExtensionPath = path;

        vscode.window.onDidChangeActiveTextEditor(this.onActiveTextEditorChange, this);
        vscode.workspace.onDidSaveTextDocument(this.onDidSaveTextDocument, this);
    }
    /** 显示指定的CPD */
    static show(CPD: ComponentPreview, sendData?: boolean) {
        const acitve = this.acitve;
        if (!this.webview) return;
        const actCPV = acitve.ComponentPreview;
        if (actCPV === CPD) return;
        acitve.ComponentPreview = CPD;
        if (sendData) this.webview.postMessage({ command: "vsUpdate", arg: CPD.baseData });
    }
    static getInstane(workspaceFolderath: vscode.WorkspaceFolder) {
        const CPD = new ComponentPreview(workspaceFolderath);

        this.created.set(workspaceFolderath.uri.fsPath, CPD);
        return CPD;
    }
    static open() {
        if (this.webview) {
            // infoMessage("预览窗口已经打开");
            return;
        }

        var activeWorkspaceFolder = getActiveFolder();
        if (!activeWorkspaceFolder) {
            infoMessage("You have to open a workspace folder");
            return;
        }

        let panel = this.createWebView();
        this.webview = panel.webview;

        this.show(this.getInstane(activeWorkspaceFolder));
    }
}

export async function activate(context: ExtensionContext) {
    await ComponentPreview.init(context.extensionUri.fsPath);
    vscode.commands.registerCommand("ComponentPreviewer.openView", ComponentPreview.open, ComponentPreview);
}

export function deactivate() {}
