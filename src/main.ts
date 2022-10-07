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
    #text: string;
    get text() {
        return this.#text;
    }
    set text(val) {
        this.#text = val;
        if (StatusBar.activeBar === this) StatusBar.statusBar.text = val;
    }
    #tooltip?: string;
    get tooltip() {
        return this.#tooltip;
    }
    set tooltip(val) {
        this.#tooltip = val;
        if (StatusBar.activeBar === this) StatusBar.statusBar.tooltip = val;
    }
    constructor(text: string, tooltip?: string, public onClick?: () => any) {
        this.#text = text;
        this.#tooltip = tooltip;
    }
    private static statusBar = VS.window.createStatusBarItem(VS.StatusBarAlignment.Right);
    private static activeBar: StatusBar;
    static switch(bar: StatusBar) {
        this.statusBar.tooltip = bar.tooltip;
        this.statusBar.text = bar.text;
    }
    static init(cmd: string) {
        this.statusBar.command = cmd;
        this.statusBar.show();
    }
}

export class Dispatcher {
    private static defaultBar = new StatusBar("C Prev", "Opening the Previewer", this.handelClick.bind(this));

    private static readonly previewers = new Map<VS.WorkspaceFolder, Previewer>();
    private static activeFolder? = this.getActiveFolder();
    private static onChangeActiveTextEditor(activeTextEditor?: VS.TextEditor) {
        if (!activeTextEditor) {
            this.activeFolder = undefined;
            StatusBar.switch(this.defaultBar);
            return;
        }
        const activeFolder = this.getActiveFolder(activeTextEditor);
        if (activeFolder !== this.activeFolder) {
            this.activeFolder = activeFolder;

            if (activeFolder) {
                const bar = this.activePreviewer?.statusBar;
                bar && StatusBar.switch(bar);
            } else StatusBar.switch(this.defaultBar);
        }
        this.activePreviewer?.onChangeActiveFile(activeTextEditor.document.uri);
    }
    static get activePreviewer() {
        return this.activeFolder && this.previewers.get(this.activeFolder);
    }
    static main(): void {
        for (const folder of VS.workspace.workspaceFolders ?? []) {
            this.previewers.set(folder, new Previewer(folder));
        }

        const cmd = "ComponentPreviewer.openView";
        StatusBar.init(cmd);
        StatusBar.switch(this.defaultBar);

        VS.commands.registerCommand(
            cmd,
            () => {
                let bar: StatusBar | undefined;
                if (this.activeFolder) {
                    const folder = this.activeFolder;
                    bar = this.previewers.get(folder)?.statusBar;
                } else bar = this.defaultBar;
                bar?.onClick?.();
            },
            this
        );
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
    private static async handelClick() {
        //不存在活动工作区文件夹
        const folders = VS.workspace.workspaceFolders ?? [];
        let folder = folders.length > 1 ? await VS.window.showWorkspaceFolderPick() : folders[0];
        const previewer = folder && this.previewers.get(folder);
        previewer?.open();
    }
}

class Previewer {
    readonly statusBar: StatusBar;
    private view?: View;
    private mapper!: Mapper;
    private bridge!: Bridge;
    readonly extensionConfig;

    private baseData: MS.baseData;
    private subscriptions: VS.Disposable[] = [];
    private activeFileUrl?: VS.Uri;
    watchFilePathRegExp!: { [key: string]: RegExp }; //用来判断预设

    constructor(private readonly folder: VS.WorkspaceFolder) {
        this.statusBar = new StatusBar("C Prev", "watch: false", this.onStatusBarClick.bind(this));
        this.extensionConfig = new CpvConfiguration(folder);

        const baseData = {
            watch: false,
            workspaceFolderName: this.folder.name,
            workspaceFolderDir: this.folder.uri.toString(),
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
                    this.switchWatch(value as boolean);
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
    private switchWatch(value: boolean) {
        this.statusBar.tooltip = "watch: " + value.toString();
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

    /** 判断文件应该使用的预设 */
    private estimatePreset(relativePath: string) {
        for (const key of Object.keys(this.watchFilePathRegExp)) {
            const regExp = this.watchFilePathRegExp[key];
            if (regExp.test(relativePath)) {
                return key;
            }
        }
    }

    private updateBridge(activeFileRelPath: string, mapFileRelPath: string, presetName: string) {
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
        const rootDir = this.baseData.workspaceFolderDir;
        const relativePath = path.relative(rootDir, fileUri.toString());
        if (!this.baseData.watch) return this.view?.dev({ relativePath, fin: "no watch" });
        const presetName = this.estimatePreset(relativePath);

        return presetName
            ? this.mapper
                  .getMapUri(this.folder.uri, relativePath)
                  .then(
                      (mapRelPath) => this.updateBridge(relativePath, mapRelPath, presetName),
                      (e) => this.updateBridge(relativePath, relativePath, presetName)
                  )
                  .catch((e) => {
                      message.error(e.message);
                  })
            : undefined;
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
