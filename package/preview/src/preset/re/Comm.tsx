var cache: undefined | ReturnType<typeof cate>;
export default function (h: (...arg: any) => Object, parent: parentComponent) {
    if (cache) return cache;
    else return cate(h, parent);
}
type obj = {
    [key: number | string | symbol]: any;
};

type parentComponent = typeof global.React.Component;
/** 设置JSX Factory, 返回公共组件
 *  @param parent React是React.Component, Vue是模拟的Component类
 */
function cate(h: (...arg: any) => any, parent: parentComponent) {
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
        Selector: class Selector extends parent<{
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
        HOME: class HOME extends parent<{
            mod: obj;
            url: string;
            isCommponent: (cp: any) => boolean;
        }> {
            constructor(props: { mod: obj; url: string; isCommponent: (cp: any) => boolean }) {
                super(props);
                var CPN_List = getVDOMList(props.mod, props.isCommponent, props.url);
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
            state: Readonly<{
                showIndex: number;
                CPN_List: ReturnType<typeof getVDOMList>;
            }>;

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
/** 筛选组件 */
function getVDOMList(unk_mod: Object, isCommponent: (cp: any) => boolean, url = "unknown") {
    var mod: any = unk_mod;
    type modItem = { name: string; CPN?: any };
    type myArray = { url: string } & Array<modItem>;
    var Components: myArray = [] as any;
    Components.url = url;
    var keys = Object.keys(mod);

    for (const name of keys) {
        let val = mod[name];
        let obj: modItem = { name };
        if (isCommponent(val)) obj.CPN = val;

        if (name === "default") Components.unshift(obj);
        else Components.push(obj);
    }
    return Components;
}

/**
 * Vite 项目自定义显示文件
 * 你可以根据你的需求进行修改, 显示你的页面
 * @description 判断activeFile, 判断是否是.test.**结尾，如果是，直接返回 否则返回 .test.**的文件
 * @return {string} 返回要预览的文件相对URL
 */
export async function getActiveFileMap() {
    var bridgeFile = await import("../../bridge/bridgeFile");
    var data = bridgeFile.default; //这里是导出的活动文件的信息
    var activeFile = data.activeFile.toLocaleLowerCase(); //活动文件相对路径
    var exits = "";
    {
        let x = activeFile.lastIndexOf(".");
        if (x >= 0) exits = activeFile.slice(x);
    }
    //这里做了映射，你可以根据需求自己调整
    if (activeFile.search(/\.test\.[^\.]+$/) === -1) activeFile = activeFile.replace(/\.[^\.]+$/, ".test" + exits);
    return "/" + activeFile;
}
