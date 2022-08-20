import * as Vue from "vue";
import { h, Fragment, defineComponent, DefineComponent, PropType } from "vue";

type obj = { [key: string | number | symbol]: any };
/** props为T的组件类型 */
type CPN<T extends obj> = ((prop: T) => Vue.VNode) | DefineComponent<T>;

type ExcludeKey<T, key extends keyof T> = { [k in keyof T as k extends key ? never : k]: T[k] };
type svgIcon = ExcludeKey<Vue.SVGAttributes, "width" | "height" | "scale"> & { scale?: number };

/** 用途:(更简便地定义props), 为了偏过defineComponent
 * Vue.defineComponent({
 *      props:abstractProps<{...}>
 * }) */
export type abstractProps<T> = {
    [key in keyof T]-?: { type: PropType<NonNullable<T[key]>>; required: undefined extends T[key] ? false : true };
};

/** 快速定义props, 骗过defineComponent的类型检查
 * 格式 {
 *      属性:undefined  //可选项，没有默认值
 *      属性:默认值     //可选项，带有默认值
 *      属性:defindeProps.required  //必选项, 没有默认值
 * }
 */
export function defindeProps<T extends Object>(ops: T): abstractProps<T> {
    var reOps: obj = ops;
    var ret: any = {};
    var keys = Object.keys(reOps);
    for (const it of keys) {
        var val: any = reOps[val];
        var temp: any;
        if (val === defindeProps.required) temp = { required: true }; //必选项, 没有默认值
        else if (val !== undefined) temp = { default: val }; //可选项，没有默认值
        else temp = null; //可选项，没有默认值
        ret[it] = temp;
    }
    return ret;
}
defindeProps.required = Symbol("required"); //必选项
function svgIconFactoy(props: Vue.SVGAttributes, slots: JSX.Element[]) {
    var { scale = 24 } = props;

    var setProps: Vue.SVGAttributes = Object.assign({}, props, {
        width: scale,
        height: scale,
        viewBox: "0 0 48 48",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
    });
    Reflect.deleteProperty(setProps, "color");
    Reflect.deleteProperty(setProps, "scale");
    return h("svg", setProps, slots);
}
export const icon = {
    reload(props: svgIcon) {
        var { color = "#333" } = props;
        return svgIconFactoy(props, [
            <path d="M42 8V24" stroke={color} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />,
            <path d="M6 24L6 40" stroke={color} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />,
            <path
                d="M42 24C42 14.0589 33.9411 6 24 6C18.9145 6 14.3216 8.10896 11.0481 11.5M6 24C6 33.9411 14.0589 42 24 42C28.8556 42 33.2622 40.0774 36.5 36.9519"
                stroke={color}
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
            />,
        ]);
    },
    install(props: svgIcon) {
        var { color = "#333" } = props;
        return svgIconFactoy(props, [
            <path
                d="M41.4004 11.551L36.3332 5H11.6666L6.58398 11.551"
                stroke={color}
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
            />,
            <path
                d="M6 13C6 11.8954 6.89543 11 8 11H40C41.1046 11 42 11.8954 42 13V40C42 41.6569 40.6569 43 39 43H9C7.34315 43 6 41.6569 6 40V13Z"
                fill="none"
                stroke={color}
                stroke-width="4"
                stroke-linejoin="round"
            />,
            <path
                d="M32 27L24 35L16 27"
                stroke={color}
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
            />,
            <path d="M23.9917 19V35" stroke={color} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />,
        ]);
    },
    watch(props: svgIcon) {
        var { color = "#333" } = props;
        return svgIconFactoy(props, [
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M24 41C33.9411 41 42 32.678 42 27C42 21.322 33.9411 13 24 13C14.0589 13 6 21.3278 6 27C6 32.6722 14.0589 41 24 41Z"
                fill="none"
                stroke={color}
                stroke-width="4"
                stroke-linejoin="round"
            />,
            <path
                d="M24 33C27.3137 33 30 30.3137 30 27C30 23.6863 27.3137 21 24 21C20.6863 21 18 23.6863 18 27C18 30.3137 20.6863 33 24 33Z"
                fill="none"
                stroke={color}
                stroke-width="4"
                stroke-linejoin="round"
            />,
            <path d="M13.2637 11.2661L15.8582 14.8863" stroke={color} stroke-width="4" stroke-linecap="round" />,
            <path d="M35.625 11.7104L33.0304 15.3307" stroke={color} stroke-width="4" stroke-linecap="round" />,
            <path d="M24.0088 7V13" stroke={color} stroke-width="4" stroke-linecap="round" />,
        ]);
    },
    setting(props: svgIcon) {
        var { color = "#333" } = props;
        return svgIconFactoy(props, [
            <path
                d="M24 4L18 10H10V18L4 24L10 30V38H18L24 44L30 38H38V30L44 24L38 18V10H30L24 4Z"
                fill="none"
                stroke={color}
                stroke-width="4"
                stroke-linejoin="round"
            />,
            <path
                d="M24 30C27.3137 30 30 27.3137 30 24C30 20.6863 27.3137 18 24 18C20.6863 18 18 20.6863 18 24C18 27.3137 20.6863 30 24 30Z"
                fill="none"
                stroke={color}
                stroke-width="4"
                stroke-linejoin="round"
            />,
        ]);
    },
    autoReload(props: svgIcon) {
        var { color = "#333" } = props;
        return svgIconFactoy(props, [
            <path
                d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
                fill="none"
                stroke={color}
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
            />,
            <path d="M24 12V15" stroke={color} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />,
            <path
                d="M32.4852 15.5147L30.3639 17.636"
                stroke={color}
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
            />,
            <path d="M36 24H33" stroke={color} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />,
            <path
                d="M32.4852 32.4853L30.3639 30.364"
                stroke={color}
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
            />,
            <path d="M24 36V33" stroke={color} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />,
            <path
                d="M15.5148 32.4853L17.6361 30.364"
                stroke={color}
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
            />,
            <path d="M12 24H15" stroke={color} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />,
            <path
                d="M15.5148 15.5147L17.6361 17.636"
                stroke={color}
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
            />,
        ]);
    },
};
export const UI = {
    mouseOverUI: defineComponent({
        data() {
            return {
                mouseOver: false,
                mouseDown: false,
            };
        },
        methods: {
            onMouseOver() {
                this.mouseOver = !this.mouseOver;
            },
            onMouseDown() {
                this.mouseDown = !this.mouseDown;
            },
        },
        props: defindeProps({
            Element: defindeProps.required,
            MouseOverStyle: undefined,
            MouseDownStyle: undefined,
        }) as any as abstractProps<{
            Element: CPN<any> | string;
            MouseOverStyle?: Vue.StyleValue;
            MouseDownStyle?: Vue.StyleValue;
        }> &
            abstractProps<Vue.HTMLAttributes>,
        render() {
            const props = this.$props;
            const attrs: Vue.HTMLAttributes = Object.assign({}, this.$attrs);
            var mouseDownStyle = props.MouseDownStyle;
            var mouseOverStyle = props.MouseOverStyle;

            attrs.style = Object.assign({}, attrs.style);
            if (this.mouseDown) attrs.style = Object.assign(attrs.style, mouseDownStyle);
            else if (this.mouseOver) attrs.style = Object.assign(attrs.style, mouseOverStyle);

            if (mouseDownStyle) {
                attrs.onMousedown = this.onMouseDown;
                attrs.onMouseup = this.onMouseDown;
            }
            if (mouseOverStyle) {
                attrs.onMouseover = this.onMouseOver;
                attrs.onMouseout = this.onMouseOver;
            }
            return h(this.$props.Element as any, attrs, this.$slots);
        },
    }),
};
