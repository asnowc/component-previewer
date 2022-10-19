module.exports = {
    entry: "./.c_preview/main.js",
    mode: "development",
    devtool: "source-map",
    devServer: {
        static: {
            //打包的出口文件夹
            directory: "./public",
        },
        compress: false,
    },
    resolve: {
        extensions: [".js", ".ts", ".jsx", ".tsx"],
    },
    module: {
        rules: [
            // 添加解析规则
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "ts-loader",
                    },
                ],
            },
        ],
    },
    output: {
        path: __dirname + "/public",
        filename: "bundle.js",
    }
};
