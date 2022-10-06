export function prepare(
    mod: Object | undefined,
    url: string,
    ...args: Parameters<typeof cate>
): [HTMLElement, JSX.Element] {
    const comm = cate(...args);

    if (!mod) mod = { default: { default: comm.ErrorTemplate("无法加载activeModule") } };

    const App = args[0].createElement(comm.HOME as any, { mod, url });
    const root = document.createElement("div");
    document.body.appendChild(root);
    root.style.height = "100%";
    return [root, App];
}
type obj = {
    [key: number | string | symbol]: any;
};

type ParentComponent = typeof global.React.Component;
/** 设置JSX Factory, 返回公共组件
 *  @param parent React是React.Component, Vue是模拟的Component类
 */
function cate<T extends { createElement: (...arg: any) => JSX.Element; Component: ParentComponent }>(
    React: T,
    isComponent: (cp: any) => boolean
) {
    const { Component, createElement: h } = React;
    /** 筛选组件 */
    function getVDOMList(unk_mod: Object, url = "unknown") {
        var mod: any = unk_mod;
        type modItem = { name: string; CPN?: any };
        type myArray = { url: string } & Array<modItem>;
        var Components: myArray = [] as any;
        Components.url = url;
        var keys = Object.keys(mod);

        for (const name of keys) {
            let val = mod[name];
            let obj: modItem = { name };
            if (isComponent(val)) obj.CPN = val;

            if (name === "default") Components.unshift(obj);
            else Components.push(obj);
        }
        return Components;
    }
    var ret = {
        NullTemplate(arg?: string) {
            return function NullInfo() {
                var childs = ["The selected component does not have any exports", <br />];
                if (arg) childs.push(arg);
                return h("div", { style: { width: "100%" } }, ...childs) as any;
            };
        },
        ErrorTemplate(msg?: string, error?: Error) {
            return function ErrorInfo() {
                var childs = ["The wrong component", <br />];
                if (msg) childs.push(msg);
                if (error) {
                    childs.push(<div style={{ color: "red", fontSize: "12px" }}>{error.stack}</div>);
                }
                return h("div", { style: { width: "100%", whiteSpace: "pre" } }, ...childs) as any;
            };
        },
        Selector: class Selector extends Component<{
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
        },
        HOME: class HOME extends Component<
            {
                mod: obj;
                url: string;
            },
            {
                showIndex: number;
                CPN_List: ReturnType<typeof getVDOMList>;
            }
        > {
            constructor(props: { mod: obj; url: string }) {
                super(props);
                var CPN_List = getVDOMList(props.mod, props.url);
                if (CPN_List.length === 0) {
                    CPN_List[0] = { name: "null", CPN: ret.NullTemplate(CPN_List.url) };
                } else
                    for (const it of CPN_List) {
                        if (!it.CPN) it.CPN = ret.ErrorTemplate(CPN_List.url);
                    }
                this.state = {
                    showIndex: 0,
                    CPN_List,
                };
            }
            componentDidCatch(e: Error) {
                //组件可能存在错误无法渲染
                var { showIndex, CPN_List } = this.state;
                CPN_List[showIndex].CPN = ret.ErrorTemplate("Render time error: " + this.props.url, e);
                this.setState({ CPN_List });
            }

            change(index: number) {
                this.setState({ showIndex: index });
            }
            render(): React.ReactNode {
                const state = this.state;
                const CPN_List = this.state.CPN_List;
                var index = state.showIndex;
                var ActiveCPN: any = CPN_List[index].CPN!;
                var nameList = CPN_List.map(function (val) {
                    return val.name;
                });
                return (
                    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                        <ret.Selector names={nameList} index={index} onSelect={this.change.bind(this)} />
                        <div style={{ flex: "1 1", width: "100%" }}>
                            <ActiveCPN></ActiveCPN>
                        </div>
                    </div>
                ) as any;
            }
        },
    };
    return ret;
}
