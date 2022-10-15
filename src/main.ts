import { EventEmitter } from "node:events";
import * as path from "node:path";
import * as VS from "vscode";
import { extContext } from "./extension";
import { CpvConfiguration } from "./Config";
import type * as MS from "../package/webview/message";
import env from "./env";
import { Bridge, BridgeData } from "./classes/Bridge";
import { Mapper } from "./classes/Mapper";

const message = {
    getHead: "Component Previewer: ",
    error(msg: string) {
        VS.window.showErrorMessage(this.getHead + msg);
    },
    warn(msg: string) {
        VS.window.showWarningMessage(this.getHead + msg);
    },
    info(msg: string) {
        VS.window.showInformationMessage(this.getHead + msg);
    },
};
class StatusBar {
    private static init() {
        const cmd = "ComponentPreviewer.openView";
        extContext.subscriptions.push(VS.commands.registerCommand(cmd, this.handelClick, this));
        const statusBar = VS.window.createStatusBarItem(VS.StatusBarAlignment.Right);
        statusBar.command = cmd;
        statusBar.text = "C Prev";
        statusBar.tooltip = "";
        statusBar.show();

        return statusBar;
    }
    private static statusBar = this.init();
    private static showList = new Map<string, [string, string]>();
    static setList(folder: VS.WorkspaceFolder, value?: string) {
        if (value) this.showList.set(folder.uri.toString(), [folder.name, value]);
        else this.showList.delete(folder.uri.toString());
        this.updateBar();
    }
    private static updateBar() {
        let str = "";
        for (const [, [name, value]] of this.showList) str += name + ": " + value + "\n";
        this.statusBar.tooltip = str.length ? str : "no watching";
    }
    private static async handelClick() {
        //不存在活动工作区文件夹
        const folders = VS.workspace.workspaceFolders ?? [];
        let pickList: (VS.QuickPickItem & { exc: () => void; folder?: VS.WorkspaceFolder })[] = [];
        function openPreviewer(this: { folder: VS.WorkspaceFolder }) {
            let folder = this.folder!;
            const previewer = Dispatcher.getPreviewer(folder);
            previewer?.open();
        }
        function closeAll(this: typeof pickList[0]) {
            for (const folder of folders) {
                Dispatcher.getPreviewer(folder)?.switchWatch(false);
            }
        }
        if (folders.length === 0) message.warn("Open at least one workspace folder");
        else if (folders.length === 1) {
            openPreviewer.bind({ folder: folders[0] })();
            return;
        } else {
            for (const folder of folders) {
                let state = this.showList.get(folder.uri.toString());
                let pickItem: typeof pickList[0] = { label: "Open: " + folder.name, exc: openPreviewer, folder };
                if (state) pickItem.description = state[1];
                pickList.push(pickItem);
            }
            pickList.push({ label: "Stop all watching", exc: closeAll });
            let selected = await VS.window.showQuickPick(pickList, { title: "Select an action" });
            selected?.exc();
        }
    }
}

export class Dispatcher {
    private static readonly previewers = new Map<VS.WorkspaceFolder, Previewer>();
    private static activeFolder? = this.getActiveFolder();
    private static onChangeActiveTextEditor(activeTextEditor?: VS.TextEditor) {
        if (!activeTextEditor) {
            this.activeFolder = undefined;
            return;
        }
        for (const [, cpv] of Dispatcher.previewers) {
            cpv.onChangeActiveFile(activeTextEditor.document.uri);
        }
    }
    static getPreviewer(folder: VS.WorkspaceFolder) {
        return this.previewers.get(folder);
    }
    static get activePreviewer() {
        return this.activeFolder && this.previewers.get(this.activeFolder);
    }
    static main(): void {
        for (const folder of VS.workspace.workspaceFolders ?? []) {
            this.previewers.set(folder, new Previewer(folder));
        }
        VS.window.onDidChangeActiveTextEditor(this.onChangeActiveTextEditor, this, extContext.subscriptions);
        VS.workspace.onDidChangeWorkspaceFolders(
            function (e) {
                for (const folder of e.added) {
                    Dispatcher.previewers.set(folder, new Previewer(folder));
                }
                for (const folder of e.removed) {
                    const cpv = Dispatcher.previewers.get(folder);
                    Dispatcher.previewers.delete(folder);
                    cpv?.destructor();
                }
            },
            undefined,
            extContext.subscriptions
        );
        VS.workspace.onDidSaveTextDocument(
            (e) => this.activePreviewer?.onActiveFileSave(),
            undefined,
            extContext.subscriptions
        );
        this.onChangeActiveTextEditor(VS.window.activeTextEditor);
    }
    /**
     *  @description 获取编辑器对应的的工作区文件夹. 如果没有则为undefined
     *  @param activeTextEditor 如果存在该参数, 则获取该编辑器对应的工作区文件夹, 否则获取活动文件对应的工作区文件夹
     */
    private static getActiveFolder(
        activeTextEditor: VS.TextEditor | undefined = VS.window.activeTextEditor
    ): VS.WorkspaceFolder | undefined {
        const workspaceFolders = VS.workspace.workspaceFolders;
        if (!workspaceFolders) return undefined;
        const activeFileName = activeTextEditor?.document.fileName;
        if (!activeFileName) return undefined;
        for (let i = workspaceFolders.length - 1; i >= 0; i--) {
            let folder = workspaceFolders[i];
            if (activeFileName.startsWith(folder.uri.fsPath)) return folder;
        }

        return undefined;
    }
}

class Previewer {
    private view?: View;
    private mapper!: Mapper;
    private bridge!: Bridge;
    readonly extensionConfig;

    private baseData: MS.baseData;
    private subscriptions: VS.Disposable[] = [];
    private activeFileUrl?: VS.Uri;
    watchFilePathRegExp!: { [key: string]: RegExp }; //用来判断预设

    constructor(private readonly folder: VS.WorkspaceFolder) {
        this.extensionConfig = new CpvConfiguration(folder);

        const baseData = {
            watch: false,
            workspaceFolderName: this.folder.name,
            workspaceFolderDir: decodeURI(this.folder.uri.toString()),
            autoReload: false,
            ...this.extensionConfig.get(),
        };
        this.baseData = baseData;
        this.onDidChangeConfiguration();

        VS.workspace.onDidChangeConfiguration(
            (e) => {
                const sectionHead = this.extensionConfig.sectionHead;
                if (e.affectsConfiguration(sectionHead, this.folder)) {
                    this.onDidChangeConfiguration();
                }
            },
            undefined,
            this.subscriptions
        );
    }
    destructor() {
        this.close();
        this.subscriptions.forEach((item) => item.dispose());
        // this.bridge.destructor();
    }
    open() {
        if (this.view) return;
        this.view = new View(this.folder.name);
        const view = this.view;
        view.on("close", () => {
            this.view = undefined;
            this.close();
        });
        view.on("sendBaseData", () => this.view?.setBaseData(this.baseData));
        view.on("updateBaseData", (dataName, value) => {
            const data = this.baseData;
            switch (dataName) {
                case "watch":
                    this.onSwitchWatch(value as boolean);
                    break;
                case "serverURL":
                    if (value === data.serverURL) return;
                    typeof value === "string" && this.extensionConfig.update("serverURL", value);
                    break;
                case "previewFolderRelPath":
                    if (value === data.previewFolderRelPath) return;
                    typeof value === "string" && this.extensionConfig.update("previewFolderRelPath", value);
                    break;
                case "autoReload":
                    data.autoReload = value as boolean;
            }
        });
    }
    close() {
        if (this.view) {
            this.view.destructor();
            this.view = undefined;
        }
    }
    private onSwitchWatch(value: boolean) {
        StatusBar.setList(this.folder, value ? "watching" : undefined);
        const data = this.baseData;
        if (value === data.watch) return;
        data.watch = value;
        if (value) {
            this.bridge.install();
            // this.onActiveFileSave();
            let activeFileUri = this.activeFileUrl;
            if (activeFileUri) {
                this.activeFileUrl = undefined;
                this.onChangeActiveFile(activeFileUri);
            }
        }
    }
    switchWatch(value: boolean) {
        this.onSwitchWatch(value);
        this.view?.setBaseData(this.baseData);
    }

    /** 判断文件应该使用的预设 */
    private estimatePreset(relativePath: string) {
        for (const key of Object.keys(this.watchFilePathRegExp)) {
            const regExp = this.watchFilePathRegExp[key];
            if (regExp.test(relativePath)) {
                return key;
            }
        }
    }

    private updateBridge(presetName: string, activeFileRelPath: string, mapFileRelPath = activeFileRelPath) {
        const baseData = this.baseData;
        const data = {
            workspaceFolder: baseData.workspaceFolderDir,
            serverRootDir: baseData.previewFolderRelPath,
            previewFolderRelPath: path.join(baseData.previewFolderRelPath, "./preview"),
            activeFileRelPath,
            mapFileRelPath,
            presetName,
        };
        if (path.sep === "\\") {
            for (const key of Object.keys(data)) {
                let cover: any = data;
                cover[key] = cover[key].replaceAll("\\", "/");
            }
        }
        const bridgeData: BridgeData = { ...data, workspaceFolderName: baseData.workspaceFolderName, presetName };
        this.view?.dev(bridgeData);

        this.bridge.updateBridgeFile(bridgeData);
    }

    private onDidChangeConfiguration() {
        const baseData = this.baseData;
        Object.assign(baseData, { ...this.extensionConfig.get() });

        this.watchFilePathRegExp = {};
        for (const key of Object.keys(baseData.watchFilePathRegExp))
            this.watchFilePathRegExp[key] = new RegExp(baseData.watchFilePathRegExp[key]);

        this.mapper = new Mapper(baseData.filePathMapReplace);

        let bridgeRootUri = VS.Uri.joinPath(this.folder.uri, this.baseData.previewFolderRelPath);
        if (this.bridge) {
            if (baseData.watch) this.bridge.move(bridgeRootUri);
            else {
                this.bridge.revoke();
                this.bridge.rootDirUri = bridgeRootUri;
            }
        } else this.bridge = new Bridge(bridgeRootUri);

        this.view?.setBaseData(this.baseData);
    }
    onChangeActiveFile(fileUri: VS.Uri) {
        if (this.activeFileUrl?.toString() === fileUri.toString()) return;
        this.activeFileUrl = fileUri;

        const fileUrl = fileUri.toString();
        const baseData = this.baseData;
        if (!baseData.watch) return this.view?.dev({ path: decodeURI(fileUrl), fin: "no watch" });

        const rootUrl = this.folder.uri.toString();
        let watchScope = path.join(rootUrl, baseData.watchScope);
        if (path.relative(watchScope, fileUrl).startsWith(".."))
            return this.view?.dev({ path: decodeURI(fileUrl), fin: "out of range" });

        const presetName = this.estimatePreset(fileUrl);
        const relativePath = path.relative(rootUrl, fileUrl);
        if (presetName) {
            this.mapper.getMapUri(fileUrl).then(
                (mapUrl) => this.updateBridge(presetName, relativePath, path.relative(rootUrl, mapUrl)),
                (e) => this.updateBridge(presetName, relativePath)
            );
        } else return this.view?.dev({ path: decodeURI(fileUrl), fin: "no match" });
    }
    onActiveFileSave() {
        this.baseData.autoReload && this.view?.reload();
    }
    onStatusBarClick() {
        this.open();
    }
}

type ViewEvents = MS.ext.functions & {
    close: () => any;
};
class View extends EventEmitter {
    private readonly webViewPanel;
    private readonly webView;
    constructor(name: string) {
        super();

        const resUri = VS.Uri.joinPath(extContext.extensionUri, "out/res/webview");
        //初始化webView
        const webViewPanel = VS.window.createWebviewPanel("catCoding", "CPrev: " + name, VS.ViewColumn.Beside, {
            enableScripts: true,
            localResourceRoots: [resUri],
            enableForms: true,
        });
        this.webViewPanel = webViewPanel;
        const webview = webViewPanel.webview;
        this.webView = webview;

        let jsURI = VS.Uri.joinPath(resUri, "index.js");

        let jsWebViewURI = webview.asWebviewUri(jsURI);
        let sendEnv: MS.Env = { ...env, language: VS.env.language };
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
                    <script>
                        globalThis.env= ${JSON.stringify(sendEnv)}
                    </script>
                </head>
                <body></body>
                <script src=${jsWebViewURI}  type="module"></script>
            </html>`;
        webview.onDidReceiveMessage(this.onMessage, this);
        webViewPanel.onDidDispose(() => this.emit("close"));
    }
    destructor() {
        this.webViewPanel.dispose();
    }

    setBaseData(val: MS.baseData) {
        this.sendMessage("setWebViewBaseData", val);
    }
    reload() {
        this.sendMessage("reload");
    }
    dev(sw: boolean | Object) {
        this.sendMessage("dev", sw);
    }

    emit: <T extends keyof ViewEvents>(eventName: T, ...args: Parameters<ViewEvents[T]>) => boolean = super.emit;
    on: <T extends keyof ViewEvents>(eventName: T, listener: ViewEvents[T]) => this = super.on;
    private onMessage(data: MS.ext.onMsData): void {
        if (typeof data?.command !== "string") {
            message.error("Error message:" + data);
            return;
        }
        const { context, command } = data;
        this.emit(command, ...context);
    }
    private sendMessage<T extends MS.webView.commands>(command: T, ...context: MS.webView.context<T>): void {
        this.webView.postMessage({ command, context });
    }
}
