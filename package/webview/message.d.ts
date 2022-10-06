export type baseData = {
    watch: boolean;
    workspaceFolderName: string;
    workspaceFolderDir: string;
    autoReload: boolean;

    serverURL: string;
    previewFolderRelPath: string;
    watchFilePathRegExp: { [key: string]: string };
    filePathMapReplace: { [key: string]: string[] };
};
export type Env = {
    mode: string;
    language: string;
};

export namespace webView {
    /** webView功能 */
    type functions = {
        dev(sw: boolean | Object): void;
        updateBaseData<T extends keyof baseData>(dataName: T, value: baseData[T]): any;
        setWebViewBaseData(baseData: baseData): any;
        reload(): any;
    };

    type commands = keyof functions;
    type context<T extends commands> = Parameters<functions[T]>;
    type onMsData = {
        data: { [key in commands]: { command: key; context: Parameters<functions[key]> } }[commands];
    };
    /** webView 通信类要实现的接口 */
    interface msStruct extends functions {
        onMessage(e: onMsData): void;
        sendMessage<T extends ext.commands>(command: T, ...context: ext.context<T>): void;
    }
}
export namespace ext {
    /** 功能部分 */
    type functions = {
        updateBaseData<T extends keyof baseData>(dataName: T, value: baseData[T]): any;
        sendBaseData(): any;
    };
    type commands = keyof functions;
    type context<T extends commands> = Parameters<functions[T]>;

    type onMsData = { [key in commands]: { command: key; context: Parameters<functions[key]> } }[commands];
}
