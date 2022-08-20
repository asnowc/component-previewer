import * as vue from "vue";
/// <reference path="./DD" />

const vueVersion = parseInt(vue.version.slice(0, vue.version.indexOf(".")));

type obj = { [key: string | number | symbol]: any };
type CPN = string | classCPN | Function;
type Children = JSX.Element;
function Vue3createElement(cpn: CPN, props?: null | undefined | obj, ...children: Children[]): JSX.Element {
    if (typeof cpn === "function") {
        let VueChilds: { [key: string]: Children } = {};
        for (let i = 0; i < children.length; i++) {
            VueChilds["p" + i] = children[i];
        }
        if (cpn.prototype instanceof Component) {
            //类组件
            var inClassCPN: classCPN = cpn as any;
            var instance: any;
            var renderFx: Function;
            var CPN = {
                data(this: any) {
                    var reactProps = Object.assign({}, props, vue.toRaw(this.$attrs));
                    reactProps.children = this.$slots;
                    Object.freeze(reactProps);
                    instance = new inClassCPN(reactProps);
                    renderFx = instance.render.bind(instance);
                    return instance.state;
                },
                created(this: any) {
                    instance.state = this.$data;
                },
                render(this: any) {
                    return renderFx(this.$attrs);
                },
            };
            return vue.h(CPN as any, props, VueChilds) as any;
        } else return vue.h(cpn as any, props, VueChilds) as any; //函数组件
    } else return vue.h.apply(undefined, arguments as any) as any;
}

/** 不会修改children和props */
function createVnode(cpn: CPN, props: null | undefined | obj, children: any): any[] {
    var reactProps: any = {};
    if (props) {
        reactProps = Object.assign(props);
    }
    if (typeof cpn === "function") {
        if (cpn.prototype instanceof Component) {
            //类组件
            var inClassCPN: classCPN = cpn as any;
            var instance: any;
            var renderFx: Function;
            let proxyCPN = {
                data(this: any) {
                    reactProps.children = this.$slots;
                    Object.freeze(reactProps);
                    instance = new inClassCPN(reactProps);
                    renderFx = instance.render.bind(instance);
                    return instance.state;
                },
                created(this: any) {
                    instance.state = this.$data;
                },
                render(this: any) {
                    return renderFx(this.$attrs);
                },
            };
            return [proxyCPN as any, props, children];
        } else {
            //函数组件
            var proxyCPN = function (props: any, { slots }: vue.SetupContext) {
                if (!reactProps.children) reactProps.children = slots;
                return (cpn as any)(reactProps);
            };
            return [proxyCPN as CPN, props, children];
        }
    } else return [cpn, props, children];
}
const vue2ElementIdentity = Symbol("vue2.JSX");
export const createElement = (function () {
    if (vueVersion >= 3) return Vue3createElement;
    type customVnode = (() => JSX.Element) & {
        [vue2ElementIdentity]: true;
    };
    return function Vue2CreateElement(
        cpn: CPN,
        props?: null | undefined | obj,
        ...children: (Children | customVnode)[]
    ): JSX.Element {
        if (vue.getCurrentInstance()) {
            if (children) {
                children = children.map(function (val) {
                    var unk_val = val as customVnode;
                    var data = unk_val[vue2ElementIdentity];
                    if (data) return unk_val();
                    else return val;
                });
            }
            let pat = createVnode(cpn, props, children);
            return vue.h(pat[0], { attrs: pat[1], style: pat[1].style }, pat[2]) as any;
        } else {
            let vNode = function (cpn: any, props: any, children: any) {
                let pat = createVnode(cpn, props, children);
                return vue.h(pat[0], { attrs: pat[1], style: pat[1]?.style }, pat[2]);
            };
            vNode = vNode.bind(undefined, cpn, props, children) as any;
            (vNode as any)[vue2ElementIdentity] = true;
            return vNode as any;
            /* if (typeof cpn === "function") {
                let VueChilds: { [key: string]: Children } = {};
                for (let i = 0; i < children.length; i++) {
                    VueChilds["p" + i] = children[i];
                }
                var instance: any;
                var renderFx: Function;
                var reactProps: any;
                if (cpn.prototype instanceof Component) {
                    //类组件
                    var inClassCPN: classCPN = cpn as any;
                    var proxyCPN = {
                        data(this: any) {
                            reactProps = Object.assign({}, props);
                            reactProps.children = this.$slots;
                            Object.freeze(reactProps);
                            instance = new inClassCPN(reactProps);
                            renderFx = instance.render.bind(instance);
                            return instance.state;
                        },
                        created(this: any) {
                            instance.state = this.$data;
                        },
                        render(this: any) {
                            let vnode = renderFx(reactProps);
                            return vnode;
                            // if(vnode[vue2ElementIdentity]) return vnode.render();
                            // else return vnode;
                        },
                        [vue2ElementIdentity]: true,
                    };
                    return proxyCPN as any;
                } else {
                    //函数组件
                    renderFx = cpn;
                    let proxyCPN = {
                        created(this: any) {
                            reactProps = Object.assign({}, props);
                            reactProps.children = this.$slots;
                            Object.freeze(reactProps);
                        },
                        render(this: any) {
                            renderFx(reactProps);
                        },
                        [vue2ElementIdentity]: true,
                    };
                    return proxyCPN as any;
                }
            } else {
                return {
                    render() {},
                } as any;
            } */
        }
    };
})();

export type ReactNode = React.ReactNode;
export class Component<PropsType = {}> implements JSX.ElementClass, React.Component {
    constructor(props: Readonly<PropsType>) {
        this.props = props;
        var methods: { [key: number | symbol | string]: Function } = {};
        for (const key in this) {
            let fx = this[key] as Function | unknown;
            if (typeof fx === "function") methods[key] = fx;
        }
        this.setState = this.setState.bind(this);
    }
    $props: any; //vue中的声明
    context: unknown;
    refs: { [key: string]: any } = {};
    forceUpdate() {}

    readonly props: Readonly<PropsType>;
    state: Object = vue.reactive({});
    setState(data: Object) {
        Object.assign(this.state, data);
    }
    render(): React.ReactNode {
        return;
    }
}
type classCPN = new (props: Object) => Component;

class App {
    constructor(root: HTMLElement) {
        this.#root = root;
    }
    #root: HTMLElement;
    render(node: JSX.Element) {
        let version = vueVersion;
        if (version >= 3) {
            vue.createApp(node).mount(this.#root);
        } else {
            var vnode: any = node;
            if (vnode[vue2ElementIdentity]) {
                new (vue as any).default({
                    el: this.#root,
                    render: vnode,
                });
            } else {
                throw "错误的组件";
            }
        }
    }
}
export function createRoot(root: HTMLElement) {
    return new App(root);
}

export function isValidElement(e: any) {
    return vue.isVNode(e);
}
export const version = "18.0.0";
