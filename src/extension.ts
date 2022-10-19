import * as VS from "vscode";

export let extContext: VS.ExtensionContext;
export async function activate(context: VS.ExtensionContext) {
    extContext = context;
    const { Dispatcher } = await import("./main");
    Dispatcher.main();
}
export function deactivate() {}
