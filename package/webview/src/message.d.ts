export type baseData = {
    serverURL: string;
    watch: boolean;
    serverRootDir: string;
    workspaceFolderName: string;
    workspaceFolderDir: string;
    autoReload: boolean;
};

export namespace webView {
    /** webView功能 */
    type functions = {
        updateBaseData<T extends keyof baseData>(dataName: T, value: baseData[T]): any;
        initBaseData(baseData: baseData): any;
        reload(): any;
    };

    type commands = keyof functions;
    type context<T extends commands> = Parameters<functions[T]>;
    type onMsData = MessageEvent<
        { [key in commands]: { command: key; context: Parameters<functions[key]> } }[commands]
    >;
    /** webView 通信类要实现的接口 */
    interface msStruct extends functions {
        onMessage(e: onMsData): void;
        sendMessage<T extends ext.commands>(command: T, ...contex: ext.context<T>): void;
    }
}
export namespace ext {
    /** 功能部分 */
    type functions = {
        updateBaseData<T extends keyof baseData>(dataName: T, value: baseData[T]): any;
        installNodeModule(): any;
        sendBaseData(): any;
    };
    type commands = keyof functions;
    type context<T extends commands> = Parameters<functions[T]>;

    type onMsData = { [key in commands]: { command: key; context: Parameters<functions[key]> } }[commands];
    /** ext 通信类要实现的接口 */
    interface msStruct extends functions {
        onMessage(e: onMsData): void;
        sendMessage<T extends webView.commands>(command: T, ...context: webView.context<T>): void;
    }
}
