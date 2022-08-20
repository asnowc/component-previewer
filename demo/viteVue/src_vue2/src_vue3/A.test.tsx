import A from "./A";
import { defineComponent } from "vue";

export default defineComponent({
    render(h) {
        return (
            <A data1="Test case - data 1" data2="Test case - data 1" data3="Test case - data 1" bgColor="#38a99e"></A>
        );
    },
});
export var TestCase2 = defineComponent({
    render(h) {
        return (
            <A data1="Test case - data 2" data2="Test case - data 2" data3="Test case - data 2" bgColor="#38a96d"></A>
        );
    },
});
export var TestCase3 = defineComponent({
    render(h) {
        return (
            <A data1="Test case - data 3" data2="Test case - data 4" data3="Test case - data 5" bgColor="#3869a9"></A>
        );
    },
});
