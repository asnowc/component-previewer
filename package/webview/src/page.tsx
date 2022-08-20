import { h, Fragment, defineComponent, DefineComponent, PropType } from "vue";
import * as Vue from "vue";
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
function IB(props: Vue.HTMLAttributes, { slots }: Vue.SetupContext) {
    var style = props.style as any;
    if (style && !style.display) style.display = "inline-block";
    else props = Object.assign({ style: { display: "inline-block" } }, props);
    return h("div", props, {
        default() {
            return slots;
        },
    });
}

const Head = defineComponent({
    data() {
        return {
            serverURL: "",
            serverRootDir: "",
            watch: false,
            showSetting: false,
            workspaceFolderDir: "",
            workspaceFolderName: "Unknown",
            autoReload: false,
        };
    },
    methods: {
        refesh() {
            //刷新内联框架
            var iframe = this.$refs["ifreme"] as HTMLIFrameElement;
            window.open(iframe.src, iframe.name, "");
        },
        onActiveFileChange() {
            if (this.autoReload) this.refesh();
        },
        updateRoot(e: Event) {
            //根路径并发送数据
            const dom = e.target! as HTMLInputElement;
            var value = dom.value;
            var rootDir = this.serverRootDir;
            if (rootDir === value) return;
            this.serverRootDir = value;
            vscode.postMessage({
                command: "updateServerRootDir",
                context: value,
            });
        },
        updateURL(e: Event) {
            //更改URL并发送数据
            const dom = e.target! as HTMLInputElement;
            var value = dom.value;
            var url = this.serverURL;
            if (url === value) return;
            if (!value.match(/^\w+:\/\/.+(:\d+)?$/)) dom.value = url;
            else {
                this.serverURL = value;
                vscode.postMessage({
                    command: "updateURL",
                    context: value,
                });
            }
        },
        install() {
            vscode.postMessage({ command: "install" });
        },

        changeWatch(e: Event) {
            //切换监听状态并发送数据
            this.watch = !this.watch;

            vscode.postMessage({
                command: "watch",
                context: this.watch,
            });
        },

        vsUpdate(data: any) {
            //更新数据函数, 将data对象上的数据遍历到组件实例
            Object.assign(this, data);
        },
        vscodeMessage(e: any) {
            //收到vscode消息的钩子
            let data = e.data;
            var exc: Function = this[data.command] as any;
            if (typeof exc === "function") exc(data.arg);
        },
        setting(e: Event) {
            this.showSetting = !this.showSetting;
        },
        changeAutoReload() {
            this.autoReload = !this.autoReload;
        },
    },
    computed: {
        installDir() {
            var dp = this.workspaceFolderDir + "/" + (this.serverRootDir ? this.serverRootDir : "") + "/.preview";
            return dp.replace(/[\\/]+/g, "/");
        },
    },
    mounted() {
        window.addEventListener("message", this.vscodeMessage);
        vscode.postMessage({ command: "fin" });
    },
    unmounted() {
        window.removeEventListener("message", this.vscodeMessage);
    },

    render() {
        var headHeight = 30;
        <div style={{}}></div>;

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
                                onClick={this.refesh}
                            ></UI.mouseOverUI>
                        </IB>
                        <IB
                            title="Auto reload ( If your Web server supports Hot Module Replacement, it is recommended to keep it turned off )"
                            style={headIBstyle}
                        >
                            <UI.mouseOverUI
                                Element={icon.autoReload}
                                MouseDownStyle={{ opacity: "0.7" }}
                                onClick={this.changeAutoReload}
                                color={this.autoReload ? "#10cdfd" : undefined}
                            ></UI.mouseOverUI>
                        </IB>
                    </div>
                    <b>{this.workspaceFolderName}</b>
                    <div>
                        <IB title="toggle watch" style={headIBstyle}>
                            <UI.mouseOverUI
                                Element={icon.watch}
                                MouseDownStyle={{ opacity: "0.7" }}
                                onClick={this.changeWatch}
                                color={this.watch ? "#10cdfd" : undefined}
                            ></UI.mouseOverUI>
                        </IB>
                        <IB title="setting" style={headIBstyle}>
                            <UI.mouseOverUI
                                Element={icon.setting}
                                MouseDownStyle={{ opacity: "0.7" }}
                                onClick={this.setting}
                            ></UI.mouseOverUI>
                        </IB>
                    </div>
                </div>

                <iframe
                    ref="ifreme"
                    src={this.serverURL}
                    name="iframe_view"
                    frameborder="0"
                    style={{ width: "100%", height: `calc(100% - ${headHeight + 5}px)` }}
                ></iframe>
                {this.showSetting ? (
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
                                    {this.workspaceFolderName}
                                </div>
                                <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                                    Server root Directory: ( Relative to the workspace folder )
                                </span>
                                <div>
                                    <input
                                        style={{ width: "300px", margin: "5px 0" }}
                                        type="text"
                                        value={this.serverRootDir}
                                        onBlur={this.updateRoot}
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
                                            onClick={this.install}
                                        ></UI.mouseOverUI>
                                    </IB>
                                </div>
                                {this.workspaceFolderDir
                                    ? `Dependency packages will be installed to "${this.installDir}"`
                                    : ""}
                                <br />
                                <br />
                                <span style={{ fontSize: "13px", fontWeight: "bold" }}>Server URL: </span>
                                <br />
                                <input
                                    style={{ width: "300px", margin: "5px 0" }}
                                    type="text"
                                    value={this.serverURL}
                                    onBlur={this.updateURL}
                                />
                                <br />
                                Enter "{this.serverURL}" in the browser to automatically preview the components
                            </div>
                            <UI.mouseOverUI
                                onClick={this.setting}
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
                ) : undefined}
            </>
        );
    },
});
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

Vue.createApp(<Head></Head>).mount(div);
