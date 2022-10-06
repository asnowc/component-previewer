import { EventEmitter } from "node:events";
import * as path from "node:path";
import * as VS from "vscode";
import { WorkspaceDispatcher } from "./classes/Dispatcher";
import { extContext } from "./extension";
import { CpvConfiguration } from "./Config";
import type * as MS from "../package/webview/message";
import env from "./env";
import { Bridge, BridgeData } from "./classes/Bridge";
import { Mapper } from "./classes/Mapper";
const workspaceDispatcher = WorkspaceDispatcher.getInstance();

const dev = {
    errorMessage(msg: string) {
        if (env.mode === "dev") VS.window.showErrorMessage("Component Previewer: " + msg);
    },
    waringMessage(msg: string) {
        if (env.mode === "dev") VS.window.showWarningMessage("Component Previewer: " + msg);
    },
    infoMessage(msg: string) {
        if (env.mode === "dev") VS.window.showInformationMessage("Component Previewer: " + msg);
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

export class Dispatcher extends EventEmitter {
    static main(): void {
        new this();
    }
    private defaultBar = new StatusBar("C Prev", "Opening the Previewer", this.handelClick.bind(this));

    private readonly previewers = new Map<VS.WorkspaceFolder, Previewer>();
    activePreviewer: Previewer | undefined;
    private constructor() {
        super();
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
                if (workspaceDispatcher.activeFolder) {
                    const folder = workspaceDispatcher.activeFolder;
                    bar = this.previewers.get(folder)?.statusBar;
                } else bar = this.defaultBar;
                bar?.onClick?.();
            },
            this
        );
        VS.workspace.onDidSaveTextDocument(
            (e) => this.activePreviewer?.onActiveFileSave(),
            undefined,
            extContext.subscriptions
        );
        VS.workspace.onDidChangeConfiguration(
            (e) => {
                for (const [folder, previewer] of this.previewers) {
                    const sectionHead = previewer.extensionConfig.sectionHead;
                    if (e.affectsConfiguration(sectionHead, folder)) {
                        previewer.onDidChangeConfiguration();
                        break;
                    }
                }
            },
            this,
            extContext.subscriptions
        );
        workspaceDispatcher.on("activeTextEditorChange", (editor, folder) => {
            editor && this.activePreviewer?.onChangeActiveFile(editor);
        });
        workspaceDispatcher.on("folderAdded", (folders) => {
            for (const folder of folders) {
                this.previewers.set(folder, new Previewer(folder));
            }
        });
        workspaceDispatcher.on("folderRemoved", (folders) => {
            for (const folder of folders) {
                const cpv = this.previewers.get(folder);
                this.previewers.delete(folder);
                cpv?.close();
            }
        });
        workspaceDispatcher.on("activeFolderChange", (folder) => {
            this.activePreviewer = folder ? this.previewers.get(folder) : undefined;
            if (folder) {
                const bar = this.activePreviewer?.statusBar;
                bar && StatusBar.switch(bar);
            } else StatusBar.switch(this.defaultBar);
        });
    }
    private async handelClick() {
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
    private bridge = new Bridge();
    readonly extensionConfig;

    private baseData: MS.baseData;
    constructor(private readonly folder: VS.WorkspaceFolder) {
        this.statusBar = new StatusBar("C Prev", "watch: false", this.onStatusBarClick.bind(this));
        this.extensionConfig = new CpvConfiguration(folder);

        const baseData = {
            watch: false,
            workspaceFolderName: this.folder.name,
            workspaceFolderDir: this.folder.uri.fsPath,
            autoReload: false,
            ...this.extensionConfig.get(),
        };
        this.baseData = baseData;
        this.onDidChangeConfiguration();
    }
    open() {
        if (this.view) return;
        this.view = new View(this.folder.name);
        const view = this.view;
        view.on("close", () => (this.view = undefined));
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
                case "serverRootDir":
                    if (value === data.previewFolderRelPath) return;
                    typeof value === "string" && this.extensionConfig.update("previewFolderRelPath", value);
                    break;
                case "autoReload":
                    data.autoReload = value as boolean;
            }
        });
    }
    close() {
        this.view?.kill();
        this.view = undefined;
    }
    private switchWatch(value: boolean) {
        this.statusBar.tooltip = "watch: " + value.toString();
        const data = this.baseData;
        if (value === data.watch) return;
        data.watch = value as boolean;
        if (value) {
            const rootUri = VS.Uri.joinPath(this.folder.uri, this.baseData.previewFolderRelPath);
            const bridge = this.bridge;
            bridge.root || bridge.setRoot(rootUri);
            this.onActiveFileSave();
        }
    }

    watchFilePathRegExp?: { [key: string]: RegExp }; //用来判断预设

    /** 判断文件应该使用的预设 */
    private estimatePreset(relativePath: string) {
        if (!this.watchFilePathRegExp) return undefined;
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

    onDidChangeConfiguration() {
        const baseData = this.baseData;
        Object.assign(baseData, { ...this.extensionConfig.get() });

        this.watchFilePathRegExp = {};
        for (const key of Object.keys(baseData.watchFilePathRegExp))
            this.watchFilePathRegExp[key] = new RegExp(baseData.watchFilePathRegExp[key]);

        const bridge = this.bridge;

        const rootUri = VS.Uri.joinPath(this.folder.uri, this.baseData.previewFolderRelPath);
        baseData.watch && bridge.setRoot(rootUri);

        this.mapper = new Mapper(baseData.filePathMapReplace);

        this.view?.setBaseData(this.baseData);
    }
    onChangeActiveFile(textEditor: VS.TextEditor) {
        const rootDir = this.baseData.workspaceFolderDir;
        const relativePath = path.relative(rootDir, textEditor.document.uri.fsPath);
        if (!this.baseData.watch) return this.view?.dev({ relativePath, fin: "no watch" });
        const presetName = this.estimatePreset(relativePath);

        return presetName
            ? this.mapper.getMapUri(this.folder.uri, relativePath).then(
                  (mapRelPath) => this.updateBridge(relativePath, mapRelPath, presetName),
                  (e) => this.updateBridge(relativePath, relativePath, presetName)
              )
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
    setBaseData(val: MS.baseData) {
        this.sendMessage("setWebViewBaseData", val);
    }
    reload() {
        this.sendMessage("reload");
    }
    dev(sw: boolean | Object) {
        this.sendMessage("dev", sw);
    }

    kill() {
        this.webViewPanel.dispose();
    }

    emit: <T extends keyof ViewEvents>(eventName: T, ...args: Parameters<ViewEvents[T]>) => boolean = super.emit;
    on: <T extends keyof ViewEvents>(eventName: T, listener: ViewEvents[T]) => this = super.on;
    private onMessage(data: MS.ext.onMsData): void {
        if (typeof data?.command !== "string") {
            dev.errorMessage("Error message:" + data);
            return;
        }
        const { context, command } = data;
        this.emit(command, ...context);
    }
    private sendMessage<T extends MS.webView.commands>(command: T, ...context: MS.webView.context<T>): void {
        this.webView.postMessage({ command, context });
    }
}
