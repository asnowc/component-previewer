import { EventEmitter } from "node:events";
import * as VS from "vscode";
import { extContext } from "../extension";

type WorkspaceDispEvents = {
    /** 当工作区 */
    activeFolderChange(folder?: VS.WorkspaceFolder): any;
    activeTextEditorChange(editor?: VS.TextEditor, folder?: VS.WorkspaceFolder): any;
    folderRemoved(folders: readonly VS.WorkspaceFolder[]): any;
    folderAdded(folders: readonly VS.WorkspaceFolder[]): any;
};
type EventOnType<P extends { [name: string | symbol]: (...args: any) => any }, ret> = <T extends keyof P>(
    eventName: T,
    listener: P[T]
) => ret;
type EventEmitType<P extends { [name: string | symbol]: (...args: any) => any }> = <T extends keyof P>(
    eventName: T,
    ...args: Parameters<P[T]>
) => boolean;

export class WorkspaceDispatcher extends EventEmitter {
    on: EventOnType<WorkspaceDispEvents, this> = super.on;
    off: EventOnType<WorkspaceDispEvents, this> = super.off;
    emit: EventEmitType<WorkspaceDispEvents> = super.emit;
    #activeFolder? = this.getActiveFolder();
    get activeFolder() {
        return this.#activeFolder;
    }
    private constructor() {
        super();
        VS.window.onDidChangeActiveTextEditor(
            (activeTextEditor) => {
                //todo: 切换编辑器会触发两次事件,首先是undefined
                const activeFolder = activeTextEditor && this.getActiveFolder(activeTextEditor);
                if (activeFolder !== this.#activeFolder) {
                    this.#activeFolder = activeFolder;
                    this.emit("activeFolderChange", activeFolder);
                    this.emit("activeTextEditorChange", activeTextEditor, activeFolder);
                } else this.emit("activeTextEditorChange", activeTextEditor, activeFolder);
            },
            undefined,
            extContext.subscriptions
        );
        VS.workspace.onDidChangeWorkspaceFolders(
            (e) => {
                e.added.length && this.emit("folderAdded", e.added);
                if (e.removed.length) {
                    if (this.#activeFolder && e.removed.includes(this.#activeFolder)) {
                        this.#activeFolder = undefined;
                        this.emit("activeFolderChange", undefined);
                    }
                    this.emit("folderRemoved", e.removed);
                }
            },
            undefined,
            extContext.subscriptions
        );
    }
    /**
     *  @description 获取编辑器对应的的工作区文件夹. 如果没有则为undefined
     *  @param activeTextEditor 如果存在该参数, 则获取该编辑器对应的工作区文件夹, 否则获取活动文件对应的工作区文件夹
     */
    private getActiveFolder(
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
    private static instance: WorkspaceDispatcher;
    static getInstance() {
        if (!this.instance) this.instance = new this();
        return this.instance;
    }
}
