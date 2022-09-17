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

function errorMessage(msg: string) {
    vscode.window.showErrorMessage("Component Previewer: " + msg);
}
function waringMessage(msg: string) {
    vscode.window.showWarningMessage("Component Previewer: " + msg);
}
function infoMessage(msg: string) {
    vscode.window.showInformationMessage("Component Previewer: " + msg);
}
export const CMDS = {
    openView: "ComponentPreviewer.openView",
};
export let extContext: ExtensionContext;
let statusBarDispatcher: StatusBarDispatcher;
export async function activate(context: ExtensionContext) {
    extContext = context;
    statusBarDispatcher = StatusBarDispatcher.getInstance();
}

export function deactivate() {}

class StatusBarDispatcher {
    private static instance: StatusBarDispatcher;

    private readonly Views = new Map<WorkspaceFolder, View>();
    private readonly viewInfos = new Map<View, { barSet: StatusBarDispatcher["defaultViewInfo"] }>();
    private readonly statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    private activeFolder?: WorkspaceFolder;
    private get activeView(): View | undefined {
        return this.activeFolder && this.Views.get(this.activeFolder);
    }
    private readonly defaultViewInfo = { toltip: "打开预览界面", text: "C Prev" };
    private constructor() {
        extContext.subscriptions.push(
            vscode.commands.registerCommand(CMDS.openView, () => {
                if (!this.activeFolder) return;

                const activeView = this.Views.get(this.activeFolder);
                if (activeView) activeView.click();
                else {
                    //创建新的工作区监控视图
                    const view = new View(
                        this.activeFolder,
                        this.onViewClose.bind(this, this.activeFolder),
                        this.setBarInfo
                    );
                    this.Views.set(this.activeFolder, view);
                }
            }),
            this.statusBar
        );
        this.statusBar.command = CMDS.openView;
        {
            const activeTextEditor = vscode.window.activeTextEditor;
            const activeFolder = activeTextEditor && this.getActiveFolder(activeTextEditor);
            activeFolder && this.setActiveFolder(activeFolder);
        }

        vscode.workspace.onDidChangeWorkspaceFolders(
            (e) => {
                const views = this.Views;
                //有工作区文件夹被删除
                for (const it of e.removed) {
                    let view = views.get(it);
                    view && view.close();
                }
            },
            undefined,
            extContext.subscriptions
        );
        vscode.window.onDidChangeActiveTextEditor(
            (activeTextEditor) => {
                if (activeTextEditor) {
                    const activeFolder = this.getActiveFolder(activeTextEditor);
                    if (activeFolder) {
                        this.setActiveFolder(activeFolder);
                        this.activeView?.onChangeActiveFile(activeTextEditor);
                        return;
                    }
                }
                this.statusBar.hide();
            },
            undefined,
            extContext.subscriptions
        );
        vscode.workspace.onDidSaveTextDocument(
            (e) => {
                this.activeView?.onActiveFileSave();
            },
            undefined,
            extContext.subscriptions
        );
    }
    private setBarInfo = (view: View, infoObj: StatusBarDispatcher["defaultViewInfo"]) => {
        if (this.activeFolder && this.Views.get(this.activeFolder) === view) {
            Object.assign(this.statusBar, infoObj);
        } else {
            let viewInfo = this.viewInfos.get(view);
            if (viewInfo) viewInfo.barSet = infoObj;
        }
    };
    private setActiveFolder(folder: WorkspaceFolder) {
        if (folder === this.activeFolder) return;
        else {
            this.statusBar.show();
            this.activeFolder = folder;
        }

        let barSet = this.defaultViewInfo;
        const activeView = folder ? this.Views.get(folder) : undefined;
        if (activeView) {
            this.activeFolder = folder;
            barSet = this.viewInfos.get(activeView)!.barSet;
        }
        Object.assign(this.statusBar, barSet);
    }
    private onViewClose(folder: WorkspaceFolder) {
        var view = this.Views.get(folder)!;
        this.Views.delete(folder);
        this.viewInfos.delete(view);
    }
    /**
     *  @description 获取活动的工作区文件夹. 如果没有则为undefined
     */
    getActiveFolder(activeTextEditor: vscode.TextEditor): WorkspaceFolder | undefined {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return undefined;
        const activeFileName = activeTextEditor.document.fileName;
        for (let i = workspaceFolders.length - 1; i >= 0; i--) {
            let folder = workspaceFolders[i];
            if (activeFileName.startsWith(folder.uri.fsPath)) return folder;
        }
        return undefined;
    }
    static getInstance(...args: []) {
        if (!this.instance) this.instance = new this(...args);
        return this.instance;
    }
}

import * as MS from "../package/webview/src/message";
class View implements MS.ext.msStruct {
    private readonly webViewPanel;
    private readonly webView;
    private readonly extensionConfig;

    private activeFilePath?: string;
    private baseData: MS.baseData;
    close() {
        this.webViewPanel.dispose();
    }
    click() {
        //todo
    }
    constructor(
        folder: vscode.WorkspaceFolder,
        onWebViewPanelClose: (...args: any) => any,
        private setBarInfo: Function
    ) {
        {
            this.extensionConfig = vscode.workspace.getConfiguration("ComponentPreviewer", folder);

            var serverRootDir = <string | null>this.extensionConfig.get("serverRootDir");
            var workspaceFolderDir = folder.uri.fsPath;
            this.baseData = {
                serverURL: this.extensionConfig.get("serverURL") ?? "",
                /** 相对于workspaceFolderDir */
                serverRootDir: serverRootDir ?? "",
                watch: false,
                workspaceFolderName: folder.name,
                workspaceFolderDir,
                autoReload: false,
            };
        }

        {
            const resUri = vscode.Uri.joinPath(extContext.extensionUri, "out/res/webview");
            //初始化webView
            const webViewPanel = vscode.window.createWebviewPanel(
                "catCoding",
                "CPrev: " + folder.name,
                vscode.ViewColumn.Beside,
                {
                    enableScripts: true,
                    localResourceRoots: [resUri],
                }
            );
            this.webViewPanel = webViewPanel;
            const webview = webViewPanel.webview;
            this.webView = webview;

            let jsURI = vscode.Uri.joinPath(resUri, "index.js");

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
            webview.onDidReceiveMessage(this.onMessage, this);
            webViewPanel.onDidDispose(onWebViewPanelClose);
        }
    }
    private async updateBridgeFile(activeFile: string) {
        this.activeFilePath = activeFile;
        var { serverRootDir, workspaceFolderDir, workspaceFolderName } = this.baseData;
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
    workspaceFolderName:"${workspaceFolderName}",
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
            let relActFile = path.relative(path.join(previewRoot, "bridge"), this.activeFilePath).replaceAll("\\", "/");
            let activeModuleData_js = 'import * as all from "' + relActFile + '";\nexport default all;';
            let activeModuleData_cjs = 'exports.default= require("' + relActFile + '").default;';
            var activeModuleWitePromise = witeFile(activeModuleData_js, activeModuleData_cjs, actModPathNoEx);
        }
        this.webView.postMessage("onActiveFileChange");
        return Promise.all([bridgeFileWitePromise, activeModuleWitePromise]);
    }
    onMessage(data: MS.ext.onMsData): void {
        if (typeof data?.command !== "string") {
            errorMessage("Error message:" + data);
            return;
        }
        const ct = data.context;
        const command = data.command;
        const excFx: Function = this[command];
        excFx(...ct);
    }
    updateBaseData<T extends keyof MS.baseData>(dataName: T, value: MS.baseData[T]) {
        const data = this.baseData;
        switch (dataName) {
            case "watch":
                if (value === data.watch) return;
                data.watch = value as boolean;
                if (value) this.onActiveFileSave();
                break;
            case "serverURL":
                if (value === data.serverURL) return;
                data.serverURL = value as string;
                if (typeof value === "string") this.extensionConfig.update("serverURL", value);
                break;
            case "serverRootDir":
                if (value === data.serverRootDir) return;
                data.serverRootDir = value as string;
                this.extensionConfig.update("serverRootDir", value);
                break;
            case "autoReload":
                data.autoReload = value as boolean;
        }
    }
    sendMessage<T extends keyof MS.webView.functions>(command: T, ...context: MS.webView.context<T>): void {
        this.webView.postMessage({ command, context });
    }
    onChangeActiveFile(textEditor: vscode.TextEditor) {
        //todo
        var activeFile = textEditor.document.uri.fsPath;
        if (this.baseData.watch && activeFile && activeFile !== this.activeFilePath) infoMessage(activeFile); //this.updateBridgeFile(activeFile);
    }
    onActiveFileSave() {
        this.baseData.autoReload && this.sendMessage("reload");
    }
    sendBaseData() {
        this.sendMessage("initBaseData", this.baseData);
    }
    /** 向工作区安装依赖文件 */
    async installNodeModule() {
        var { workspaceFolderDir, serverRootDir } = this.baseData;
        const remotefs = vscode.workspace.fs; //支持本地和远程的文件系统
        //todo: URI的支持
        var dist = path.join(workspaceFolderDir, serverRootDir, ".preview");
        await fse.ensureDir(dist);
        function copyFailed(path: string, err: Error) {
            errorMessage(`Failed to install ${path} \n May not have access`);
        }
        var resUri = vscode.Uri.joinPath(extContext.extension.extensionUri, "out/res/preview");
        var res = resUri.fsPath;
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
        if (this.activeFilePath) this.updateBridgeFile(this.activeFilePath);
    }
}
