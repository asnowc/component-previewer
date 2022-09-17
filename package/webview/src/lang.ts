const langMap = {
    en: {
        "自动刷新(如果web服务器支持HMR, 则不需要开启)":
            "Auto reload ( If your Web server supports Hot Module Replacement, it is recommended to keep it turned off )",
        刷新: "Reload",
        设置: "Setting",
        切换监听状态: "Toggle watch",

        /** 设置 */
        安装: "Install",
        '依赖将被安装到 "': 'Dependency packages will be installed to "',
        '在浏览器输入 "': 'Enter "',
        '" 将自动预览组件': '" in the browser to automatically preview the components',
        关闭: "Close",
    },
    zh: {} as any,
};
export type langTypeList = keyof typeof langMap;
langMap["zh"] = createZhObj(langMap.en);

function createZhObj(obj: LangMap): LangMap {
    const appendObj: any = {};
    for (const it of Object.keys(obj)) {
        appendObj[it] = it;
    }
    return appendObj;
}

function getter(str: (keyof LangMap)[], ...args: any[]): string {
    return "";
}

export type LangMap = typeof langMap.en;
export function getLang(lang: langTypeList): LangMap {
    return langMap[lang] as LangMap;
}
