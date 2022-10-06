import * as React from "react";
import { useCallback, useMemo } from "react";
import { iconStyle, UI } from "./baseUI";
import type * as MS from "../../message";
import { Head } from "./home";

export function Setting(props: { baseData: MS.baseData; instance: Head; onClose?: (...arg: any) => any }) {
    const { instance, baseData } = props;
    const { workspaceFolderDir, previewFolderRelPath } = baseData;

    const installDir = useMemo(
        function () {
            var dp = workspaceFolderDir + "/" + (previewFolderRelPath ? previewFolderRelPath+"/.c_preview" : "");
            return dp.replace(/[\\/]+/g, "/");
        },
        [workspaceFolderDir, previewFolderRelPath]
    );
    const updateRoot = useCallback(
        function (e: React.FocusEvent<HTMLInputElement>) {
            //根路径并发送数据
            const dom = e.target;
            var value = dom.value;
            var rootDir = previewFolderRelPath;
            if (rootDir === value) return;
            instance.syncBaseData("previewFolderRelPath", value);
        },
        [previewFolderRelPath, instance]
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
                        {lang["预览文件夹目录"] + lang["（相对于工作区文件夹）"]}
                    </span>
                    <div>
                        <input
                            style={{ width: "300px", margin: "5px 0" }}
                            type="text"
                            defaultValue={previewFolderRelPath}
                            onBlur={updateRoot}
                        />
                    </div>
                    {lang['依赖将被安装到 "'] + installDir + '"'}
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
                <UI.mouseOverUI MouseOverStyle={iconStyle.down}>
                    <div
                        onClick={props.onClose}
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
                    >
                        {lang["关闭"]}
                    </div>
                </UI.mouseOverUI>
            </div>
        </div>
    );
}
