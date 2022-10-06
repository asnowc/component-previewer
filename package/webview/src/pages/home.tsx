import * as React from "react";
import { IB, icon, iconStyle, UI } from "./baseUI";
import type * as MS from "../../message";
import { Setting } from "./setting";
type obj = { [key: string | number | symbol]: any };

export class Head extends React.Component implements MS.webView.msStruct {
    constructor(props: Head["props"]) {
        super(props);
    }
    readonly iframeRef = React.createRef<HTMLIFrameElement>();
    render() {
        const state = this.state;
        const { baseData } = state;
        var headHeight = 30;

        var headIBstyle = {
            cursor: "pointer",
            margin: "0 20px",
        };
        if (!baseData) return "Waiting for extension response";

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
                        <IB title={lang.刷新} style={headIBstyle}>
                            <UI.mouseOverUI MouseDownStyle={iconStyle.down}>
                                <icon.reload onClick={this.reload.bind(this)} />
                            </UI.mouseOverUI>
                        </IB>
                        <IB title={lang["自动刷新(如果web服务器支持HMR, 则不需要开启)"]} style={headIBstyle}>
                            <UI.mouseOverUI MouseDownStyle={iconStyle.down}>
                                <icon.autoReload
                                    onClick={() => this.syncBaseData("autoReload", !baseData.autoReload)}
                                    color={baseData.autoReload ? "#10cdfd" : undefined}
                                />
                            </UI.mouseOverUI>
                        </IB>
                    </div>
                    <UI.mouseOverUI
                        onClick={this.dev.bind(this, !state.showDevPanel)}
                        style={headIBstyle}
                        MouseOverStyle={iconStyle.down}
                    >
                        <b>{baseData.workspaceFolderName}</b>
                    </UI.mouseOverUI>
                    <div>
                        <IB title={lang["切换监听状态"]} style={headIBstyle}>
                            <UI.mouseOverUI MouseDownStyle={iconStyle.down}>
                                <icon.watch
                                    onClick={() => this.syncBaseData("watch", !baseData.watch)}
                                    color={baseData.watch ? "#10cdfd" : undefined}
                                />
                            </UI.mouseOverUI>
                        </IB>
                        <IB title={lang["设置"]} style={headIBstyle}>
                            <UI.mouseOverUI MouseDownStyle={iconStyle.down}>
                                <icon.setting onClick={this.setting.bind(this)} />
                            </UI.mouseOverUI>
                        </IB>
                    </div>
                </div>

                {state.showDevPanel ? (
                    <>
                        <DevPanel baseData={state.baseData!} />
                        <DevPanel baseData={state.extState} />
                    </>
                ) : (
                    <iframe
                        ref={this.iframeRef}
                        src={baseData.serverURL}
                        name="iframe_view"
                        frameBorder="0"
                        style={{ width: "100%", height: `calc(100% - ${headHeight + 5}px)` }}
                    ></iframe>
                )}
                {state.showSetting && (
                    <Setting baseData={baseData!} instance={this} onClose={this.setting.bind(this)} />
                )}
            </>
        );
    }

    state = {
        baseData: undefined as MS.baseData | undefined,
        extState: undefined as any,
        showSetting: false,
        showDevPanel: false,
    };
    private removeListenerKey = this.onMessage.bind(this);
    componentDidMount(): void {
        env.mode === "dev" && this.dev(true);

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
    setWebViewBaseData(baseData: MS.baseData) {
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
    dev(sw: boolean | Object): void {
        if (typeof sw === "boolean") this.setState({ showDevPanel: !this.state.showDevPanel });
        else this.setState({ extState: sw });
    }
    onMessage(e: MS.webView.onMsData): void {
        //收到vscode消息的钩子
        const { command, context } = e.data;
        typeof this[command] === "function" && (this[command] as Function)(...context);
    }
}

function DevPanel(props: { baseData: MS.baseData }) {
    function handelOther(str: string) {
        return typeof str === "string" ? (str === "" ? '""' : '"' + str + '"') : str;
    }
    function toString(obj: obj, p = 2) {
        if (obj === null) return obj;
        let text = "";
        if (Array.isArray(obj)) {
            let text = "[";
            if (obj.length > 1) text += "\n";
            for (const val of obj) {
                text += " ".repeat(p);
                text += typeof val === "object" ? toString(val, p + 2) : handelOther(val);
                text += ",\n";
            }
            text += "]";
            return text;
        } else {
            const keys = Object.keys(obj);
            text += "{\n";
            if (obj.length > 0) text += "\n";
            for (const it of keys) {
                text += " ".repeat(p) + it + ": ";
                const val = obj[it];
                text += typeof val === "object" ? toString(val, p + 2) : handelOther(val);
                text += "\n";
            }
            text += "}";
            return text;
        }
    }
    let text = props.baseData && toString(props.baseData).match(/^\{\n([\S\s]+)\}$/)?.[1];

    return (
        <div
            style={{
                margin: "10px",
                borderRadius: "10px",
                padding: "0 10px 10px 10px",
                border: "solid 2px #b4b66d",
                whiteSpace: "pre-wrap",
                fontSize: "12px",
                color: "#315428",
            }}
        >
            <h3 style={{ textAlign: "center" }}>Dev Mode</h3>
            <div>{text}</div>
        </div>
    );
}
