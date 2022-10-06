export const bridgeData = {
    /** 工作区根目录(绝对) */
    workspaceFolder: "D:/xxx",
    /** 工作区文件夹名字 */
    workspaceFolderName: "测试工作区",
    /** 预览文件夹根目录, 相对于 workspaceFolder */
    previewFolderRelPath: ".preview",
    /** 活动文件相对路径(相对于 workspaceFolder) */
    activeFileRelPath: "test/react/A.tsx",
    /** 映射文件相对路径(相对于 workspaceFolder) */
    mapFileRelPath: "test/react/A.test.tsx",
    /** 预设名称 */
    presetName: "other",
};
export type BridgeData = typeof bridgeData;
export async function preview() {
    try {
        var [mod, preset] = await Promise.all([import("./defaultPage"), import("../preset/other")]);
    } catch (error) {
        console.error("活动模块导入失败:");
        console.error(error);
    }
    preset.render(mod, bridgeData);
}
