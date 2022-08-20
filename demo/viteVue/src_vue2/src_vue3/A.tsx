import { defineComponent } from "vue";
export default defineComponent({
    props: ["data1", "data2", "data3", "bgColor"],
    render(h) {
        var props = this.$props;
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
    },
});
