declare module "vue" {
    type reactiveData<T extends Object> = T;
    export function reactive<T extends Object>(obj: T): reactiveData<T>;

    export type vueObjCPNI<Props = any, P = any> = {
        readonly el: HTMLElement;
        readonly $data: reactiveData<P>;
        readonly $slots: ReadonlyArray<listChildren>;
        readonly $props: Readonly<Props>;
        readonly $attrs: Readonly<Object>;
    };
    export type vueObjCPN = {
        created?(): any;
        data?(this: vueObjCPNI): Object;
        mounted?(this: vueObjCPNI): Function;
        render(this: vueObjCPNI): ReturnType<vueFxCPN>;
    };
    export type vueFxCPN = Function;
    export type vueCPN = string | vueFxCPN | vueObjCPN;

    export type SetupContext = {
        slots: vueObjCPN["$slots"];
        attrs: vueObjCPN["$attrs"];
    };
    export function toRaw<T>(obj: T): Record<T>;
    export function createApp(p: Object): {
        mount(el: HTMLElement): vm;
    };

    type vNode = JSX.Element & {};
    type listChildren = vNode[];
    type ObjectChildren = { [key: string]: vNode | ((...arg: any) => vNode) };

    type vue2Props = { style?: Object; attrs?: Object };
    type vue3Props = Object;

    /** vue3 h函数 */
    export function h(tag: vueCPN, props?: null | vue3Props, children?: vNode | listChildren | ObjectChildren): vNode;
    /** vue2 h函数 */
    export type v2hFx = (tag: vueCPN, props?: vue2Props, children: listChildren | vNode) => vNode;
    export default class vm {
        constructor(cpn: vueCPN);
    }
    export function getCurrentInstance(): boolean;
    export function isVNode(p: any): boolean;
    export const version: string;
}
