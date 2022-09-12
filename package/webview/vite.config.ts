import { defineConfig } from "vite";
import path from "node:path";
import url from "node:url";

const pjDir = path.resolve(url.fileURLToPath(import.meta.url), "..");

export default defineConfig({
    root: "./",
    define: {
        "process.env": {},
    },
    build: {
        outDir: path.resolve(pjDir, "../../out/res/webview"),
        lib: {
            entry: path.resolve(pjDir, "src/page.tsx"),
            formats: ["es"],
            name: "mylib",
            fileName: (format) => `index.js`,
        },
        sourcemap: false,
        minify: false,
    },
});
