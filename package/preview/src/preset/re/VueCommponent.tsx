import * as vue from "vue";

const vueVersion = parseInt(vue.version.slice(0, vue.version.indexOf(".")));

type obj = { [key: string | number | symbol]: any };

export type ReactNode = ReturnType<typeof vue.h>;
export class Component<PropsType = {}> implements JSX.ElementClass {
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
type ClassCPN = new (props: Object) => Component;
type FxCPN = (...arg: any) => ReactNode;
type CPN = string | ClassCPN | FxCPN;
type Children = ReactNode[];
type defaultProps = {
    key?: any;
    className?: any;
    style?: StyleSheet;
};
type Props = {} & defaultProps;
type getInProps<T> = Readonly<T> & { readonly children: Children };

const vue2ElementIdentity = Symbol("vue2.JSX");
export const createElement = (function () {
    function createVnode(cpn: CPN, props: null | undefined | Props): vue.vueCPN {
        if (typeof cpn === "function") {
            var reactProps: any = {};
            if (props) {
                reactProps = Object.assign({}, props);
                if (props.style) reactProps.style = Object.assign({}, props.style);
            }
            if (cpn.prototype instanceof Component) {
                var ReactInstance: Component;
                var renderFx: Function;
                var proxyCPN = {
                    data(this: vue.vueObjCPNI) {
                        (reactProps as any).children = this.$slots;
                        ReactInstance = new (cpn as ClassCPN)(reactProps);
                        renderFx = ReactInstance.render.bind(ReactInstance);
                        return ReactInstance.state;
                    },
                    created(this: vue.vueObjCPNI) {
                        ReactInstance.state = this.$data;
                    },
                    render(this: vue.vueObjCPNI) {
                        (reactProps as any).children = this.$slots;
                        return renderFx(this.$attrs);
                    },
                };
                return proxyCPN as vue.vueObjCPN;
            } else {
                if (vueVersion === 2)
                    return {
                        created(this: vue.vueObjCPNI) {
                            reactProps.children = this.$slots;
                        },
                        render(this: vue.vueObjCPNI) {
                            return (cpn as any)(reactProps);
                        },
                    };
                else
                    return function FxProxCPN(props: Props, { slots }: vue.SetupContext) {
                        if (!reactProps.children) {
                            reactProps.children = slots;
                            Object.freeze(reactProps);
                        }
                        return (cpn as FxCPN)(reactProps);
                    } as vue.vueFxCPN;
            }
        } else return cpn;
    }
    function Vue3createElement(cpn: CPN, props?: null | undefined | Props, ...children: Children): ReactNode {
        if (typeof cpn === "string" && props) {
            // 将React的onMouseOut写法改成vue的onMouseout
            for (const key of Object.keys(props)) {
                if (key.search(/^on[A-Z]\w+[A-Z]\w+$/) === 0) {
                    let vueEventName = "on" + key.toLowerCase().slice(2);
                    let val = (props as any)[key];
                    delete (props as any)[key];
                    (props as any)[vueEventName] = val;
                }
            }
        }
        var proxyCPN = createVnode(cpn, props);
        return vue.h.apply(undefined, [proxyCPN, props, ...children] as any);
    }
    if (vueVersion >= 3) return Vue3createElement;

    type customVnode = (() => JSX.Element) & {
        [vue2ElementIdentity]: (Children | customVnode)[];
    };

    /** vue2使用 */
    function handelChildren(cpns: [Children | customVnode][]): vue.vNode[] {
        return cpns.map(function (cpn) {
            var unk_val = cpn as any;
            var data = unk_val[vue2ElementIdentity];
            if (data) {
                let [props, childs] = data;
                delete unk_val[vue2ElementIdentity];
                // let proxyCPN = createVnode(unk_val, props);
                return vue.h(unk_val, props, handelChildren(childs));
            } else return unk_val as vue.vNode;
        });
    }

    function Vue2CreateElement(
        cpn: CPN,
        props?: null | undefined | obj,
        ...children: [any, (Children | customVnode)[]]
    ): ReactNode {
        var transProps: obj = {};

        //将React props转换成vue2的props
        if (props) {
            transProps.style = props.style;
            transProps.key = props.key;
            transProps.ref = props.ref;
            let atts = { ...props };
            delete atts.style;
            delete atts.key;
            delete atts.ref;
            transProps.attrs = atts;

            //处理原生dom的事件和属性
            //todo 属性需要处理
            if (typeof cpn === "string" && props) {
                transProps.class = props.className;
                delete atts.class;
                let on: obj = {};
                transProps.on = on;
                for (const key of Object.keys(atts)) {
                    if (key.search(/^on[A-Z]\w+[A-Z]?\w*$/) === 0) {
                        let handel = atts[key];
                        if (typeof handel === "function") {
                            let evName = key.slice(2).toLowerCase();
                            on[evName] = handel;
                            delete atts[key];
                        }
                        //todo 如果handel不是函数
                    }
                }
            }
        }

        if (vue.getCurrentInstance()) {
            let knownChildren: Children | undefined = undefined;
            if (children.length > 0) knownChildren = handelChildren(children);
            let proxyCPN = createVnode(cpn, props);
            return vue.h(proxyCPN, transProps, knownChildren);
        } else {
            let proxyCPN: any = createVnode(cpn, props);
            //todo 如果是组件是非class或function组件?
            proxyCPN[vue2ElementIdentity] = [transProps, children];
            return proxyCPN;
        }
    }
    Vue2CreateElement.handelChildren = handelChildren;
    return Vue2CreateElement as any as typeof Vue3createElement;
})();

class App {
    constructor(root: HTMLElement) {
        if (!(root instanceof HTMLElement)) throw "目标必须是一个HTML元素";
        this.#root = root;
    }
    #root: HTMLElement;
    render(node: JSX.Element) {
        let version = vueVersion;
        if (version >= 3) vue.createApp(node).mount(this.#root);
        else {
            var myVNode: any = node;
            if (myVNode[vue2ElementIdentity]) {
                new (vue as any).default({
                    el: this.#root,
                    render(h: typeof vue.h) {
                        var [props, childs] = myVNode[vue2ElementIdentity];
                        return h(myVNode, props, (createElement as any).handelChildren(childs));
                    },
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
    if (typeof e === "function" && e[vue2ElementIdentity]) return true;
    return vue.isVNode(e);
}
export const version = "18.0.0";
