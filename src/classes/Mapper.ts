import * as VS from "vscode";
import * as path from "node:path";
const fsv = VS.workspace.fs;
class Template {
    #templateSplit: string[];
    #replaceIndex: number[] = [];
    maxIndex = -1;
    constructor(template: string) {
        this.#templateSplit = template.split(/<\d+>/);

        const rpStr: number[] = [];
        while (template !== "") {
            let temp = template.match(/.*<(\d+)>/);
            if (temp) {
                template = template.slice(temp[0].length);
                rpStr.push(parseInt(temp[1]));
            } else template = "";
        }

        for (const num of rpStr) {
            if (num > this.maxIndex) this.maxIndex = num;
            this.#replaceIndex.push(num);
        }
    }
    replace(str: string, regExp: RegExp): string | never {
        const matchList = str.match(regExp);
        if (!matchList) {
            if (this.maxIndex >= 0) throw new Error("replaceString有依赖但没有传入参数");
            else return this.#templateSplit.join();
        }
        if (this.maxIndex > matchList.length) throw new Error("replaceString依赖的引用下标超过出入的数组长度");
        var returnStr = "";
        for (let i = 0; i < this.#templateSplit.length; i++) {
            const it = this.#templateSplit[i];
            returnStr += it;
            const rp = this.#replaceIndex[i];
            if (rp !== undefined) returnStr += matchList[rp];
        }
        return str.replace(regExp, returnStr);
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
    async getMapUri(rootDir: VS.Uri, distRelPath: string) {
        for (const fsRelPath of this.replace(distRelPath)) {
            try {
                const mapUri = VS.Uri.joinPath(rootDir, fsRelPath);
                await fsv.stat(mapUri);
                return path.relative(rootDir.path, mapUri.path);
            } catch (error) {}
        }
        throw undefined;
    }
}
