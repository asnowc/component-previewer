export * from "./vueWebpack";
/** 自动导入 (最终预览的是文件映射) */
export declare function autoRender(): Promise<void>;
/**
 * @param activeFile 你要显示的组件相对路径
 */
export declare function renderFromFileURL(activeFile: string): Promise<void>;
