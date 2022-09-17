import * as React from "react";
import { useState, useMemo, createElement } from "react";

type obj = { [key: string | number | symbol]: any };

type ExcludeKey<T, key extends keyof T> = { [k in keyof T as k extends key ? never : k]: T[k] };
type svgIcon = ExcludeKey<JSX.IntrinsicElements["svg"], "width" | "height" | "scale"> & { scale?: number };

function svgIconFactoy(props: JSX.IntrinsicElements["svg"], children: JSX.Element[]) {
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
export const icon = {
    reload(props: svgIcon) {
        var { color = "#333" } = props;
        return svgIconFactoy(props, [
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
        return svgIconFactoy(props, [
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
        return svgIconFactoy(props, [
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
        return svgIconFactoy(props, [
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
        return svgIconFactoy(props, [
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
};

type CPN = string | React.FunctionComponent<any> | React.ComponentClass<any, any>;
export const UI = {
    mouseOverUI(
        props: {
            Element: CPN;
            MouseOverStyle?: React.CSSProperties;
            MouseDownStyle?: React.CSSProperties;
            children?: React.ReactNode;
        } & JSX.IntrinsicElements["a"]
    ) {
        const nextProps = Object.assign({}, props) as JSX.IntrinsicElements["abbr"];
        Reflect.deleteProperty(nextProps, "Element");
        Reflect.deleteProperty(nextProps, "MouseOverStyle");
        Reflect.deleteProperty(nextProps, "MouseDownStyle");
        Reflect.deleteProperty(nextProps, "children");
        var mouseDownStyle = props.MouseDownStyle;
        var mouseOverStyle = props.MouseOverStyle;
        const [mouseOver, setMouseOver] = useState(false);
        const [mouseDown, setMouseDown] = useState(false);
        const _this = useMemo(
            function () {
                return {
                    onMouseOver() {
                        setMouseOver(!mouseOver);
                        _this.mouseOver = !_this.mouseOver;
                    },
                    onMouseDown() {
                        setMouseDown(!mouseDown);
                        _this.mouseDown = !_this.mouseDown;
                    },
                    mouseDown,
                    mouseOver,
                };
            },
            [mouseDown, mouseOver]
        );

        nextProps.style = Object.assign({}, nextProps.style);
        if (_this.mouseDown) nextProps.style = Object.assign(nextProps.style, mouseDownStyle);
        else if (_this.mouseOver) nextProps.style = Object.assign(nextProps.style, mouseOverStyle);

        if (mouseDownStyle) {
            nextProps.onMouseDown = _this.onMouseDown;
            nextProps.onMouseUp = _this.onMouseDown;
        }
        if (mouseOverStyle) {
            nextProps.onMouseOver = _this.onMouseOver;
            nextProps.onMouseOut = _this.onMouseOver;
        }
        return createElement(props.Element, nextProps, props.children);
    },
};
