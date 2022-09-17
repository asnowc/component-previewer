import * as ReactDOM from "react-dom/client";
import * as React from "react";
import { createElement, useCallback, useMemo } from "react";
import { icon, UI } from "./baseUI";
import type * as message from "./message";
import * as Ilang from "./lang";

declare namespace globalThis {
    const acquireVsCodeApi: (() => any) | undefined;
}
declare var langFlag: Ilang.langTypeList;
type obj = { [key: string | number | symbol]: any };
var postMessage: (command: keyof message.webViewContexts, context?: any) => any;
if (globalThis.acquireVsCodeApi) {
    let vscode = globalThis.acquireVsCodeApi();
    postMessage = function (command: string, context: any) {
        vscode.postMessage({ command, context });
    };
    console.log = function () {};
} else {
    var langFlag = "zh" as Ilang.langTypeList;
    //浏览器环境, 用来调试
    postMessage = function postMessage(command: string, context: any) {
        console.log("send:" + JSON.stringify({ command, context }));
    };
}

/** 设置了inline-block的div */
function IB(props: JSX.IntrinsicElements["abbr"]) {
    var nextProps = { ...props };
    const style = nextProps.style;
    if (style && !style.display) style.display = "inline-block";
    return createElement("div", props, props.children);
}

class Head extends React.Component<{ lang?: Ilang.langTypeList }> {
    constructor(props: Head["props"]) {
        super(props);
        this.state.lang = Ilang.getLang(props.lang ?? "zh");
    }
    readonly iframeRef = React.createRef<HTMLIFrameElement>();
    render() {
        const state = this.state;
        const { effect, lang } = state;
        var headHeight = 30;

        var headIBstyle = {
            cursor: "pointer",
            margin: "0 20px",
        };
        return (
            <>
                <div
                    style={{
                        height: headHeight + "px",
                        display: "flex",
                        justifyContent: "space-between",
                        backgroundColor: "#e1e1e1",
                        alignItems: "center",
                    }}
                >
                    <div>
                        <IB title="Reload" style={headIBstyle}>
                            <UI.mouseOverUI
                                Element={icon.reload}
                                MouseDownStyle={{ opacity: "0.7" }}
                                onClick={this.refesh.bind(this)}
                            ></UI.mouseOverUI>
                        </IB>
                        <IB title={lang["自动刷新(如果web服务器支持HMR, 则不需要开启)"]} style={headIBstyle}>
                            <UI.mouseOverUI
                                Element={icon.autoReload}
                                MouseDownStyle={{ opacity: "0.7" }}
                                onClick={this.changeAutoReload.bind(this)}
                                color={effect.autoReload ? "#10cdfd" : undefined}
                            ></UI.mouseOverUI>
                        </IB>
                    </div>
                    <b>{effect.workspaceFolderName}</b>
                    <div>
                        <IB title={lang["切换监听状态"]} style={headIBstyle}>
                            <UI.mouseOverUI
                                Element={icon.watch}
                                MouseDownStyle={{ opacity: "0.7" }}
                                onClick={this.changeWatch.bind(this)}
                                color={effect.watch ? "#10cdfd" : undefined}
                            ></UI.mouseOverUI>
                        </IB>
                        <IB title={lang["设置"]} style={headIBstyle}>
                            <UI.mouseOverUI
                                Element={icon.setting}
                                MouseDownStyle={{ opacity: "0.7" }}
                                onClick={this.setting.bind(this)}
                            ></UI.mouseOverUI>
                        </IB>
                    </div>
                </div>

                <iframe
                    ref={this.iframeRef}
                    src={effect.serverURL}
                    name="iframe_view"
                    frameBorder="0"
                    style={{ width: "100%", height: `calc(100% - ${headHeight + 5}px)` }}
                ></iframe>
                {state.showSetting && <Setting instance={this} onClose={this.setting.bind(this)}></Setting>}
            </>
        );
    }

    state = {
        effect: {
            serverURL: "",
            serverRootDir: "",
            watch: false,
            workspaceFolderDir: "",
            workspaceFolderName: "Unknown",
            autoReload: false,
        },
        lang: undefined as any as Ilang.LangMap,
        showSetting: false,
    };
    componentDidMount(): void {
        window.addEventListener("message", this.vscodeMessage);
        postMessage("fin");
    }
    componentWillUnmount(): void {
        window.removeEventListener("message", this.vscodeMessage);
    }

    setEffectConfi(effect: typeof this.state.effect) {
        this.setState({ effect });
    }
    refesh() {
        //刷新内联框架
        var iframe = this.iframeRef.current!;
        window.open(iframe.src, iframe.name, "");
    }
    onActiveFileChange() {
        if (this.state.effect.autoReload) this.refesh();
    }

    changeWatch() {
        const effect = this.state.effect;
        //切换监听状态并发送数据
        this.setEffectConfi({ ...effect, watch: !effect.watch });

        postMessage("watch", !effect.watch);
    }
    changeAutoReload() {
        const effect = this.state.effect;
        this.setEffectConfi({ ...effect, autoReload: !effect.autoReload });
        postMessage("autoReload", !effect.autoReload);
    }

    vsUpdate(data: any) {
        //更新数据函数, 将data对象上的数据遍历到组件实例
        Object.assign(this, data);
    }
    vscodeMessage(e: any) {
        //收到vscode消息的钩子
        let data = e.data;
        var exc: Function = (this as any)[data.command];
        if (typeof exc === "function") exc(data.arg);
    }
    setting() {
        const state = this.state;
        this.setState({ showSetting: !state.showSetting });
    }
}
function Setting(props: { instance: Head; onClose?: (...arg: any) => any }) {
    const { instance } = props;
    const { state } = instance;
    const { effect, lang } = state;

    const installDir = useMemo(
        function () {
            var dp = effect.workspaceFolderDir + "/" + (effect.serverRootDir ? effect.serverRootDir : "") + "/.preview";
            return dp.replace(/[\\/]+/g, "/");
        },
        [effect.workspaceFolderDir, effect.serverRootDir]
    );
    const install = useCallback(function () {
        postMessage("install");
    }, []);
    const updateRoot = useCallback(
        function (e: React.FocusEvent<HTMLInputElement>) {
            //根路径并发送数据
            const dom = e.target;
            var value = dom.value;
            var rootDir = effect.serverRootDir;
            if (rootDir === value) return;
            instance.setState({ serverRootDir: value });
            postMessage("updateServerRootDir", value);
        },
        [effect.serverRootDir]
    );
    const updateURL = useCallback(
        function (e: React.FocusEvent<HTMLInputElement>) {
            //更改URL并发送数据
            const dom = e.target;
            var value = dom.value;
            var url = effect.serverURL;
            if (url === value) return;
            if (!value.match(/^\w+:\/\/.+(:\d+)?$/)) dom.value = url;
            else {
                instance.setState({ serverURL: value });
                postMessage("updateURL", value);
            }
        },
        [effect.serverURL]
    );
    return (
        <div
            style={{
                height: "100%",
                width: "100%",
                backgroundColor: "rgb(0,0,0,0.6)",
                position: "absolute",
                left: "0px",
                top: "0px",
                zIndex: 999,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div
                style={{
                    backgroundColor: "#FFF",
                    width: "400px",
                    height: "500px",
                    fontSize: "12px",
                    padding: "30px",
                }}
            >
                <div style={{ height: "calc(100% - 30px)" }}>
                    <div style={{ textAlign: "center", fontSize: "24px", marginBottom: "15px" }}>
                        {effect.workspaceFolderName}
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        Server root Directory: ( Relative to the workspace folder )
                    </span>
                    <div>
                        <input
                            style={{ width: "300px", margin: "5px 0" }}
                            type="text"
                            defaultValue={effect.serverRootDir}
                            onBlur={updateRoot}
                        />
                        <IB
                            title={lang["安装"]}
                            style={{
                                position: "relative",
                                top: "7px",
                                marginLeft: "15px",
                                cursor: "pointer",
                            }}
                        >
                            <UI.mouseOverUI
                                Element={icon.install}
                                MouseDownStyle={{ opacity: "0.7" }}
                                onClick={install}
                            ></UI.mouseOverUI>
                        </IB>
                    </div>
                    {effect.workspaceFolderDir ? lang['依赖将被安装到 "'] + installDir + '"' : ""}
                    <br />
                    <br />
                    <span style={{ fontSize: "13px", fontWeight: "bold" }}>Server URL: </span>
                    <br />
                    <input
                        style={{ width: "300px", margin: "5px 0" }}
                        type="text"
                        defaultValue={effect.serverURL}
                        onBlur={updateURL}
                    />
                    <br />
                    {lang['在浏览器输入 "'] + effect.serverURL + lang['" 将自动预览组件']}
                </div>
                <UI.mouseOverUI
                    onClick={props.onClose}
                    Element={"div"}
                    style={{
                        width: "70px",
                        height: "30px",
                        lineHeight: "30px",
                        fontSize: "20px",
                        float: "right",
                        border: "2px solid",
                        borderRadius: "25px",
                        textAlign: "center",
                        cursor: "pointer",
                    }}
                    MouseOverStyle={{
                        opacity: "0.8",
                    }}
                >
                    {lang["关闭"]}
                </UI.mouseOverUI>
            </div>
        </div>
    );
}

var div = document.createElement("div");
div.style.height = "100%";
div.style.backgroundColor = "#FFF";
div.style.color = "#000";
document.body.appendChild(div);

ReactDOM.createRoot(div).render(<Head lang={langFlag} />);
