import * as ReactDOM from "react-dom/client";
import * as React from "react";
import { createElement, useCallback, useMemo } from "react";
import { icon, UI } from "./baseUI";

declare function acquireVsCodeApi(): any;
type obj = { [key: string | number | symbol]: any };
var vscode: any;
try {
    let warn = console.warn;
    console.warn = function (e) {
        if (
            e !==
            "[Vue warn]: Non-function value encountered for default slot. Prefer function slots for better performance."
        )
            warn(e);
    };
    vscode = acquireVsCodeApi();
    console.log = function () {};
} catch (error) {
    //浏览器环境, 用来调试
    vscode = {
        postMessage(data: any) {
            console.log("send:" + JSON.stringify(data));
        },
    };
}

/** 设置了inline-block的div */
function IB(props: JSX.IntrinsicElements["abbr"]) {
    var nextProps = { ...props };
    const style = nextProps.style;
    if (style && !style.display) style.display = "inline-block";
    return createElement("div", props, props.children);
}

class Head extends React.Component {
    constructor(props: {}) {
        super(props);
    }
    readonly iframeRef = React.createRef<HTMLIFrameElement>();
    render() {
        const state = this.state;
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
                        <IB
                            title="Auto reload ( If your Web server supports Hot Module Replacement, it is recommended to keep it turned off )"
                            style={headIBstyle}
                        >
                            <UI.mouseOverUI
                                Element={icon.autoReload}
                                MouseDownStyle={{ opacity: "0.7" }}
                                onClick={this.changeAutoReload.bind(this)}
                                color={state.autoReload ? "#10cdfd" : undefined}
                            ></UI.mouseOverUI>
                        </IB>
                    </div>
                    <b>{state.workspaceFolderName}</b>
                    <div>
                        <IB title="toggle watch" style={headIBstyle}>
                            <UI.mouseOverUI
                                Element={icon.watch}
                                MouseDownStyle={{ opacity: "0.7" }}
                                onClick={this.changeWatch.bind(this)}
                                color={state.watch ? "#10cdfd" : undefined}
                            ></UI.mouseOverUI>
                        </IB>
                        <IB title="setting" style={headIBstyle}>
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
                    src={state.serverURL}
                    name="iframe_view"
                    frameBorder="0"
                    style={{ width: "100%", height: `calc(100% - ${headHeight + 5}px)` }}
                ></iframe>
                {state.showSetting ? (
                    <Setting setState={this.setState.bind(this)} state={this.state} onClose={this.setting.bind(this)}></Setting>
                ) : undefined}
            </>
        );
    }
    componentDidMount(): void {
        window.addEventListener("message", this.vscodeMessage);
        vscode.postMessage({ command: "fin" });
    }
    componentWillUnmount(): void {
        window.removeEventListener("message", this.vscodeMessage);
    }
    state: Readonly<{
        serverURL: string;
        serverRootDir: string;
        watch: boolean;
        showSetting: boolean;
        workspaceFolderDir: string;
        workspaceFolderName: string;
        autoReload: boolean;
    }> = {
        serverURL: "",
        serverRootDir: "",
        watch: false,
        showSetting: false,
        workspaceFolderDir: "",
        workspaceFolderName: "Unknown",
        autoReload: false,
    };
    refesh() {
        //刷新内联框架
        var iframe = this.iframeRef.current!;
        window.open(iframe.src, iframe.name, "");
    }
    onActiveFileChange() {
        if (this.state.autoReload) this.refesh();
    }

    changeWatch() {
        const state = this.state;
        //切换监听状态并发送数据
        this.setState({ watch: !state.watch });

        vscode.postMessage({
            command: "watch",
            context: !state.watch,
        });
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
    changeAutoReload() {
        const state = this.state;
        this.setState({ autoReload: !state.autoReload });
    }
}

function Setting(props: {
    state: Head["state"];
    setState: (data: Partial<Head["state"]>) => any;
    onClose?: (...arg: any) => any;
}) {
    const { state, setState } = props;

    const installDir = useMemo(
        function () {
            var dp = state.workspaceFolderDir + "/" + (state.serverRootDir ? state.serverRootDir : "") + "/.preview";
            return dp.replace(/[\\/]+/g, "/");
        },
        [state.workspaceFolderDir, state.serverRootDir]
    );
    const install = useCallback(function () {
        vscode.postMessage({ command: "install" });
    }, []);
    const updateRoot = useCallback(function (e: React.FocusEvent<HTMLInputElement>) {
        //根路径并发送数据
        const dom = e.target;
        var value = dom.value;
        var rootDir = state.serverRootDir;
        if (rootDir === value) return;
        setState({ serverRootDir: value });
        vscode.postMessage({
            command: "updateServerRootDir",
            context: value,
        });
    }, []);
    const updateURL = useCallback(function (e: React.FocusEvent<HTMLInputElement>) {
        //更改URL并发送数据
        const dom = e.target;
        var value = dom.value;
        var url = state.serverURL;
        if (url === value) return;
        if (!value.match(/^\w+:\/\/.+(:\d+)?$/)) dom.value = url;
        else {
            setState({ serverURL: value });
            vscode.postMessage({
                command: "updateURL",
                context: value,
            });
        }
    }, []);
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
                        {state.workspaceFolderName}
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        Server root Directory: ( Relative to the workspace folder )
                    </span>
                    <div>
                        <input
                            style={{ width: "300px", margin: "5px 0" }}
                            type="text"
                            defaultValue={state.serverRootDir}
                            onBlur={updateRoot}
                        />
                        <IB
                            title="install"
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
                    {state.workspaceFolderDir ? `Dependency packages will be installed to "${installDir}"` : ""}
                    <br />
                    <br />
                    <span style={{ fontSize: "13px", fontWeight: "bold" }}>Server URL: </span>
                    <br />
                    <input
                        style={{ width: "300px", margin: "5px 0" }}
                        type="text"
                        defaultValue={state.serverURL}
                        onBlur={updateURL}
                    />
                    <br />
                    Enter "{state.serverURL}" in the browser to automatically preview the components
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
                    Close
                </UI.mouseOverUI>
            </div>
        </div>
    );
}

/* 消息事件:
            message:

            发送:
                command="watch", {context:"watch"|"unwatch"}
                command="updateURL", {context:string}
                command="updateRootDir",{context:string}
        */
// function KD(props: Vue.HTMLAttributes, { slots }: Vue.SetupContext) {
//     return <div>{slots?slots:["dsg"]}</div>;
// }

var div = document.createElement("div");
div.style.height = "100%";
div.style.backgroundColor = "#FFF";
div.style.color = "#000";
document.body.appendChild(div);

ReactDOM.createRoot(div).render(<Head />);
