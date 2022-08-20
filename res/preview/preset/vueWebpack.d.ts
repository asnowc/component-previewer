/// <reference types="react" />
export declare const comm: {
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
            select(index: number): void;
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
            select(index: number): void;
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
/** 直接导入bridge/activeModule (预览的是当前活动文件) */
export declare function renderFromActiveModule(): Promise<void>;
/** 自动导入 (最终预览的是文件映射) */
export declare function autoRender(): Promise<void>;
/**
 * @param activeFile 你要显示的组件相对路径
 */
export declare function renderFromFileURL(activeFile: string | Promise<string>): Promise<void>;
export declare function render(mod: any, url?: string): Promise<void>;
