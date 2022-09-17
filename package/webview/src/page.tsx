import * as ReactDOM from "react-dom/client";
import * as React from "react";
import { createElement, useCallback, useMemo } from "react";
import { icon, UI } from "./baseUI";
import type * as MS from "./message";
import * as Ilang from "./lang";

declare namespace globalThis {
    const acquireVsCodeApi: (() => any) | undefined;
}
declare var langFlag: Ilang.langTypeList;
type obj = { [key: string | number | symbol]: any };
var vscode: { postMessage(data: MS.ext.onMsData): void };
if (globalThis.acquireVsCodeApi) {
    vscode = globalThis.acquireVsCodeApi();
    console.log = function () {};
} else {
    var langFlag = "zh" as Ilang.langTypeList;
    //浏览器环境, 用来调试
    vscode = {
        postMessage(data: MS.ext.onMsData) {
            console.log(data.command + ": " + JSON.stringify(data.context));
        },
    };

    setTimeout(() => {
        const e = new MessageEvent("message", {
            data: {
                command: "initBaseData",
                context: [
                    {
                        serverURL: "",
                        serverRootDir: "",
                        watch: false,
                        workspaceFolderDir: "",
                        workspaceFolderName: "Unknown",
                        autoReload: false,

                        watchFileRegExp: "",
                        mapFileReplaceRegExp: "",
                    } as MS.baseData,
                ],
            },
        });
        window.dispatchEvent(e);
    }, 500);
}

/** 设置了inline-block的div */
function IB(props: JSX.IntrinsicElements["abbr"]) {
    var nextProps = { ...props };
    const style = nextProps.style;
    if (style && !style.display) style.display = "inline-block";
    return createElement("div", props, props.children);
}

class Head extends React.Component<{ lang?: Ilang.langTypeList }> implements MS.webView.msStruct {
    constructor(props: Head["props"]) {
        super(props);
        this.state.lang = Ilang.getLang(props.lang ?? "zh");
    }
    readonly iframeRef = React.createRef<HTMLIFrameElement>();
    render() {
        const state = this.state;
        const { baseData, lang } = state;
        var headHeight = 30;

        var headIBstyle = {
            cursor: "pointer",
            margin: "0 20px",
        };
        return (
            <>
                {baseData && (
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
                                        onClick={this.reload.bind(this)}
                                    ></UI.mouseOverUI>
                                </IB>
                                <IB title={lang["自动刷新(如果web服务器支持HMR, 则不需要开启)"]} style={headIBstyle}>
                                    <UI.mouseOverUI
                                        Element={icon.autoReload}
                                        MouseDownStyle={{ opacity: "0.7" }}
                                        onClick={() => this.syncBaseData("autoReload", !baseData.autoReload)}
                                        color={baseData.autoReload ? "#10cdfd" : undefined}
                                    ></UI.mouseOverUI>
                                </IB>
                            </div>
                            <b>{baseData.workspaceFolderName}</b>
                            <div>
                                <IB title={lang["切换监听状态"]} style={headIBstyle}>
                                    <UI.mouseOverUI
                                        Element={icon.watch}
                                        MouseDownStyle={{ opacity: "0.7" }}
                                        onClick={() => this.syncBaseData("watch", !baseData.watch)}
                                        color={baseData.watch ? "#10cdfd" : undefined}
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
                            src={baseData.serverURL}
                            name="iframe_view"
                            frameBorder="0"
                            style={{ width: "100%", height: `calc(100% - ${headHeight + 5}px)` }}
                        ></iframe>
                    </>
                )}
                {state.showSetting && (
                    <Setting baseData={baseData!} instance={this} onClose={this.setting.bind(this)}></Setting>
                )}
            </>
        );
    }

    state = {
        baseData: undefined as MS.baseData | undefined,
        lang: undefined as any as Ilang.LangMap,
        showSetting: false,
    };
    private removeListenerKey = this.onMessage.bind(this);
    componentDidMount(): void {
        window.addEventListener("message", this.removeListenerKey);
        this.sendMessage("sendBaseData");
    }
    componentWillUnmount(): void {
        window.removeEventListener("message", this.removeListenerKey);
    }
    setting() {
        const state = this.state;
        this.setState({ showSetting: !state.showSetting });
    }
    /** 更新并同步到vscode插件 */
    syncBaseData<T extends keyof MS.baseData>(dataName: T, val: MS.baseData[T]) {
        this.updateBaseData(dataName, val);
        this.sendMessage("updateBaseData", dataName, val);
    }
    /** 仅更新 */
    updateBaseData<T extends keyof MS.baseData>(dataName: T, val: MS.baseData[T]) {
        const baseData = { ...this.state.baseData };
        baseData[dataName] = val;
        this.setState({ baseData });
    }

    /** 初始化baseData */
    initBaseData(baseData: MS.baseData) {
        this.setState({ baseData });
    }
    sendMessage<T extends MS.ext.commands>(command: T, ...context: MS.ext.context<T>): void {
        vscode.postMessage({ command, context } as MS.ext.onMsData);
    }
    /** 刷新内联框架 */
    reload() {
        var iframe = this.iframeRef.current!;
        window.open(iframe.src, iframe.name, "");
    }
    onActiveFileChange() {
        if (this.state.baseData?.autoReload) this.reload();
    }
    onMessage(e: MS.webView.onMsData): void {
        //收到vscode消息的钩子
        const { command, context } = e.data;
        typeof this[command] === "function" && (this[command] as Function)(...context);
    }
}
function Setting(props: { baseData: MS.baseData; instance: Head; onClose?: (...arg: any) => any }) {
    const { instance, baseData } = props;
    const { state } = instance;
    const { lang } = state;

    const installDir = useMemo(
        function () {
            var dp =
                baseData.workspaceFolderDir +
                "/" +
                (baseData.serverRootDir ? baseData.serverRootDir : "") +
                "/.preview";
            return dp.replace(/[\\/]+/g, "/");
        },
        [baseData.workspaceFolderDir, baseData.serverRootDir]
    );
    const install = useCallback(function () {
        postMessage("install", undefined);
    }, []);
    const updateRoot = useCallback(
        function (e: React.FocusEvent<HTMLInputElement>) {
            //根路径并发送数据
            const dom = e.target;
            var value = dom.value;
            var rootDir = baseData.serverRootDir;
            if (rootDir === value) return;
            instance.syncBaseData("serverRootDir", value);
        },
        [baseData.serverRootDir, instance]
    );
    const updateURL = useCallback(
        function (e: React.FocusEvent<HTMLInputElement>) {
            //更改URL并发送数据
            const dom = e.target;
            var value = dom.value;
            var url = baseData.serverURL;
            if (url === value) return;
            if (!value.match(/^\w+:\/\/.+(:\d+)?$/)) dom.value = url;
            else instance.syncBaseData("serverURL", value);
        },
        [baseData.serverURL, instance]
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
                        {baseData.workspaceFolderName}
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                        Server root Directory: ( Relative to the workspace folder )
                    </span>
                    <div>
                        <input
                            style={{ width: "300px", margin: "5px 0" }}
                            type="text"
                            defaultValue={baseData.serverRootDir}
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
                    {baseData.workspaceFolderDir ? lang['依赖将被安装到 "'] + installDir + '"' : ""}
                    <br />
                    <br />
                    <span style={{ fontSize: "13px", fontWeight: "bold" }}>Server URL: </span>
                    <br />
                    <input
                        style={{ width: "300px", margin: "5px 0" }}
                        type="text"
                        defaultValue={baseData.serverURL}
                        onBlur={updateURL}
                    />
                    <br />
                    {lang['在浏览器输入 "'] + baseData.serverURL + lang['" 将自动预览组件']}
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
