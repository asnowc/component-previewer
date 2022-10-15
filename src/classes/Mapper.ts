import * as VS from "vscode";
import * as path from "node:path";
const fsv = VS.workspace.fs;
class Template {
    #replaceTemplate: (number | string)[];
    readonly maxIndex;
    constructor(template: string) {
        let replaceTemplate: (number | string)[] = [];
        this.#replaceTemplate = replaceTemplate;
        let max = -1;
        while (template !== "") {
            let temp = template.match(/^(.*?)<(\d+)>(.*)$/);
            if (temp) {
                template = temp[3];
                temp[1].length && replaceTemplate.push(temp[1]);
                let index = parseInt(temp[2]);
                replaceTemplate.push(index);
                if (index > max) max = index;
            } else replaceTemplate.push(template);
        }
        this.maxIndex = max;
    }
    replace(str: string, regExp: RegExp): string | never {
        const matchList = str.match(regExp);
        if (!matchList) {
            if (this.maxIndex >= 0) throw new Error("replaceString有依赖但没有传入参数");
            else return this.#replaceTemplate[0] as string;
        }
        if (this.maxIndex > matchList.length) throw new Error("replaceString依赖的引用下标超过出入的数组长度");
        var returnStr = "";
        for (const split of this.#replaceTemplate) {
            returnStr += typeof split === "number" ? matchList[split] : split;
        }
        return returnStr;
    }
}

export class Mapper {
    private replaceMap = new Map<RegExp, Template[]>();
    constructor(map: { [key: string]: string[] }) {
        for (const regExpText of Object.keys(map)) {
            let tempLateList = map[regExpText].map((val) => new Template(val));
            let regExp = new RegExp(regExpText);
            this.replaceMap.set(regExp, tempLateList);
        }
    }
    *replace(replaceString: string) {
        for (const [regExp, templates] of this.replaceMap.entries()) {
            for (const template of templates) {
                try {
                    yield template.replace(replaceString, regExp);
                } catch (error) {}
            }
        }
    }
    /**获取可访问的映射文件
     * @param rootDir 相对目录的Uri
     * @param distRelPath 相对于rootDir, 测试访问时, 访问的是 rootDir 下的 distRelPath
     * @return 返回映射文件的相对路径, 相对于 rootDir
     */
    async getMapUri(srcUrl: string) {
        for (const mapUrl of this.replace(srcUrl)) {
            try {
                await fsv.stat(VS.Uri.parse(mapUrl));
                return mapUrl;
            } catch (error) {}
        }
        throw undefined;
    }
}
