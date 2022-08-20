import A from "./A";
import * as Vue from "vue";
const h=Vue.h

export default function TestCase1() {
    return <A data1="Test case - data 1" data2="Test case - data 1" data3="Test case - data 1" bgColor="#38a99e"></A>;
}
export function TestCase2() {
    return <A data1="Test case - data 2" data2="Test case - data 2" data3="Test case - data 2" bgColor="#38a96d"></A>;
}
export function TestCase3() {
    return <A data1="Test case - data 3" data2="Test case - data 4" data3="Test case - data 5" bgColor="#3869a9"></A>;
}
