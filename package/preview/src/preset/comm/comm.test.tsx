import * as React from "react";
import { createElement as h } from "react";
import { createPage } from "./comm";

async function getPage(mod: Promise<any>) {
    let fileInfo = {
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
    let [, page] = await createPage(mod, fileInfo, {
        createElement: h,
        Component: React.Component,
        isCpn: (P) => typeof P === "function",
    });
    return page;
}
function AsyncCpn(props: { cpn: () => Promise<any> }) {
    const [jsx, setJsx] = React.useState<JSX.Element>();
    React.useEffect(() => {
        getPage(props.cpn()).then((val) => setJsx(val));
    }, []);
    return jsx!;
}
export function 多种类型() {
    async function mod() {
        return {
            errorFx() {
                throw new Error("错误的消息");
            },
            string() {
                return "ok";
            },
            not: null,
            number: 8,
        };
    }

    return <AsyncCpn cpn={mod} />;
}

export function 文件错误() {
    async function mod() {
        throw new Error("文件错误!!");
    }

    return <AsyncCpn cpn={mod} />;
}
export function 空导出() {
    async function mod() {
        return {};
    }
    return <AsyncCpn cpn={mod} />;
}
