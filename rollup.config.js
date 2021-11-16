import {terser} from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import polyfillNode from 'rollup-plugin-polyfill-node';
import styles from "rollup-plugin-styles";
import fs from 'fs';
import * as path from "path";


function fileTree(dir, files = []) {
    const ps = fs.readdirSync(dir);
    for (const p of ps) {
        const fp = path.posix.join(dir, p);
        fs.statSync(fp).isDirectory() ?
            fileTree(path.posix.join(dir, p), files) :
            /\.model\d?\.json/.test(fp) ? files.push(fp) : undefined;
    }
    return files;
}

const models = fileTree("public/models").map(it => ({
    key: it.split("/").pop().replace(/\.model\d?\.json/, ""),
    value: it,
    inner: true
}));
fs.writeFileSync("src/models.js", "export default " + JSON.stringify(models) + ";");

// 移除插件对live2d runtime的校验
function removePLDRuntimeCheck() {
    return {
        name: 'remove-PLD-runtime-check',
        transform(code) {
            if (code && (code.indexOf("!window.Live2DCubismCore") > 0 || code.indexOf("!window.Live2D") > 0)) {
                return code.replace("!window.Live2DCubismCore", "false").replace("!window.Live2D", "false");
            }
            return code;
        }
    };
}

export default function () {
    return {
        input: 'src/index.js',
        output: {
            file: 'public/bundle.min.js',
            format: 'iife',
            plugins: [terser()]
        },
        plugins: [
            removePLDRuntimeCheck(),
            commonjs(),
            resolve({
                browser: true,
                preferBuiltins: false,
            }),
            polyfillNode(),
            babel({
                babelHelpers: "runtime",
                skipPreflightCheck: true,
            }),
            styles({
                minimize: true,
            }),
        ]
    }
};