import { contributes, version } from "../package.json";
import * as VS from "vscode";
export { contributes, version };

type ConfigurationItems = typeof contributes.configuration.properties;
type SubKeyHead<T extends string> = keyof ConfigurationItems extends `${T}.${infer P}` ? P : never;

export abstract class Configuration<CT extends Object> {
    abstract readonly sectionHead: string;
    protected abstract config: VS.WorkspaceConfiguration;
    protected abstract packageConfigs: {
        [key: string]: {
            type?: string;
            default?: any;
        };
    };
    constructor(readonly scope?: VS.ConfigurationScope) {}
    get(): CT {
        const config = VS.workspace.getConfiguration(this.sectionHead, this.scope);
        this.config = config;
        const result: CT = {} as any;

        const packageConfigs = this.packageConfigs;
        for (const key of Object.keys(packageConfigs)) {
            let value = config.get(key);
            const configContext = packageConfigs[key];
            if (configContext.type && typeof value !== configContext.type) {
                if (Object.hasOwn(configContext, "default"))
                    switch (configContext.type) {
                        case "integer":
                            if (typeof value !== "number") value = configContext.default;
                            break;
                        case "array":
                            if (!Array.isArray(value)) value = configContext.default;
                            break;
                        default:
                            value = configContext.default;
                            break;
                    }
                else value = undefined;
            }
            (result as any)[key] = value;
        }
        return result;
    }
    update(option: CT): void;
    update<T extends keyof CT>(key: T, val: CT[T]): void;
    update<T extends keyof CT>(keyOrOption: T | CT, val?: CT[T]) {
        const config = this.config;
        if (typeof keyOrOption === "string") return config.update(keyOrOption, val);
        else {
            for (const key of Object.keys(keyOrOption)) config.update(key, (keyOrOption as any)[key]);
        }
    }
}
export interface ConfigurationType {
    serverURL: string;
    previewFolderRelPath: string;
    watchFilePathRegExp: { [key: string]: string };
    filePathMapReplace: { [key: string]: string[] };
    watchScope?: string;
}
type OriginalConfigType = Omit<ConfigurationType, "watchFilePathRegExp" | "filePathMapReplace"> & {
    watchFilePathRegExp: [string, string][];
    filePathMapReplace: [string, string[]][];
};

export class CpvConfiguration extends Configuration<any> {
    readonly sectionHead = "ComponentPreviewer";
    protected packageConfigs: any;
    protected config: VS.WorkspaceConfiguration;
    constructor(scope?: VS.ConfigurationScope) {
        super(scope);
        this.config = VS.workspace.getConfiguration(this.sectionHead, scope);

        const packageConfigMap: any = contributes.configuration.properties;
        const head = this.sectionHead + ".";
        const defConfig: any = {};
        this.packageConfigs = defConfig;
        for (const configKey of Object.keys(packageConfigMap)) {
            if (configKey.startsWith(head)) {
                const key = configKey.slice(head.length);
                defConfig[key] = packageConfigMap[head + key];
            }
        }
    }
    private arrayToObject<T = unknown>(array: any, valType: string | ((val: any) => boolean)): { [key: string]: T } {
        let obj: { [key: string]: T } = {};
        if (!Array.isArray(array)) return obj;
        for (const item of array) {
            if (!Array.isArray(item)) continue;
            let [key, val] = item;
            if (typeof key === "string") {
                if (typeof valType === "string") {
                    if (typeof val === valType) obj[key] = val;
                } else {
                    if (valType(val)) obj[key] = val;
                }
            }
        }
        return obj;
    }
    private objectToArray<T = unknown>(object: any): [string, T][] {
        if (typeof object !== "object" || object === null) return [];
        let array: [string, T][] = [];
        for (const item of Object.keys(object)) {
            let val = object[item];
            array.push([item, val]);
        }
        return array;
    }
    get(): ConfigurationType {
        const res: ConfigurationType = super.get();

        res.filePathMapReplace = this.arrayToObject<string[]>(res.filePathMapReplace, (val) => Array.isArray(val));
        res.watchFilePathRegExp = this.arrayToObject<string>(res.watchFilePathRegExp, "string");

        return res;
    }
    update(option: ConfigurationType): void;
    update<T extends keyof ConfigurationType>(key: T, val: ConfigurationType[T]): void;
    update<T extends keyof ConfigurationType>(
        keyOrOption: ConfigurationType | T,
        val?: ConfigurationType[T] | undefined
    ) {
        const config = this.config;
        let option = typeof keyOrOption === "object" ? keyOrOption : { [keyOrOption]: val };

        for (const key of Object.keys(option) as (keyof ConfigurationType)[]) {
            let value: any = option[key];

            if (key === "filePathMapReplace" || key == "watchFilePathRegExp") value = this.objectToArray(value);
            config.update(key, value);
        }
    }
}
