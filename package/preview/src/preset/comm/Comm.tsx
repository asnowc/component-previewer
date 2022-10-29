import type { BridgeData } from "../../bridge/bridgeFile";

export async function createPage(
    getMod: Promise<any>,
    bridgeData: BridgeData,
    jsxTool: JsxTool
): Promise<[HTMLElement, JSX.Element]> {
    let mod;
    const root = document.createElement("div");
    root.style.height = "100%";
    try {
        mod = await getMod;
    } catch (error) {
        console.error(error);
        mod = error;
    }
    let fileInfo: FileInfo = { fileUrl: bridgeData.activeFileRelPath, mapUrl: bridgeData.mapFileRelPath };
    return [root, createComponent(fileInfo, jsxTool, mod).App];
}

type FileInfo = {
    fileUrl: string;
    mapUrl: string;
};

type obj = {
    [key: number | string | symbol]: any;
};

type JsxTool = {
    createElement: (...arg: any) => JSX.Element;
    Component: typeof global.React.Component;
    isCpn: (cpn: any) => boolean;
};
/** 设置JSX Factory, 返回公共组件
 *  @param parent React是React.Component, Vue是模拟的Component类
 */
export function createComponent(fileInfo: FileInfo, jsxTool: JsxTool, mod?: any) {
    const { Component, createElement: h, isCpn } = jsxTool;

    type previewListItem = { name: string; cpn: Function };
    /** 筛选组件 */
    function getVDOMList(mod: obj, isCpn: (cp: any) => boolean) {
        var Components: previewListItem[] = [];

        for (const name of Object.keys(mod)) {
            let val = mod[name];
            if (!isCpn(val)) continue;
            let obj: previewListItem = { name, cpn: val };

            if (name === "default") Components.unshift(obj);
            else Components.push(obj);
        }
        return Components;
    }

    const template = {
        Null(props: {}) {
            const {} = props;
            var children = ["The file does not export components", <br />];
            return <div style={{ width: "100%", margin: "8px" }}>{children}</div>;
        },
        Error(props: { msg?: string; error: Error }) {
            const { msg, error } = props;
            return (
                <div style={{ width: "100%", margin: "8px", whiteSpace: "pre" }}>
                    {msg}
                    <div style={{ color: "red", fontSize: "12px", marginTop: "8px" }}>{error.stack}</div>
                </div>
            );
        },
    };

    function FileInfo(props: { info: FileInfo }) {
        const { info } = props;
        return (
            <div>
                {"preview: " + info.fileUrl}
                <br />
                {"mapPreview: " + info.mapUrl}
            </div>
        );
    }

    class Selector extends Component<{
        names: string[];
        index: number;
        onSelect?: (id: number) => any;
    }> {
        constructor(p: any) {
            super(p);
        }
        /** 组件类别被点击 */
        select(index: number) {
            if (this.props.index === index) return;
            var fx = this.props.onSelect;
            fx ? fx(index) : null;
        }
        /**  */
        onMouseOver(e: any) {
            var style: CSSStyleDeclaration = e.target.style;
            style.color = "#7E9178";
            style.backgroundColor = "#FAE7D9";
        }
        onMouseOut(e: any) {
            var style: CSSStyleDeclaration = e.target.style;
            style.backgroundColor = "inherit";
            style.color = "#FFF";
        }

        render(): any {
            let props = this.props;

            return (
                <div
                    style={{
                        display: "flex",
                        width: "100%",
                        height: "25px",
                        backgroundColor: "#7E9178",
                    }}
                >
                    {props.names.map((val, index) => {
                        if (val.length > 26) val = val.slice(0, 23) + "..";

                        return (
                            <div
                                onMouseOver={props.index === index ? undefined : this.onMouseOver}
                                onMouseOut={props.index === index ? undefined : this.onMouseOut}
                                onClick={this.select.bind(this, index)}
                                key={val}
                                style={{
                                    padding: "0 5px",
                                    flex: "1 1",
                                    color: index === props.index ? "#7E9178" : "#FFF",
                                    backgroundColor: index === props.index ? "#FAE7D9" : "inherit",
                                    fontSize: "11px",
                                    height: "100%",
                                    textAlign: "center",
                                    lineHeight: "25px",
                                    display: "inline-block",
                                    fontWeight: "bold",
                                }}
                            >
                                {val}
                            </div>
                        ) as any;
                    })}
                </div>
            );
        }
    }
    class HOME extends Component<
        {
            CPN_List: previewListItem[];
            fileInfo: FileInfo;
        },
        {
            ActiveCPN: Function;
            index: number;
        }
    > {
        readonly nameList;
        readonly cpnList;
        constructor(props: { CPN_List: previewListItem[]; fileInfo: FileInfo }) {
            super(props);
            let nameList: string[] = [];
            let cpnList: Function[] = [];
            this.nameList = nameList;
            this.cpnList = cpnList;
            for (const item of props.CPN_List) {
                nameList.push(item.name);
                cpnList.push(item.cpn);
            }

            this.state = {
                index: 0,
                ActiveCPN: cpnList[0],
            };
        }
        componentDidCatch(e: Error) {
            //组件可能存在错误无法渲染
            this.setState({
                ActiveCPN: () => <template.Error msg={"Component render error: "} error={e} />,
            });
        }

        change(index: number) {
            this.setState({ ActiveCPN: this.cpnList[index], index });
        }
        render(): React.ReactNode {
            const { ActiveCPN, index } = this.state;
            const props = this.props;
            var nameList = props.CPN_List.map((val) => val.name);
            return (
                <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <Selector names={nameList} index={index} onSelect={this.change.bind(this)} />
                    <div style={{ flex: "1 1", width: "100%" }}>
                        <ActiveCPN />
                    </div>
                </div>
            );
        }
    }

    let cpnList = getVDOMList(mod, isCpn);
    let App: JSX.Element;
    if (mod instanceof Error) {
        App = <template.Error error={mod} msg="File error:" />;
    } else if (cpnList.length) {
        App = <HOME CPN_List={cpnList} fileInfo={fileInfo} />;
    } else {
        App = <template.Null />;
    }

    return {
        App,
        template,
    };
}
