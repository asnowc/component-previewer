import * as Vue from "vue";
const h=Vue.h

type Aprops = {
    data1: string;
    data2: string;
    data3: string;
    bgColor: string;
};
export default function A(props: Aprops) {
    return (
        <table
            class="AD"
            style={{
                backgroundColor: props.bgColor,
                textAlign: "center",
                color: "white",
                height: "100%",
                width: "100%",
            }}
        >
            <th align="center">
                <td>My name is A</td>
            </th>
            <tr>
                <td>{props.data1}</td>
            </tr>
            <tr>
                <td>{props.data2}</td>
            </tr>
            <tr>
                <td>{props.data3}</td>
            </tr>
        </table>
    );
}
