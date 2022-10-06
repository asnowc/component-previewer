import * as React from "react";
import { useState, createElement } from "react";

type obj = { [key: string | number | symbol]: any };

type ExcludeKey<T, key extends keyof T> = { [k in keyof T as k extends key ? never : k]: T[k] };
type svgIcon = ExcludeKey<JSX.IntrinsicElements["svg"], "width" | "height" | "scale"> & { scale?: number };

function svgIconFactory(props: JSX.IntrinsicElements["svg"], children: JSX.Element[]) {
    var { scale = 24 } = props;

    var setProps: JSX.IntrinsicElements["svg"] = Object.assign({}, props, {
        width: scale,
        height: scale,
        viewBox: "0 0 48 48",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
    });
    Reflect.deleteProperty(setProps, "color");
    Reflect.deleteProperty(setProps, "scale");
    return createElement("svg", setProps, ...children);
}
function svgLogoFactory(props: JSX.IntrinsicElements["svg"], children: JSX.Element[]) {
    var { scale = 24 } = props;

    var setProps: JSX.IntrinsicElements["svg"] = Object.assign({}, props, {
        width: scale,
        height: scale,
        viewBox: "0 0 24 24",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
    });
    Reflect.deleteProperty(setProps, "color");
    Reflect.deleteProperty(setProps, "scale");
    return createElement("svg", setProps, ...children);
}
export const icon = {
    reload(props: svgIcon) {
        var { color = "#333" } = props;
        return svgIconFactory(props, [
            <path d="M42 8V24" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />,
            <path d="M6 24L6 40" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />,
            <path
                d="M42 24C42 14.0589 33.9411 6 24 6C18.9145 6 14.3216 8.10896 11.0481 11.5M6 24C6 33.9411 14.0589 42 24 42C28.8556 42 33.2622 40.0774 36.5 36.9519"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />,
        ]);
    },
    install(props: svgIcon) {
        var { color = "#333" } = props;
        return svgIconFactory(props, [
            <path
                d="M41.4004 11.551L36.3332 5H11.6666L6.58398 11.551"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />,
            <path
                d="M6 13C6 11.8954 6.89543 11 8 11H40C41.1046 11 42 11.8954 42 13V40C42 41.6569 40.6569 43 39 43H9C7.34315 43 6 41.6569 6 40V13Z"
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinejoin="round"
            />,
            <path d="M32 27L24 35L16 27" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />,
            <path d="M23.9917 19V35" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />,
        ]);
    },
    watch(props: svgIcon) {
        var { color = "#333" } = props;
        return svgIconFactory(props, [
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M24 41C33.9411 41 42 32.678 42 27C42 21.322 33.9411 13 24 13C14.0589 13 6 21.3278 6 27C6 32.6722 14.0589 41 24 41Z"
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinejoin="round"
            />,
            <path
                d="M24 33C27.3137 33 30 30.3137 30 27C30 23.6863 27.3137 21 24 21C20.6863 21 18 23.6863 18 27C18 30.3137 20.6863 33 24 33Z"
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinejoin="round"
            />,
            <path d="M13.2637 11.2661L15.8582 14.8863" stroke={color} strokeWidth="4" strokeLinecap="round" />,
            <path d="M35.625 11.7104L33.0304 15.3307" stroke={color} strokeWidth="4" strokeLinecap="round" />,
            <path d="M24.0088 7V13" stroke={color} strokeWidth="4" strokeLinecap="round" />,
        ]);
    },
    setting(props: svgIcon) {
        var { color = "#333" } = props;
        return svgIconFactory(props, [
            <path
                d="M24 4L18 10H10V18L4 24L10 30V38H18L24 44L30 38H38V30L44 24L38 18V10H30L24 4Z"
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinejoin="round"
            />,
            <path
                d="M24 30C27.3137 30 30 27.3137 30 24C30 20.6863 27.3137 18 24 18C20.6863 18 18 20.6863 18 24C18 27.3137 20.6863 30 24 30Z"
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinejoin="round"
            />,
        ]);
    },
    autoReload(props: svgIcon) {
        var { color = "#333" } = props;
        return svgIconFactory(props, [
            <path
                d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />,
            <path d="M24 12V15" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />,
            <path
                d="M32.4852 15.5147L30.3639 17.636"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />,
            <path d="M36 24H33" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />,
            <path
                d="M32.4852 32.4853L30.3639 30.364"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />,
            <path d="M24 36V33" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />,
            <path
                d="M15.5148 32.4853L17.6361 30.364"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />,
            <path d="M12 24H15" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />,
            <path
                d="M15.5148 15.5147L17.6361 17.636"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />,
        ]);
    },
    Vue(props: svgIcon) {
        var { color = "#4FC08D" } = props;
        return svgLogoFactory(props, [
            <path
                stroke={color}
                d="M24,1.61H14.06L12,5.16,9.94,1.61H0L12,22.39ZM12,14.08,5.16,2.23H9.59L12,6.41l2.41-4.18h4.43Z"
            />,
        ]);
    },
    React(props: svgIcon) {
        var { color = "#61DAFB" } = props;
        return svgLogoFactory(props, [
            <path
                stroke={color}
                d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z"
            />,
        ]);
    },
    HTML(props: svgIcon) {
        var { color = "#E34F26" } = props;
        return svgLogoFactory(props, [
            <path
                stroke={color}
                d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"
            />,
        ]);
    },
    Vite(props: svgIcon) {
        var { color = "#646CFF" } = props;
        return svgLogoFactory(props, [
            <path
                stroke={color}
                d="m8.286 10.578.512-8.657a.306.306 0 0 1 .247-.282L17.377.006a.306.306 0 0 1 .353.385l-1.558 5.403a.306.306 0 0 0 .352.385l2.388-.46a.306.306 0 0 1 .332.438l-6.79 13.55-.123.19a.294.294 0 0 1-.252.14c-.177 0-.35-.152-.305-.369l1.095-5.301a.306.306 0 0 0-.388-.355l-1.433.435a.306.306 0 0 1-.389-.354l.69-3.375a.306.306 0 0 0-.37-.36l-2.32.536a.306.306 0 0 1-.374-.316zm14.976-7.926L17.284 3.74l-.544 1.887 2.077-.4a.8.8 0 0 1 .84.369.8.8 0 0 1 .034.783L12.9 19.93l-.013.025-.015.023-.122.19a.801.801 0 0 1-.672.37.826.826 0 0 1-.634-.302.8.8 0 0 1-.16-.67l1.029-4.981-1.12.34a.81.81 0 0 1-.86-.262.802.802 0 0 1-.165-.67l.63-3.08-2.027.468a.808.808 0 0 1-.768-.233.81.81 0 0 1-.217-.6l.389-6.57-7.44-1.33a.612.612 0 0 0-.64.906L11.58 23.691a.612.612 0 0 0 1.066-.004l11.26-20.135a.612.612 0 0 0-.644-.9z"
            />,
        ]);
    },
    Webpack(props: svgIcon) {
        var { color = "#8DD6F9" } = props;
        return svgLogoFactory(props, [
            <path
                stroke={color}
                d="M22.1987 18.498l-9.7699 5.5022v-4.2855l6.0872-3.3338 3.6826 2.117zm.6683-.6026V6.3884l-3.5752 2.0544v7.396zm-21.0657.6026l9.7699 5.5022v-4.2855L5.484 16.3809l-3.6826 2.117zm-.6683-.6026V6.3884l3.5751 2.0544v7.396zm.4183-12.2515l10.0199-5.644v4.1434L5.152 7.6586l-.0489.028zm20.8975 0l-10.02-5.644v4.1434l6.4192 3.5154.0489.028 3.5518-2.0427zm-10.8775 13.096l-6.0056-3.2873V8.9384l6.0054 3.4525v6.349zm.8575 0l6.0053-3.2873V8.9384l-6.0053 3.4525zM5.9724 8.1845l6.0287-3.3015L18.03 8.1845l-6.0288 3.4665z"
            />,
        ]);
    },
    Server(props: svgIcon) {
        var { color = "#5a524a", scale } = props;
        return svgIconFactory({ ...props, scale }, [
            <path d="M44 4H4V20H44V4Z" fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" />,
            <path d="M44 28H4V44H44V28Z" fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" />,
            <path
                d="M13 10H11C10.4477 10 10 10.4477 10 11V13C10 13.5523 10.4477 14 11 14H13C13.5523 14 14 13.5523 14 13V11C14 10.4477 13.5523 10 13 10Z"
                fill="#c61919"
            />,
            <path
                d="M13 34H11C10.4477 34 10 34.4477 10 35V37C10 37.5523 10.4477 38 11 38H13C13.5523 38 14 37.5523 14 37V35C14 34.4477 13.5523 34 13 34Z"
                fill="#c61919"
            />,
            <path
                d="M21 10H19C18.4477 10 18 10.4477 18 11V13C18 13.5523 18.4477 14 19 14H21C21.5523 14 22 13.5523 22 13V11C22 10.4477 21.5523 10 21 10Z"
                fill="#31a022"
            />,
            <path
                d="M21 34H19C18.4477 34 18 34.4477 18 35V37C18 37.5523 18.4477 38 19 38H21C21.5523 38 22 37.5523 22 37V35C22 34.4477 21.5523 34 21 34Z"
                fill="#31a022"
            />,
        ]);
    },
};

type CPN = string | React.FunctionComponent<any> | React.ComponentClass<any, any>;
export const UI = {
    mouseOverUI(
        props: JSX.IntrinsicElements["div"] & {
            MouseOverStyle?: React.CSSProperties;
            MouseDownStyle?: React.CSSProperties;
            children?: React.ReactNode;
        }
    ) {
        const { MouseDownStyle, MouseOverStyle } = props;
        const [mouseOver, setMouseOver] = useState(false);
        const [mouseDown, setMouseDown] = useState(false);

        let style = {
            ...props.style,
            ...(mouseDown ? MouseDownStyle : mouseOver ? MouseOverStyle : undefined),
        };
        const nextProps: JSX.IntrinsicElements["div"] = {
            ...props,
            style,
            onMouseDown: () => setMouseDown(true),
            onMouseUp: () => setMouseDown(false),
            onMouseOver: () => setMouseOver(true),
            onMouseOut: () => setMouseOver(false),
        };
        Reflect.deleteProperty(nextProps, "MouseOverStyle");
        Reflect.deleteProperty(nextProps, "MouseDownStyle");
        Reflect.deleteProperty(nextProps, "children");
        return createElement("span", nextProps, props.children);
    },
};

/** 设置了inline-block的div */
export function IB(props: JSX.IntrinsicElements["abbr"]) {
    var nextProps = { ...props };
    const style = nextProps.style;
    if (style && !style.display) style.display = "inline-block";
    return createElement("div", props, props.children);
}

export const iconStyle = {
    down: { opacity: "0.7" },
};
