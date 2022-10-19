import * as React from "react";
const h = React.createElement;
type Aprops = {
    data1: string;
    data2: string;
    data3: string;
    bgColor: string;
};
document.styleSheets[0].insertRule(`
td:hover {
    background-color: rgb(101, 188, 188);
}`);
export default function A(props: Aprops) {
    return (
        <table
            className="AD"
            style={{
                backgroundColor: props.bgColor,
                textAlign: "center",
                color: "white",
                height: "100%",
                width: "100%",
            }}
        >
            <thead>
                <tr>
                    <th align="center">My name is A</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{props.data1}</td>
                </tr>
                <tr>
                    <td>{props.data2}</td>
                </tr>
                <tr>
                    <td>{props.data3}</td>
                </tr>
            </tbody>
        </table>
    );
}
