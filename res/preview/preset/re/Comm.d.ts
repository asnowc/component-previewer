/// <reference types="react" />
export default function (h: (...arg: any) => Object, parent: parentComponent): {
    NullTemplate(arg?: string | undefined): any;
    ErrorTemplate(arg?: string | undefined): JSX.Element;
    Selector: {
        new (props: {
            names: string[];
            index: number;
            onSelect?: ((id: number) => any) | undefined;
        } | Readonly<{
            names: string[];
            index: number;
            onSelect?: ((id: number) => any) | undefined;
        }>): {
            /** 组件类别被点击 */
            select(index: number): void;
            /**  */
            onMouseOver(e: any): void;
            onMouseOut(e: any): void;
            render(): any;
            context: unknown;
            setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<{
                names: string[];
                index: number;
                onSelect?: ((id: number) => any) | undefined;
            }>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
            forceUpdate(callback?: (() => void) | undefined): void;
            readonly props: Readonly<{
                names: string[];
                index: number;
                onSelect?: ((id: number) => any) | undefined;
            }>;
            state: Readonly<{}>;
            refs: {
                [key: string]: import("react").ReactInstance;
            };
            componentDidMount?(): void;
            shouldComponentUpdate?(nextProps: Readonly<{
                names: string[];
                index: number;
                onSelect?: ((id: number) => any) | undefined;
            }>, nextState: Readonly<{}>, nextContext: any): boolean;
            componentWillUnmount?(): void;
            componentDidCatch?(error: Error, errorInfo: import("react").ErrorInfo): void;
            getSnapshotBeforeUpdate?(prevProps: Readonly<{
                names: string[];
                index: number;
                onSelect?: ((id: number) => any) | undefined;
            }>, prevState: Readonly<{}>): any;
            componentDidUpdate?(prevProps: Readonly<{
                names: string[];
                index: number;
                onSelect?: ((id: number) => any) | undefined;
            }>, prevState: Readonly<{}>, snapshot?: any): void;
            componentWillMount?(): void;
            UNSAFE_componentWillMount?(): void;
            componentWillReceiveProps?(nextProps: Readonly<{
                names: string[];
                index: number;
                onSelect?: ((id: number) => any) | undefined;
            }>, nextContext: any): void;
            UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{
                names: string[];
                index: number;
                onSelect?: ((id: number) => any) | undefined;
            }>, nextContext: any): void;
            componentWillUpdate?(nextProps: Readonly<{
                names: string[];
                index: number;
                onSelect?: ((id: number) => any) | undefined;
            }>, nextState: Readonly<{}>, nextContext: any): void;
            UNSAFE_componentWillUpdate?(nextProps: Readonly<{
                names: string[];
                index: number;
                onSelect?: ((id: number) => any) | undefined;
            }>, nextState: Readonly<{}>, nextContext: any): void;
        };
        new (props: {
            names: string[];
            index: number;
            onSelect?: ((id: number) => any) | undefined;
        }, context: any): {
            /** 组件类别被点击 */
            select(index: number): void;
            /**  */
            onMouseOver(e: any): void;
            onMouseOut(e: any): void;
            render(): any;
            context: unknown;
            setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<{
                names: string[];
                index: number;
                onSelect?: ((id: number) => any) | undefined;
            }>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
            forceUpdate(callback?: (() => void) | undefined): void;
            readonly props: Readonly<{
                names: string[];
                index: number;
                onSelect?: ((id: number) => any) | undefined;
            }>;
            state: Readonly<{}>;
            refs: {
                [key: string]: import("react").ReactInstance;
            };
            componentDidMount?(): void;
            shouldComponentUpdate?(nextProps: Readonly<{
                names: string[];
                index: number;
                onSelect?: ((id: number) => any) | undefined;
            }>, nextState: Readonly<{}>, nextContext: any): boolean;
            componentWillUnmount?(): void;
            componentDidCatch?(error: Error, errorInfo: import("react").ErrorInfo): void;
            getSnapshotBeforeUpdate?(prevProps: Readonly<{
                names: string[];
                index: number;
                onSelect?: ((id: number) => any) | undefined;
            }>, prevState: Readonly<{}>): any;
            componentDidUpdate?(prevProps: Readonly<{
                names: string[];
                index: number;
                onSelect?: ((id: number) => any) | undefined;
            }>, prevState: Readonly<{}>, snapshot?: any): void;
            componentWillMount?(): void;
            UNSAFE_componentWillMount?(): void;
            componentWillReceiveProps?(nextProps: Readonly<{
                names: string[];
                index: number;
                onSelect?: ((id: number) => any) | undefined;
            }>, nextContext: any): void;
            UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{
                names: string[];
                index: number;
                onSelect?: ((id: number) => any) | undefined;
            }>, nextContext: any): void;
            componentWillUpdate?(nextProps: Readonly<{
                names: string[];
                index: number;
                onSelect?: ((id: number) => any) | undefined;
            }>, nextState: Readonly<{}>, nextContext: any): void;
            UNSAFE_componentWillUpdate?(nextProps: Readonly<{
                names: string[];
                index: number;
                onSelect?: ((id: number) => any) | undefined;
            }>, nextState: Readonly<{}>, nextContext: any): void;
        };
        contextType?: import("react").Context<any> | undefined;
    };
    HOME: {
        new (props: {
            instanceList: {
                url: string;
            } & {
                name: string;
                instance?: JSX.Element | undefined;
            }[];
        }): {
            state: Readonly<{
                showIndex: number;
            }>;
            change(index: number): void;
            render(): import("react").ReactNode;
            context: unknown;
            setState<K_1 extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<{
                instanceList: {
                    url: string;
                } & {
                    name: string;
                    instance?: JSX.Element | undefined;
                }[];
            }>) => {} | Pick<{}, K_1> | null) | Pick<{}, K_1> | null, callback?: (() => void) | undefined): void;
            forceUpdate(callback?: (() => void) | undefined): void;
            readonly props: Readonly<{
                instanceList: {
                    url: string;
                } & {
                    name: string;
                    instance?: JSX.Element | undefined;
                }[];
            }>;
            refs: {
                [key: string]: import("react").ReactInstance;
            };
            componentDidMount?(): void;
            shouldComponentUpdate?(nextProps: Readonly<{
                instanceList: {
                    url: string;
                } & {
                    name: string;
                    instance?: JSX.Element | undefined;
                }[];
            }>, nextState: Readonly<{}>, nextContext: any): boolean;
            componentWillUnmount?(): void;
            componentDidCatch?(error: Error, errorInfo: import("react").ErrorInfo): void;
            getSnapshotBeforeUpdate?(prevProps: Readonly<{
                instanceList: {
                    url: string;
                } & {
                    name: string;
                    instance?: JSX.Element | undefined;
                }[];
            }>, prevState: Readonly<{}>): any;
            componentDidUpdate?(prevProps: Readonly<{
                instanceList: {
                    url: string;
                } & {
                    name: string;
                    instance?: JSX.Element | undefined;
                }[];
            }>, prevState: Readonly<{}>, snapshot?: any): void;
            componentWillMount?(): void;
            UNSAFE_componentWillMount?(): void;
            componentWillReceiveProps?(nextProps: Readonly<{
                instanceList: {
                    url: string;
                } & {
                    name: string;
                    instance?: JSX.Element | undefined;
                }[];
            }>, nextContext: any): void;
            UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{
                instanceList: {
                    url: string;
                } & {
                    name: string;
                    instance?: JSX.Element | undefined;
                }[];
            }>, nextContext: any): void;
            componentWillUpdate?(nextProps: Readonly<{
                instanceList: {
                    url: string;
                } & {
                    name: string;
                    instance?: JSX.Element | undefined;
                }[];
            }>, nextState: Readonly<{}>, nextContext: any): void;
            UNSAFE_componentWillUpdate?(nextProps: Readonly<{
                instanceList: {
                    url: string;
                } & {
                    name: string;
                    instance?: JSX.Element | undefined;
                }[];
            }>, nextState: Readonly<{}>, nextContext: any): void;
        };
        contextType?: import("react").Context<any> | undefined;
    };
};
declare type parentComponent = typeof global.React.Component;
/** 筛选组件 */
export declare function getVDOMList(unk_mod: Object, h: (...arg: any) => Object, isCommponent: (cp: any) => boolean, url?: string): {
    url: string;
} & {
    name: string;
    instance?: JSX.Element | undefined;
}[];
/**
 * Vite 项目自定义显示文件
 * 你可以根据你的需求进行修改, 显示你的页面
 * @description 判断activeFile, 判断是否是.test.**结尾，如果是，直接返回 否则返回 .test.**的文件
 * @return {string} 返回要预览的文件相对URL
 */
export declare function getActiveFileMap(): Promise<string>;
export {};
