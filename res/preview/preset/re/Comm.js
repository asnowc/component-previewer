var cache;
export default function (h, parent) {
    if (cache)
        return cache;
    else
        return cate(h, parent);
}
function cate(h, parent) {
    var ret = {
        NullTemplate(arg) {
            var childs = ["The selected component does not have any exports", h("br", null)];
            if (arg)
                childs.push(arg);
            return h("div", { style: { width: "100%" } }, ...childs);
        },
        ErrorTemplate(arg) {
            var childs = ["The wrong component", h("br", null)];
            if (arg)
                childs.push(arg);
            return h("div", { style: { width: "100%" } }, ...childs);
        },
        Selector: class Selector extends parent {
            /** 组件类别被点击 */
            select(index) {
                if (this.props.index === index)
                    return;
                var fx = this.props.onSelect;
                fx ? fx(index) : null;
            }
            /**  */
            onMouseOver(e) {
                var style = e.target.style;
                style.color = "#7E9178";
                style.backgroundColor = "#FAE7D9";
            }
            onMouseOut(e) {
                var style = e.target.style;
                style.backgroundColor = "inherit";
                style.color = "#FFF";
            }
            render() {
                let props = this.props;
                return (h("div", { style: {
                        display: "flex",
                        width: "100%",
                        height: "25px",
                        backgroundColor: "#7E9178",
                    } }, props.names.map((val, index) => {
                    if (val.length > 26)
                        val = val.slice(0, 23) + "..";
                    return (h("div", { onMouseOver: props.index === index ? undefined : this.onMouseOver, onMouseOut: props.index === index ? undefined : this.onMouseOut, onClick: this.select.bind(this, index), key: val, style: {
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
                        } }, val));
                })));
            }
        },
        HOME: class HOME extends parent {
            constructor(props) {
                super(props);
                var instanceList = props.instanceList;
                if (instanceList.length === 0) {
                    instanceList[0] = { name: "null", instance: ret.NullTemplate(instanceList.url) };
                }
                else
                    for (const it of instanceList) {
                        if (!it.instance)
                            it.instance = ret.ErrorTemplate(instanceList.url);
                    }
                this.state = {
                    showIndex: 0,
                };
            }
            state;
            change(index) {
                this.setState({ showIndex: index });
            }
            render() {
                const state = this.state;
                const instanceList = this.props.instanceList;
                var index = state.showIndex;
                var activeInstance = instanceList[index].instance;
                var nameList = instanceList.map(function (val) {
                    return val.name;
                });
                let Temp = ret.Selector;
                return (h("div", { style: { height: "100%", display: "flex", flexDirection: "column" } },
                    h(Temp, { names: nameList, index: index, onSelect: this.change.bind(this) }),
                    h("div", { style: { flex: "1 1", width: "100%" } }, activeInstance)));
            }
        },
    };
    return ret;
}
/** 筛选组件 */
export function getVDOMList(unk_mod, h, isCommponent, url = "unknown") {
    var mod = unk_mod;
    var Components = [];
    Components.url = url;
    var keys = Object.keys(mod);
    for (const name of keys) {
        let val = mod[name];
        let obj = { name };
        if (isCommponent(val)) {
            try {
                obj.instance = h(val);
            }
            catch (error) { }
        }
        if (name === "default")
            Components.unshift(obj);
        else
            Components.push(obj);
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
    var data = bridgeFile.default;
    var activeFile = data.activeFile.toLocaleLowerCase(); //活动文件相对路径
    var exits = "";
    {
        let x = activeFile.lastIndexOf(".");
        if (x >= 0)
            exits = activeFile.slice(x);
    }
    if (activeFile.search(/\.test\.[^\.]+$/) === -1)
        activeFile = activeFile.replace(/\.[^\.]+$/, ".test" + exits);
    return "/" + activeFile;
}
