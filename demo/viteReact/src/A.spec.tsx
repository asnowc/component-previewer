import A from "./A";
import * as React from "react";
const h = React.createElement;

export default function TestCase1() {
    return <A data1="Test case 1 - data 1" data2="Test case 1 - data 1" data3="Test case 1 - data 3" bgColor="#38a99e"></A>;
}
export function TestCase2() {
    return <A data1="Test case 2 - data 4" data2="Test case 2 - data 5" data3="Test case 2 - data 6" bgColor="#38a96d"></A>;
}
export function TestCase3() {
    return <A data1="Test case 3 - data 7" data2="Test case 3 - data 8" data3="Test case 3 - data 9" bgColor="#3869a9"></A>;
}
