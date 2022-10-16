export type AProps = {
    data1: string;
    data2: string;
    data3: string;
    bgColor: string;
};
export default {
    render(h) {
        let props: AProps = this.$attrs;
        console.log(this);
        return h(
            "table",
            {
                attrs: {
                    class: "AD",
                },
                style: {
                    backgroundColor: props.bgColor,
                    textAlign: "center",
                    color: "#333",
                    height: "100%",
                    width: "100%",
                },
            },
            [h("div", ["My name is A", h("div", [props.data1])])]
        );
    },
};
