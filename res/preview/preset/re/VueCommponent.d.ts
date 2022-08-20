/// <reference types="react" />
declare type obj = {
    [key: string | number | symbol]: any;
};
declare type CPN = string | classCPN | Function;
declare type Children = JSX.Element;
declare function Vue3createElement(cpn: CPN, props?: null | undefined | obj, ...children: Children[]): JSX.Element;
export declare const createElement: typeof Vue3createElement;
export declare type ReactNode = React.ReactNode;
export declare class Component<PropsType = {}> implements JSX.ElementClass, React.Component {
    constructor(props: Readonly<PropsType>);
    $props: any;
    context: unknown;
    refs: {
        [key: string]: any;
    };
    forceUpdate(): void;
    readonly props: Readonly<PropsType>;
    state: Object;
    setState(data: Object): void;
    render(): React.ReactNode;
}
declare type classCPN = new (props: Object) => Component;
declare class App {
    #private;
    constructor(root: HTMLElement);
    render(node: JSX.Element): void;
}
export declare function createRoot(root: HTMLElement): App;
export declare function isValidElement(e: any): boolean;
export declare const version = "18.0.0";
export {};
