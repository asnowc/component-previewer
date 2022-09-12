export type webViewContexts = {
    watch: boolean;
    updateURL: string;
    updateRootDir: string;
    updateServerRootDir: string;
    install: undefined;
    autoReload: boolean;
    fin: undefined;
};
export type extContexts = {
    vsUpdate: Object;
    reload: undefined;
};
export type webviewMessage = { command: keyof webViewContexts; context: any };
export type extMessage = { command: keyof extContexts; contex: any };
