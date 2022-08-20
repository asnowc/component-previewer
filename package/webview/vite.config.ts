import { defineConfig } from "vite";

export default defineConfig({
    define: {
        "process.env": {},
    },
    build: {
        outDir: "../../res/webview",
        lib: {
            entry: "src/page.tsx",
            formats: ["es"],
            name: "mylib",
            fileName: (format) => `index.js`,
        },
        sourcemap: false,
        minify: false,
    },
});
