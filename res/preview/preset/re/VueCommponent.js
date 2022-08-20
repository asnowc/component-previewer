import * as vue from "vue";
/// <reference path="./DD" />
const vueVersion = parseInt(vue.version.slice(0, vue.version.indexOf(".")));
function Vue3createElement(cpn, props, ...children) {
    if (typeof cpn === "function") {
        let VueChilds = {};
        for (let i = 0; i < children.length; i++) {
            VueChilds["p" + i] = children[i];
        }
        if (cpn.prototype instanceof Component) {
            //类组件
            var inClassCPN = cpn;
            var instance;
            var renderFx;
            var CPN = {
                data() {
                    var reactProps = Object.assign({}, props, vue.toRaw(this.$attrs));
                    reactProps.children = this.$slots;
                    Object.freeze(reactProps);
                    instance = new inClassCPN(reactProps);
                    renderFx = instance.render.bind(instance);
                    return instance.state;
                },
                created() {
                    instance.state = this.$data;
                },
                render() {
                    return renderFx(this.$attrs);
                },
            };
            return vue.h(CPN, props, VueChilds);
        }
        else
            return vue.h(cpn, props, VueChilds); //函数组件
    }
    else
        return vue.h.apply(undefined, arguments);
}
/** 不会修改children和props */
function createVnode(cpn, props, children) {
    var reactProps = {};
    if (props) {
        reactProps = Object.assign(props);
    }
    if (typeof cpn === "function") {
        if (cpn.prototype instanceof Component) {
            //类组件
            var inClassCPN = cpn;
            var instance;
            var renderFx;
            let proxyCPN = {
                data() {
                    reactProps.children = this.$slots;
                    Object.freeze(reactProps);
                    instance = new inClassCPN(reactProps);
                    renderFx = instance.render.bind(instance);
                    return instance.state;
                },
                created() {
                    instance.state = this.$data;
                },
                render() {
                    return renderFx(this.$attrs);
                },
            };
            return [proxyCPN, props, children];
        }
        else {
            //函数组件
            var proxyCPN = function (props, { slots }) {
                if (!reactProps.children)
                    reactProps.children = slots;
                return cpn(reactProps);
            };
            return [proxyCPN, props, children];
        }
    }
    else
        return [cpn, props, children];
}
const vue2ElementIdentity = Symbol("vue2.JSX");
export const createElement = (function () {
    if (vueVersion >= 3)
        return Vue3createElement;
    return function Vue2CreateElement(cpn, props, ...children) {
        if (vue.getCurrentInstance()) {
            if (children) {
                children = children.map(function (val) {
                    var unk_val = val;
                    var data = unk_val[vue2ElementIdentity];
                    if (data)
                        return unk_val();
                    else
                        return val;
                });
            }
            let pat = createVnode(cpn, props, children);
            return vue.h(pat[0], { attrs: pat[1], style: pat[1].style }, pat[2]);
        }
        else {
            let vNode = function (cpn, props, children) {
                let pat = createVnode(cpn, props, children);
                return vue.h(pat[0], { attrs: pat[1], style: pat[1]?.style }, pat[2]);
            };
            vNode = vNode.bind(undefined, cpn, props, children);
            vNode[vue2ElementIdentity] = true;
            return vNode;
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
export class Component {
    constructor(props) {
        this.props = props;
        var methods = {};
        for (const key in this) {
            let fx = this[key];
            if (typeof fx === "function")
                methods[key] = fx;
        }
        this.setState = this.setState.bind(this);
    }
    $props; //vue中的声明
    context;
    refs = {};
    forceUpdate() { }
    props;
    state = vue.reactive({});
    setState(data) {
        Object.assign(this.state, data);
    }
    render() {
        return;
    }
}
class App {
    constructor(root) {
        this.#root = root;
    }
    #root;
    render(node) {
        let version = vueVersion;
        if (version >= 3) {
            vue.createApp(node).mount(this.#root);
        }
        else {
            var vnode = node;
            if (vnode[vue2ElementIdentity]) {
                new vue.default({
                    el: this.#root,
                    render: vnode,
                });
            }
            else {
                throw "错误的组件";
            }
        }
    }
}
export function createRoot(root) {
    return new App(root);
}
export function isValidElement(e) {
    return vue.isVNode(e);
}
export const version = "18.0.0";
