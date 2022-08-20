export * from "./reactWebpack";
import { render, comm } from "./reactWebpack";
import { getActiveFileMap } from "./re/Comm";

/** 自动导入 (最终预览的是文件映射) */
export async function autoRender() {
    try {
        return renderFromFileURL(await getActiveFileMap());
    } catch (error) {
        console.error(error);
    }
}
/**
 * @param activeFile 你要显示的组件相对路径
 */
export async function renderFromFileURL(activeFile: string) {
    try {
        var mod = await import(activeFile);
    } catch (error) {
        let e = (error as any).toString();
        mod = { default: comm.ErrorTemplate(e) };
        console.error(error);
    }
    render(mod, activeFile);
}
