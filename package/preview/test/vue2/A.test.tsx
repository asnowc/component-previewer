import * as Vue from "vue";

const h = Vue.h;
// const h = React.createElement;
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
function A(props: Aprops) {
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

// const h = React.createElement

export default function TestCase1() {
    return h("div", null, "sdjghjksdhgj");
    // return <A data1="Test case - data 1" data2="Test case - data 1" data3="Test case - data 1" bgColor="#38a99e"></A>;
}
export function TestCase2() {
    return <A data1="Test case - data 2" data2="Test case - data 2" data3="Test case - data 2" bgColor="#38a96d"></A>;
}
export function TestCase3() {
    return <A data1="Test case - data 3" data2="Test case - data 4" data3="Test case - data 5" bgColor="#3869a9"></A>;
}
