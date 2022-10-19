import * as ReactDOM from "react-dom/client";
import * as React from "react";
import { default as CPN } from "./src/B";

var root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<CPN data1="测试文本"></CPN>);

