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
    watchScope: string;
}
export class CpvConfiguration extends Configuration<ConfigurationType> {
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
    get(): ConfigurationType {
        const res = super.get();

        /** 处理filePathMapReplace的错误值(确保类型正确) */
        let obj = res.filePathMapReplace;
        for (const key of Object.keys(obj)) {
            var val = obj[key];
            var newVal = [];
            if (Array.isArray(val)) {
                for (const item of val) if (typeof item === "string") newVal.push(item);
            }
            if (newVal.length === 0) Reflect.deleteProperty(obj, key);
            else obj[key] = newVal;
        }
        return res;
    }
}
