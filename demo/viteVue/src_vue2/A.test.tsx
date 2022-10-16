import { default as A, AProps } from "./A";

export default {
    render(h) {
        let props: AProps = { bgColor: "#Ff4699", data1: "d1", data2: "d2", data3: "d3" };
        return h(A, { props }, ["sdgsagds"]);
    },
};
